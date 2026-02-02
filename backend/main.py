import io
from pathlib import Path
from utils.epub import Epub

if __name__ == "__main__":
    b = Path("./temp/metamorphosis.epub")
    book: Epub = Epub(b)
    author = book.get_author()
    print(f'Author: {author}')