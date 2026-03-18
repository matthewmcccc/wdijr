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
from app.services.book_processor import get_character_thumbnails

if __name__ == "__main__":
    book_path = Path("./app/temp/aaiw.epub")
    book = Epub(book_path)
    text = book.get_full_text()
    quotes = book.get_full_text_quotes(text)

    er: EntityExtractor = EntityExtractor("en_core_web_trf", text)
    ps: PlotSentiment = PlotSentiment()
    
    chapter_valence_vals: list = []
    for idx, chapter in book.chapters.items():
        word_list = book.get_chapter_word_list(idx)
        sentiment_values = ps.get_section_valence(
            word_list
        )
        chapter_valence_vals.append(sentiment_values)
    diff_values = []
    for idx, valence_vals in enumerate(chapter_valence_vals):
        first_diff = ps.first_difference(
            valence_vals
        )
        diff_values.append(sorted(first_diff, key=lambda x: abs(x[1]), reverse=True)[:2])
    text_for_summarisation = []
    for idx, valence_vals in enumerate(chapter_valence_vals):
        sum_text = ps.get_text_for_summarization(
            book.get_chapter_text(idx),
            diff_values[idx],
            len(chapter_valence_vals[idx])
        )   
        print(sum_text)
