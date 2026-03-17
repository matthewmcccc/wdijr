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
from app.services.book_processor import get_character_thumbnails

if __name__ == "__main__":
    book_path = Path("./app/temp/aaiw.epub")
    book = Epub(book_path)
    text = book.get_full_text()
    quotes = book.get_full_text_quotes(text)

    er: EntityExtractor = EntityExtractor("en_core_web_trf", text)
    for person in er.persons:
        print(person)