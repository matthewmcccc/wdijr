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
    pg_url = "https://project-gutenberg-free-books-api1.p.rapidapi.com/books/1342"
    pg_api_key = "fc5ee54257mshe0e09c6049b3e2dp19bdfbjsn084d413df665"
    res = requests.get(pg_url, headers={
        "Content-Type": "application/json",
        "x-rapidapi-host": "project-gutenberg-free-books-api1.p.rapidapi.com",
        "x-rapidapi-key": pg_api_key,
    })
    parsed = res.json()
    print(parsed["results"][0]["formats"]["application/epub+zip"])
    epub_res = requests.get("https://www.gutenberg.org/ebooks/1342.epub3.images")
    print(epub_res.json())