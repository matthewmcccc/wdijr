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

def get_character_thumbnails(author: str, title: str, character: str):
    client = serpapi.Client(api_key=os.getenv("SERP_API_KEY"))
    short_title = title.replace("'s Adventures in Wonderland", " in Wonderland")
    results = client.search({
        "engine": "google_images",
        "q": f"{character} {short_title.lower()} illustration",
        "location": "United Kingdom",
        "google_domain": "google.com",
        "hl": "en",
        "gl": "us",
        "device": "desktop"
    })


    try:
        image_results = results["images_results"]
        image = image_results[0]["thumbnail"]
        path = urlparse(image).path
        ext = os.path.splitext(path)[1]
        data_dir = os.path.join(os.path.dirname(__file__), "..", "data", "character_thumbnails")
        os.makedirs(data_dir, exist_ok=True)
        with open(f"{data_dir}/{character}{ext}", "wb") as handler:
            handler.write(requests.get(image).content)
    except Exception as e:
        if "images_results" not in results:
            print(character)
            print(f"error: {results['error']}")
            print(f"keys: {list(results.keys())}")
            print(f"query was: {character} {title.lower()} illustration")
            return


if __name__ == "__main__":
    book_path = Path("./app/temp/aaiw.epub")
    book = Epub(book_path)
    text = book.get_full_text()
    quotes = book.get_full_text_quotes(text)
    paras = book.get_full_text_paras()

    er: EntityExtractor = EntityExtractor(
        "en_core_web_trf", text
    )

    for character in er.canonical_characters:
        get_character_thumbnails(
            book.author,
            book.title,
            character
        )
        break