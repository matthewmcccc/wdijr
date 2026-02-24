import os
import string
import re
import json
import math
from unidecode import unidecode
from parsers.book import Book, Chapter
from ebooklib import epub
from bs4 import BeautifulSoup
from typing import TypedDict

# yikes! need new names
PRIOR_SPAN_WINDOW = 75
POST_SPAN_WINDOW = 50
QUOTE_SPAN_WINDOW = 400

class Epub(Book):
    def __init__(self, book_path):
        self.book: epub.EpubBook = epub.read_epub(book_path)
        self.title: str = self.set_title()
        self.chapters: dict = self.set_chapters()
        self.author: str = self.set_author()
        self.full_word_list: list[str] = self.get_full_text_word_list()
        self.full_word_count: int = self.get_full_word_count()

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
                index=idx, title=ch_title, item=self.book.get_item_with_href(href)
            )
            chapters[idx] = ch
            idx += 1
        return chapters

    def check_valid_ch_title(self, ch_title: str) -> bool:
        valid = True

        # skip title pages
        table = str.maketrans("", "", string.punctuation)
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
        Returns all of the words for a given chapter
        as a list of strings

        :param index: Chapter index / number
        :rtype list[str]
        :return A list of all words from a given chapter
        """
        chapter = self.chapters[index]
        soup = BeautifulSoup(chapter.item.get_body_content(), "html.parser")
        text = [para.get_text() for para in soup.find_all("p")]
        text_str = "\n".join(text)
        words = text_str.split()
        return words
    
    def get_text_span(self, idx_start: int, idx_end: int) -> str:
        """
        Returns a span of the text as a single string

        :param idx_start: The index of the word at
        the starting position of the span
        :param idx_end: The index of the word at
        the last position of the span
        :return A single string containing the desired
        span of text
        """
        if idx_end > self.full_word_count:
            idx_end = self.full_word_count
        if idx_start < 0:
            idx_start = 0

        return (" ").join(self.full_word_list[idx_start:idx_end])
    
    def get_spans_from_index_list(self, fd: list[tuple[float, float]]) -> list[str]:
        wc = self.full_word_count
        fd_len = len(fd)
        spans = [""] * fd_len

        for i, (pct, _) in enumerate(fd):
            med = math.floor(pct * wc)
            spans[i] = self.get_text_span(med - QUOTE_SPAN_WINDOW, med + QUOTE_SPAN_WINDOW)
        
        print(spans)


    def get_full_text_quotes(self, text: str) -> list[dict]:
        """
        Get a list of all of the quotes from the text,
        and spans of text before and after the quote.
        quotes in this context are instances of speech.

        :return A list of all of the quotes, and spans of text surrounding the quote
        :rtype list[dict]
        """
        quotes = []
        text_len = range(len(text))
        for i in text_len:
            if text[i] in ('"', "“"):
                start_idx = i + 1
                chars = []
                i += 1
                while text[i] not in ('"', "”"):
                    chars.append(text[i])
                    i += 1

                end_idx = i - 1
                quote_dict = {}
                quote_len = len(chars)

                prior = text[i - quote_len - PRIOR_SPAN_WINDOW : i - quote_len].replace(
                    "\n", " "
                )
                post = text[i : i + POST_SPAN_WINDOW].replace("\n", " ")

                quote_str = "".join(chars)
                quote_str = (
                    quote_str.replace("“", "").replace("”", "").replace("\n", " ")
                )

                word_count = len(quote_str.split(" "))

                quote_dict["quote"] = quote_str
                quote_dict["prior"] = prior
                quote_dict["post"] = post
                quote_dict["span"] = (start_idx, end_idx)
                quote_dict["word_count"] = word_count

                quotes.append(quote_dict)
        return quotes

    def get_full_word_count(self):
        words = self.get_full_text_word_list()
        return len(words)