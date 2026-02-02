import io
import ebooklib
import os
import re
import json
from utils.book import Book, Chapter
from pathlib import Path
from ebooklib import epub
from bs4 import BeautifulSoup

class Epub(Book):
    def __init__(self, book_path):
        self.book: epub.EpubBook = epub.read_epub(book_path)
        self.chapters: dict[Chapter] = self.set_chapters()
        self.author: str = self.set_author()
        self.title: str = self.set_title()

    def set_author(self) -> str:
        if self.book.get_metadata("DC", "creator"):
            return self.book.get_metadata("DC", "creator")[0][0]
        return "Unknown"

    def set_title(self) -> str:
        if self.book.title:
            return self.book.title
        if self.book.get_metadata("DC", "title"):
            return self.book.get_metadata("DC", "title")[0][0]
        return "Untitled"
    
    def set_chapters(self):
        idx = 0
        chapters = {}
        for item in self.book.toc:
            href = item.href.split("#")[0]
            ch_title = item.title
            if not self.check_valid_ch_title(ch_title):
                print(f"title: {ch_title} is not a valid title")
                continue
            ch: Chapter = Chapter(
                index=idx,
                title=ch_title,
                item=self.book.get_item_with_href(href)
            )
            chapters[idx] = ch
            idx += 1
        return chapters
    
    def check_valid_ch_title(self, ch_title):
        valid = True
        
        if self.book.title in ch_title:
            valid = False

        config_path = os.path.join(os.path.dirname(__file__), "config.json")
        try: 
            with open(config_path, "r") as file:
                data = json.load(file)
            for word in data["bad_words"]:
                if word in ch_title.lower():
                    valid = False
        except json.JSONDecodeError as e:
            print(f"Error opening config.json: {e}")

        return valid

    def read_chapters(self):
        for idx, chap in self.chapters.items():
            print(chap.title)