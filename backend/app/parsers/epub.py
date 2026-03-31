import os
import string
import re
import json
import math
from unidecode import unidecode
from .book import Book, Chapter
from ebooklib import epub, ITEM_COVER
from bs4 import BeautifulSoup
from typing import TypedDict

PRIOR_SPAN_WINDOW = 75
POST_SPAN_WINDOW = 50
QUOTE_SPAN_WINDOW = 400
CHUNK_SPAN_WINDOW = 500
MIN_CHAPTER_WORD_LEN = 150

class Epub(Book):
    def __init__(self, book_path):
        self.book: epub.EpubBook = epub.read_epub(book_path)
        self.cover: list = self.get_cover()
        self.title: str = self.set_title()
        self.chapters: dict = self.set_chapters()
        self.author: str = self.set_author()
        self.full_word_list: list[str] = self.get_full_text_word_list()
        self.full_word_count: int = self.get_full_word_count()
        self.span_index: list[tuple[int, int]] = self.build_chapter_span_index()

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
            full_href = item.href
            href = full_href.split("#")[0]
            fragment = full_href.split("#")[1] if "#" in full_href else None

            ch_title = item.title
            print(f"title: '{ch_title}' valid: {self.check_valid_ch_title(ch_title)}")
            match = re.match(r'CHAPTER\s+([IVXLC\d]+)\.?\s*(.*)', ch_title, re.IGNORECASE)
            if match:
                numeral = match.group(1).upper()
                subtitle = match.group(2).strip()
                if subtitle:
                    ch_title = f"Chapter {numeral}. {subtitle}"
                else:
                    ch_title = f"Chapter {numeral}"
            if not self.check_valid_ch_title(ch_title):
                continue

            epub_item = self.book.get_item_with_href(href)
            soup = BeautifulSoup(epub_item.get_body_content(), "html.parser")

            if fragment:
                anchor = soup.find(id=fragment)
                if anchor:
                    parts = []
                    for sibling in anchor.find_next_siblings():
                        if sibling.name in ("h1", "h2", "h3") or sibling.get("id"):
                            break
                        parts.append(sibling.get_text())
                    text = "\n".join(parts)
                    if not text.strip():
                        text = "\n".join(p.get_text() for p in soup.find_all("p"))
                else:
                    text = "\n".join(p.get_text() for p in soup.find_all("p"))
            else:
                text = "\n".join(p.get_text() for p in soup.find_all("p"))

            words = text.split()
            print(f"'{ch_title}' — fragment: {fragment} — words: {len(words)}")
            if len(words) < MIN_CHAPTER_WORD_LEN:
                continue

            ch = Chapter(index=idx, title=ch_title, item=epub_item, text=text)
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

        config_path = os.path.join(os.path.dirname(__file__), "..", "..", "config.json")
        try:
            with open(config_path, "r") as file:
                data = json.load(file)
            for word in data["excluded_phrases"]:
                if word in ch_title.lower():
                    valid = False
        except json.JSONDecodeError as e:
            print(f"Error opening config.json: {e}")
        return valid
    
    def get_full_text_paras(self) -> list[str]:
        paras = []
        for chapter in self.chapters.values():
            soup = BeautifulSoup(chapter.item.get_body_content(), "html.parser")
            for para in soup.find_all("p"):
                paras.append(para.get_text())
        return paras

    def get_full_text(self) -> str:
        return "\n\n".join(ch.text for ch in self.chapters.values())

    def get_chapter_text(self, index) -> str:
        """
        returns the raw text for a given chapter as a string

        index: chapter index / number
        """
        return self.chapters[index].text

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
        return self.chapters[index].text.split()

    def chunk_text_for_motif_analysis(self) -> list[str]:
        text_chunks = []
    
        for idx, _chapter in self.chapters.items():
            text = self.get_chapter_text(idx)
            words = text.split(" ")
            for idx in range(0, len(words) - 1, CHUNK_SPAN_WINDOW):
                chunk = (" ").join(words[idx : idx + CHUNK_SPAN_WINDOW])
                if chunk.strip():
                    text_chunks.append(chunk)
        
        return text_chunks

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
            spans[i] = self.get_text_span(
                med - QUOTE_SPAN_WINDOW, med + QUOTE_SPAN_WINDOW
            )

        return spans

    def build_chapter_span_index(self) -> list[tuple[int, int]]:
        span_index = [(0, 0)] * len(self.chapters)
        for ch_idx, _ in self.chapters.items():
            text = self.get_chapter_text(ch_idx)
            start_idx = span_index[max(0, ch_idx - 1)][1]
            end_idx = start_idx
            for _ in text:
                end_idx += 1
            span_index[ch_idx] = (start_idx, end_idx)
        return span_index

    def get_full_text_quotes(self, text: str) -> list[dict]:
        """
        Get a list of all of the quotes from the text,
        and spans of text before and after the quote.
        Quotes in this context are any instance of speech.

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

                chapter_number = 0
                for idx, item in enumerate(self.span_index):
                    if start_idx > item[0] and start_idx < item[1]:
                        chapter_number = idx

                quote_dict["quote"] = quote_str
                quote_dict["prior"] = prior
                quote_dict["post"] = post
                quote_dict["span"] = (start_idx, end_idx)
                quote_dict["word_count"] = word_count
                quote_dict["chapter_number"] = chapter_number

                quotes.append(quote_dict)
        return quotes

    def get_cover(self):
        def is_image(item):
            return item is not None and item.media_type.startswith("image/")

        for meta in self.book.get_metadata("OPF", "cover"):
            if is_image(item := self.book.get_item_with_id(meta[1]["content"])):
                return item

        if is_image(item := self.book.get_item_with_id("cover")):
            return item

        for item in self.book.get_items_of_type(ITEM_COVER):
            if "cover" in item.get_name().lower() and is_image(item):
                return item

        return None

    def write_cover(self, cover, novelId) -> str:
        os.makedirs(f"../data/{novelId}/covers", exist_ok=True)
        content = cover.get_content()
        cover_url = f"../data/{novelId}/covers/cover.jpg"
        with open(cover_url, "wb") as f:
            f.write(content)
        return f"/data/{novelId}/covers/cover.jpg"

    def get_full_word_count(self):
        words = self.get_full_text_word_list()
        return len(words)

    def compute_mattr(self, tokens, window):
        if len(tokens) < window:
            return len(set(tokens)) / len(tokens)
        ttrs = []
        for i in range(len(tokens) - window + 1):
            w = tokens[i : i + window]
            ttrs.append(len(set(w)) / window)
        return sum(ttrs) / len(ttrs)


    def lexical_richness(self):
        ch_lexical_richness = []
        for idx, chapter in self.chapters.items():
            text = self.get_chapter_text(idx)
            tokens = [w.lower().strip(".,!?;:\"'()") for w in text.split() if w.strip(".,!?;:\"'()")]
            mattr = self.compute_mattr(tokens, window=100)
            ch_lexical_richness.append(mattr)
        return ch_lexical_richness
    