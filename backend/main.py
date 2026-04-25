import time
import spacy
import requests
import os
import io
import json
import serpapi
from app.utils.types import PromptInstruction
from app.analysis.quote_attributor import QuoteAttributor
from app.parsers.epub import Epub
from app.analysis.character_extractor import CharacterExtractor
from app.services.book_processor import (
    build_character_dict_from_consolidated,
    get_gemini_consolidated_characters,
)
from dotenv import load_dotenv
from app.llm.gemini import Gemini

load_dotenv()

if __name__ == "__main__":
    book: Epub = Epub("./app/temp/omam.epub")
    nlp = spacy.load("en_core_web_trf")
    text = book.get_full_text()
    ce: CharacterExtractor = CharacterExtractor(
        text,
        nlp
    )
    ce.run()
    chars = ce.get_characters_from_text()
    for char in chars:
        print(char)