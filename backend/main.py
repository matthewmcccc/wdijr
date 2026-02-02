import io
from pathlib import Path
from utils.epub import Epub

if __name__ == "__main__":
    book_path = Path("./temp/metamorphosis.epub")
    book: Epub = Epub(book_path)
    book.read_chapters()