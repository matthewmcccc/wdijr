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
    book: Epub = Epub("./app/temp/aaiw.epub")
    quotes = book.get_full_text_quotes()
    ce: CharacterExtractor = CharacterExtractor(book.text)
    char_dict = ce.build_character_dict()
    qa: QuoteAttributor = QuoteAttributor(ce.canonical_characters, char_dict, book.text)
    associated_quotes = qa.associate_text_quotes(book.get_full_text_quotes(), char_dict)
    nb: NetworkBuilder = NetworkBuilder(ce.canonical_characters)
    nw_dict = nb.build_conversational_network(
        associated_quotes
    )
    alice_quotes = qa.get_character_quotes(
        nw_dict,
        "alice",
        500,
        0.0,
        True,
        True,
        0,
        200
    )
    print(alice_quotes)

