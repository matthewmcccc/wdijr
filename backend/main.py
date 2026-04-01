import time

import requests
import os
import io
import json
import serpapi
from urllib.parse import urlparse
from itertools import combinations
from pathlib import Path
from app.parsers.book import Chapter
from app.parsers.epub import Epub
from app.nlp.ner import EntityExtractor
from app.nlp.plot_sentiment import PlotSentiment
from app.llm.gemini import Gemini
from app.services.book_processor import process_text
from PIL import Image
from dotenv import load_dotenv
from collections import defaultdict
from app.services.book_processor import get_character_thumbnails
from app.services.book_processor import get_author_data

load_dotenv()

if __name__ == "__main__":
    book: Epub = Epub("./app/temp/aaiw.epub")
    quotes = book.get_full_text_quotes(book.get_full_text())
    er: EntityExtractor = EntityExtractor(
        "en_core_web_trf",
        book.get_full_text()
    )

    asct_quotes = er.associate_text_quotes(quotes)
    nw_dict = er.build_conversational_network(
        asct_quotes
    )
    top_char_quotes = er.get_character_quotes(
        nw_dict=nw_dict
    )
    print(top_char_quotes)
