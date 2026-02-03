import io
from pathlib import Path
from parsers.epub import Epub
from nlp.ner import EntityExtractor

if __name__ == "__main__":
    book_path = Path("./temp/metamorphosis.epub")
    book: Epub = Epub(book_path)
    ner = EntityExtractor("en_core_web_sm")
    doc = ner.process_text(book.get_full_text())
    ner.print_entity_counts()