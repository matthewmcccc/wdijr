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
    heathcliff_quotes = er.get_character_quotes(
        nw_dict,
        character="heathcliff",
        n=20,
        sentiment_descending=True,
        length_descending=True,
    )
    print(heathcliff_quotes)
