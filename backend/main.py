import time

import requests
import os
import io
import json
import serpapi
from app.parsers.epub import Epub
from app.analysis.character_extractor import CharacterExtractor
from dotenv import load_dotenv
from app.analysis.network_builder import NetworkBuilder
from app.analysis.lexical_analysis import LexicalAnalysis
from app.analysis.quote_attributor import QuoteAttributor
from app.services.book_processor import get_character_chapter_occurences

load_dotenv()

if __name__ == "__main__":
    book: Epub = Epub("./app/temp/dracula.epub")
    quotes = book.get_full_text_quotes()
    ce: CharacterExtractor = CharacterExtractor(book.text)
    for character in ce.canonical_characters:
        print(character)

