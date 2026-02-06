import io
import ebooklib
import os
import string
import re
import json
from unidecode import unidecode
from parsers.book import Book, Chapter
from pathlib import Path
from ebooklib import epub
from bs4 import BeautifulSoup

class Epub(Book):
    def __init__(self, book_path):
        self.book: epub.EpubBook = epub.read_epub(book_path)
        self.title: str = self.set_title()
        self.chapters: dict = self.set_chapters()
        self.author: str = self.set_author()

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
    
    def set_chapters(self) -> dict:
        idx = 0
        chapters = {}
        for item in self.book.toc:
            href = item.href.split("#")[0]
            ch_title = item.title
            if not self.check_valid_ch_title(ch_title):
                continue
            ch: Chapter = Chapter(
                index=idx,
                title=ch_title,
                item=self.book.get_item_with_href(href)
            )
            chapters[idx] = ch
            idx += 1
        return chapters
    
    def check_valid_ch_title(self, ch_title: str) -> bool:
        valid = True

        # skip title pages
        table = str.maketrans('', '', string.punctuation)
        book_title_fmt = unidecode(self.book.title.lower().translate(table))
        ch_title_fmt = unidecode(ch_title.lower()).translate(table)
        # for cases where the chapter title == book title
        # seperated by spaces e.g. "D R A C U L A"
        if book_title_fmt.replace(" ", "") == ch_title_fmt.replace(" ", ""):
            valid = False

        config_path = os.path.join(os.path.dirname(__file__), "../config.json")
        try: 
            with open(config_path, "r") as file:
                data = json.load(file)
            for word in data["excluded_phrases"]:
                if word in ch_title.lower():
                    valid = False
        except json.JSONDecodeError as e:
            print(f"Error opening config.json: {e}")

        return valid
    
    def get_full_text(self) -> str:
        text = []
        for chapter in self.chapters.values():
            soup = BeautifulSoup(chapter.item.get_body_content(), "html.parser")
            text.extend([para.get_text() for para in soup.find_all("p")])
        return "\n\n".join(text)

    def get_chapter_text(self, index) -> str:
        """
        returns the raw text for a given chapter as a string

        index: chapter index / number
        """
        chapter = self.chapters[index]
        soup = BeautifulSoup(chapter.item.get_body_content(), "html.parser")
        text = [para.get_text() for para in soup.find_all("p")]
        return "\n".join(text)
    
    def get_full_text_word_list(self) -> list[str]:
        """
        returns a list of all of the words in a text
        across all sections / chapters
        """
        text = []
        for chapter in self.chapters.values():
            soup = BeautifulSoup(chapter.item.get_body_content(), "html.parser")
            text.extend([para.get_text() for para in soup.find_all("p")])
        text_str = "\n".join(text)
        words = text_str.split()
        return words
    
    def get_chapter_word_list(self, index) -> list[str]:
        """
        returns all of the words for a given chapter
        as a list of strings
        
        index: chapter index / number
        """
        chapter = self.chapters[index]
        soup = BeautifulSoup(chapter.item.get_body_content(), "html.parser")
        text = [para.get_text() for para in soup.find_all("p")]
        text_str = "\n".join(text)
        words = text_str.split()
        return words
    
    def get_full_text_quotes(self) -> list[str]:
        """
        get a list of all of the quotes from the text
        quotes in this context are instances of speech
        """
        quotes = []
        for idx in self.chapters.keys():
            text = self.get_chapter_text(idx)
            for i in range(len(text)):
                if text[i] in ('"', '“'):
                    quote_str = ""
                    while text[i] not in ('"', '”'):
                        quote_str += text[i]
                        i += 1
                    # todo: theres almost definitely a better
                    # way to strip the string than this
                    quote_str = quote_str.replace("“", "").replace("”", "").replace("\n", " ")
                    quotes.append(quote_str)
        print(quotes)
