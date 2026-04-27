import json
import os
import spacy

from app.analysis.character_extractor import CharacterExtractor
from app.llm.gemini import Gemini
from app.utils.types import PromptInstruction

nlp = spacy.load("en_core_web_trf", disable=["parser", "tagger"])

BENCHMARK_DIR = os.path.join(os.path.dirname(__file__), "data", "characters")

def load_ground_truth(filename):
    with open(os.path.join(BENCHMARK_DIR, filename), "r") as f:
        return json.load(f)

def match(gt_name, output_name):
    if gt_name == output_name:
        return True
    stopwords = {"the", "a", "an", "of", "and", "mr", "mrs", "miss", "dr", "mr.", "mrs.", "dr."}
    gt_words = set(gt_name.split()) - stopwords
    out_words = set(output_name.split()) - stopwords
    if not gt_words:
        return False
    overlap = gt_words & out_words
    return len(overlap) >= max(1, len(gt_words) // 2 + 1)


def character_benchmark():
    books = {
        "aaiw.json": "./app/temp/aaiw.epub",
        "emma.json": "./app/temp/emma.epub",
        "wh.json": "./app/temp/wh.epub",
    }

    for gt_file, book_path in books.items():
        gt_data = load_ground_truth(gt_file)
        gt_characters = [c["canonical"].lower() for c in gt_data["characters"]]

        from app.parsers.epub import Epub
        book = Epub(book_path)

        ce = CharacterExtractor(text=book.text, nlp=nlp)
        ce.run()


        g: Gemini = Gemini()
        gemini_consolidated_characters = g.generate_consolidated_characters(
            "gemini-3.1-pro-preview",
            ce.consolidated_characters,
            PromptInstruction.CHARACTER_CONSOLIDATION,
            book.title,
            book.author
        )


        if isinstance(gemini_consolidated_characters, str):
            gemini_consolidated_characters = json.loads(gemini_consolidated_characters)

        output_characters = [c["canonical_name"].lower() for c in gemini_consolidated_characters["characters"]]
    
        print(output_characters)
        

if __name__ == "__main__":
    character_benchmark()