import io
import ebooklib
from utils.book import Book
from pathlib import Path
from ebooklib import epub


class Epub(Book):
    def __init__(self, book):
        self.book = epub.read_epub(book)

    def get_book(self):
        return self.book

    def get_author(self):
        if self.book.get_metadata("DC", "creator"):
            return self.book.get_metadata("DC", "creator")[0][0]
        return "Unknown"

    def get_title(self):
        if self.book.get_metadata("DC", "title"):
            return self.book.get_metadata("DC", "title")[0][0]
        return "Untitled"
    
    def get_chapters(self):
        pass
    
