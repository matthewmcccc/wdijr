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

if __name__ == "__main__":
    book_path = Path("./app/temp/aaiw.epub")
    book = Epub(book_path)
    text = book.get_full_text()
    quotes = book.get_full_text_quotes(text)

    er: EntityExtractor = EntityExtractor("en_core_web_trf", text)
    associated_quotes = er.associate_text_quotes(quotes)
    chapter_associated_quotes = er.get_associated_quotes_by_chapter(associated_quotes)
    chapters_conversational_network = defaultdict(dict)
    for idx, chapter_quotes in chapter_associated_quotes.items():
        chapters_conversational_network[idx] = er.build_conversational_network(
            chapter_quotes
        )
    print(chapters_conversational_network)
