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
    book: Epub = Epub("./app/temp/aaiw.epub")
    g: Gemini = Gemini()
    chunks = book.chunk_text_for_motif_analysis()
    model = "gemini-2.5-flash"
    motifs = g.generate_motif_extraction(
        model,
        chunks,
        "motif_extraction",
        book.title
    )

    all_motifs = []
    for m in motifs:
        parsed = json.loads(m)
        all_motifs.extend(parsed["motifs"])

    consolidated_motifs = g.generate_motif_consolidation(
        model,
        all_motifs,
        "motif_consolidation",
        book.title,
    )

    print(consolidated_motifs)
