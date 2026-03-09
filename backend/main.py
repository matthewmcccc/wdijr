from collections import defaultdict
import io
import json
from pathlib import Path
from app.parsers.epub import Epub
from app.nlp.ner import EntityExtractor
from app.nlp.plot_sentiment import PlotSentiment
from app.llm.gemini import Gemini
from app.services.book_processor import process_text

if __name__ == "__main__":
    book_path = Path("./app/temp/aaiw.epub")
    book = Epub(book_path)
    full_text_words = book.get_full_text_word_list()
    text = book.get_full_text()
    ps: PlotSentiment = PlotSentiment()
    er: EntityExtractor = EntityExtractor("en_core_web_trf", text)
    # g: Gemini = Gemini()
    quotes = book.get_full_text_quotes(text)
    associated_quotes = er.associate_text_quotes(quotes)
    nw_dict = er.build_conversational_network(associated_quotes)
    valence_vals = ps.get_section_valence(full_text_words)
    peak_points = ps.first_difference(valence_vals)
    print(valence_vals, peak_points)
    # characters = er.get_all_characters(nw_dict)
    # characters = [{"id": i, "name": name} for i, name in enumerate(characters)]
    # top_relationships_dict = {}
    # for character in characters:
    #     name = character["name"]
    #     top_relationships = er.get_top_relationships(nw_dict, name)
    #     top_relationships_dict[name] = top_relationships
    # print(top_relationships_dict)

# just putting this here so i can remove from main
def get_character_summaries_from_gemini():
    associated_quotes_obj_list = {}
    for character in ("heathcliff", "catherine", "edgar", "isabella linton", "hindley"):
        character_quotes = er.get_character_quotes(
            nw_dict=nw_dict,
            character=str(character),
            n=20,
            sentiment_descending=True,
            sentiment_boundary=0.0,
            length_descending=True,
            min_quote_len=10,
        )
        associated_quotes_obj_list[character.items()] = character_quotes
    character_summaries = {}
    for character, quotes in associated_quotes_obj_list.items():
        character_quotes = [q["quote"] for q in quotes]
        res = g.prompt("gemini-2.5-flash", "\n".join(character_quotes), "character_summary", character, "Wuthering Heights")
        character_summaries[character] = res
