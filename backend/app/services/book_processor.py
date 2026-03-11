import os
from app.parsers.epub import Epub
from app.services.celery_worker import celery_app
from app.nlp.ner import EntityExtractor
from app.nlp.plot_sentiment import PlotSentiment
from app.services.task_states import TaskState
from app.llm.gemini import Gemini   
# from parsers.epub import Epub
# from services.celery_worker import celery_app
# from nlp.ner import EntityExtractor
# from nlp.plot_sentiment import PlotSentiment
# from services.task_states import TaskState
# from llm.gemini import Gemini
from .db_helper import save_analysis_to_db

book_path = os.path.join(os.path.dirname(__file__), "..", "temp", "aaiw.epub")

@celery_app.task(bind=True)
def process_epub(self, book_path) -> Epub:
    try:
        if not os.path.exists(book_path):
            raise FileNotFoundError(f"File not found: {book_path}")

        book: Epub = Epub(book_path)
        self.update_state(
            state=TaskState.PROCESSING, meta={"status": "Processing novel..."}
        )

        return book
    except Exception as e:
        print(f"Error processing {book_path}: {str(e)}")
    finally:
        if os.path.exists(book_path):
            try:
                os.remove(book_path)
                print(f"Cleaned up file: {book_path}")
            except Exception as e:
                print(f"Failed to delete {book_path}: {str(e)}")


@celery_app.task(bind=True)
def process_text(self, book_path):
    ps: PlotSentiment = PlotSentiment()

    self.update_state(state="PROCESSING", meta={"status": "Parsing book..."})

    book = Epub(book_path)
    title = book.title
    author = book.author
    cover = book.cover

    self.update_state(state="PROCESSING", meta={"status": "Extracting quotes..."})

    text = book.get_full_text()
    full_text_words = book.get_full_text_word_list()
    quotes = book.get_full_text_quotes(text)

    self.update_state(state="PROCESSING", meta={"status": "Identifying characters..."})

    er: EntityExtractor = EntityExtractor("en_core_web_trf", text)
    g: Gemini = Gemini()

    self.update_state(state="PROCESSING", meta={"status": "Associating quotes with characters..."})
    
    associated_quotes = er.associate_text_quotes(quotes)

    self.update_state(state="PROCESSING", meta={"status": "Building social network..."})

    nw = er.build_conversational_network(associated_quotes)
    nw_nodes = er.get_nodes_from_network_dict(nw)

    characters = er.get_persons_from_text()
    characters = [{"id": i, "name": name} for i, name in enumerate(characters)]

    self.update_state(state="PROCESSING", meta={"status": "Analysing plot data..."})

    character_to_character_sentiment_dict = er.build_sentiment_dict_from_network(
        nw_dict=nw
    )

    sentiment_values = ps.get_section_valence(full_text_words)
    inflection_points = ps.first_difference(sentiment_values)

    summarisation_texts = ps.get_text_for_summarization(text, inflection_points, len(sentiment_values))

    self.update_state(state="PROCESSING", meta={"status": "Generating character summaries..."})

    top_relationships_dict = {}
    top_quotes = {}
    for character in characters:
        name = character["name"]
        top_relationships_dict[name] = er.get_top_relationships(nw, name) 
        top_quotes[name] = er.get_character_quotes(
            nw, name
        )

    character_summaries = get_character_summaries(er, characters, nw, g, book.title)
    plot_summaries = get_plot_summaries(g, summarisation_texts)

    mapping = er.persons_to_id()

    novel_id = save_analysis_to_db(
        title=title,
        author=author,
        characters=characters,
        quotes=associated_quotes,
        network=nw_nodes,
        summaries={},
        char_mapping=mapping,
        top_relationships=top_relationships_dict,
        top_quotes=top_quotes,
        sentiment_values=sentiment_values,
        inflection_points=inflection_points,
        plot_summaries=[],
        has_cover=cover is not None,
        character_to_character_sentiment=character_to_character_sentiment_dict
    )

    cover_url = book.write_cover(cover, novel_id)

    return {
        "novel_id": novel_id,
        "network": nw_nodes,
        "characters": characters,
        "associated_quotes": associated_quotes,
        "top_relationships": top_relationships_dict,
        "sentiment_values": sentiment_values,
        "inflection_points": inflection_points,
        "plot_summaries": {},
        "cover_url": cover_url,
        "character_sentiment": character_to_character_sentiment_dict
    }
        

def get_character_summaries(er: EntityExtractor, characters: list[dict], nw_dict, g: Gemini, title):
    associated_quotes_obj_list = {}
    for character in characters:
        char_quotes = er.get_character_quotes(
            nw_dict=nw_dict,
            character=str(character["name"]),
            n=20,
            sentiment_descending=True,
            sentiment_boundary=0.0,
            length_descending=True,
            min_quote_len=10,
        )
        associated_quotes_obj_list[character["id"]] = char_quotes
    character_summaries = g.character_summary_mass_prompt(
        "gemini-2.5-flash",
        characters,
        associated_quotes_obj_list,
        "character_summary",
        title
    )
    return character_summaries

def get_plot_summaries(g: Gemini, summarisation_texts: list[str]):
    plot_summaries = g.text_span_summary_mass_prompt(
        "gemini-2.5-flash",
        summarisation_texts,
        "excerpt_summary"
    )
    return plot_summaries
