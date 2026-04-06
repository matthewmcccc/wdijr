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
from app.analysis.quote_attributor import QuoteAttributor
from app.services.book_processor import get_character_chapter_occurences

load_dotenv()

if __name__ == "__main__":
    book: Epub = Epub("./app/temp/aaiw.epub")
    ch_extractor: CharacterExtractor = CharacterExtractor(
        book.get_full_text(),
    )
    # characters_list = ch_extractor.consolidated_characters
    # characters_dict = ch_extractor.build_character_dict()
    canonical_characters = ch_extractor.canonical_characters

    # qa: QuoteAttributor = QuoteAttributor(canonical_characters, characters_dict, book.get_full_text())
    # associated_quotes = qa.associate_text_quotes(
    #     book.get_full_text_quotes(book.get_full_text()),
    #     characters_dict
    # )

    nb: NetworkBuilder = NetworkBuilder(canonical_characters)
    # cn = nb.build_conversational_network(
    #     associated_quotes
    # )
    char_occurences = get_character_chapter_occurences(
        book, nb, ch_extractor.build_character_dict()
    )
    print(char_occurences)


