import io
import json
from pathlib import Path
from parsers.epub import Epub
from nlp.ner import EntityExtractor
from nlp.plot_sentiment import PlotSentiment
from llm.gemini import Gemini

if __name__ == "__main__":
    book_path = Path("./temp/wh.epub")
    book: Epub = Epub(book_path)
    text = book.get_full_text()
    ps: PlotSentiment = PlotSentiment()
    er: EntityExtractor = EntityExtractor("en_core_web_trf", text)
    g: Gemini = Gemini()
    quotes = book.get_full_text_quotes(text)
    associated_quotes = er.associate_text_quotes(quotes)
    nw_dict = er.build_conversational_network
    associated_quotes_obj_list = []
    for quote in associated_quotes:
        if quote["speaker"] in ("heathcliff", "catherine", "catherine earnshaw", "edgar", "isabella linton", "isabella", "hindley"):
            associated_quotes_obj_list.append({ "speaker": quote["speaker"], "span": list(quote["span"]), "sentiment": quote["sentiment"] })
    print(json.dumps(associated_quotes_obj_list))
    # relationship_dict: dict[str, list[tuple[str, int]]] = {}
    # character_top_quotes = {}
    # for character in er.get_all_characters(nw_dict):
    #     quotes = er.get_top_character_quotes(nw_dict, str(character))
    #     character_top_quotes[character] = quotes
    # print(character_top_quotes)
   