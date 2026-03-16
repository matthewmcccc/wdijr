import os
import io
import json
from pathlib import Path
from app.parsers.book import Chapter
from app.parsers.epub import Epub
from app.nlp.ner import EntityExtractor
from app.nlp.plot_sentiment import PlotSentiment
from app.llm.gemini import Gemini
from app.services.book_processor import process_text
from PIL import Image
from collections import defaultdict

if __name__ == "__main__":
    book_path = Path("./app/temp/wh.epub")
    book = Epub(book_path)
    text = book.get_full_text()
    quotes = book.get_full_text_quotes(text)

    er: EntityExtractor = EntityExtractor("en_core_web_trf", text)
    associated_quotes = er.associate_text_quotes(quotes)
    nw_dict = er.build_conversational_network(associated_quotes)
    characters = er.get_persons_from_text()

    for character in characters:
        top_relationships = er.get_top_relationships(
            nw_dict,
            str(character),
            3
        )
        print(top_relationships)