import os
from parsers.epub import Epub
from services.celery_worker import celery_app
from nlp.ner import EntityExtractor
from nlp.plot_sentiment import PlotSentiment
from services.task_states import TaskState
from llm.gemini import Gemini
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

    self.update_state(state="PROCESSING", meta={"status": "Extracting quotes..."})

    text = book.get_full_text()
    quotes = book.get_full_text_quotes(text)

    self.update_state(state="PROCESSING", meta={"status": "Identifying entities..."})

    er: EntityExtractor = EntityExtractor("en_core_web_trf", text)
    g: Gemini = Gemini()

    self.update_state(state="PROCESSING", meta={"status": "Associating quotes with entities..."})
    
    associated_quotes = er.associate_text_quotes(quotes)

    self.update_state(state="PROCESSING", meta={"status": "Building social network..."})

    nw = er.build_conversational_network(associated_quotes)

    characters = er.get_persons_from_text()
    characters = [{"id": i, "name": name} for i, name in enumerate(characters)]

    self.update_state(state="PROCESSING", meta={"status": "Generating character summaries..."})

    # summaries = get_character_summaries(er, characters, nw, g, book.title)
    
    mapping = er.persons_to_id()

    novel_id = save_analysis_to_db(
        title=title,
        author=author,
        characters=characters,
        quotes=associated_quotes,
        network=nw,
        char_mapping=mapping
    )

    return {"novel_id": novel_id, "network": nw, "characters": characters, "quotes": quotes}
        

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
