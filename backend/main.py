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
from app.analysis.character_extractor import CharacterExtractor
from app.analysis.plot_sentiment import PlotSentiment
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
    ch_extractor: CharacterExtractor = CharacterExtractor(
        book.get_full_text(),
    )
    for character in ch_extractor.characters:
        print(character)
        
