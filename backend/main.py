import time

import requests
import os
import io
import json
import serpapi
from bs4 import BeautifulSoup
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
    er: EntityExtractor = EntityExtractor(
        "en_core_web_trf",
        book.get_full_text()
    )
    for idx, ch in book.chapters.items():
        ch_dict = {}
        soup = BeautifulSoup(ch.item.get_body_content(), "html.parser")
        paras = [para.get_text() for para in soup.find_all("p")]
        ch_dict[idx] = paras
        print(er.build_chapter_cooccurrence(ch_dict))

