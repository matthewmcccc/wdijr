import os
import re
import json
import gender_guesser.detector as gender
from collections import defaultdict
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from app.utils.util import clean_string

POST_SPAN_WINDOW = 3
PRIOR_SPAN_WINDOW = 10

class QuoteAttributor():
    def __init__(self, characters_list: list[str], characters_dict, text):
        self.characters_dict = characters_dict
        self.gender_detector = gender.Detector()
        self.sid_obj = SentimentIntensityAnalyzer()
        self.verbs_regex = self.build_speech_verbs_regex()
        self.entity_index = self.build_entity_index(text, characters=characters_list)

    @staticmethod
    def get_character_quotes(
        nw_dict: dict[str, dict[str, list[dict]]],
        character: str,
        n=1,
        sentiment_boundary=0.5,
        sentiment_descending=True,
        length_descending=False,
        min_quote_len=10,
        max_quote_len=175,
    ) -> list[dict]:
        """
        Get the top n quotes for a given character with respect to
        sentiment value.
        """
        network = nw_dict[character]
        character_quotes = []
        for _target, quotes in network.items():
            for q in quotes:
                if (
                    abs(q["sentiment"]) >= sentiment_boundary
                    and len(q["quote"].split()) > min_quote_len
                    and len(q["quote"].split()) < max_quote_len
                ):
                    character_quotes.append(q)
        sorted_quotes = []
        if sentiment_descending and not length_descending:
            sorted_quotes = sorted(
                character_quotes, key=lambda x: (-abs(x["sentiment"]), len(x["quote"]))
            )[:n]
        if sentiment_descending and length_descending:
            sorted_quotes = sorted(
                character_quotes, key=lambda x: (-abs(x["sentiment"]), -len(x["quote"]))
            )[:n]
        return sorted_quotes

    def associate_text_quotes(self, quotes: list[dict], characters_dict: dict) -> list[dict]:
        """
        Associate the quotes from a text with an entity (specifically a person)

        :param er: EntityExtractor for grabbing the dictionary of all variations of a persons canonical name
        :type er: EntityExtractor
        :return: A dictionary mapping canonical character names to a QuoteInfo object
        :rtype: dict[str, QuoteInfo]
        """
        attributed_quotes = []
        for quote in quotes:
            quote_obj = {
                "quote": quote["quote"],
                "span": quote["span"],
                "word_count": quote["word_count"],
                "speaker": None,
                "sentiment": None,
                "chapter_number": quote["chapter_number"],
            }
            prior = quote["prior"]
            post = quote["post"]
            for variation, canonical in characters_dict.items():
                if self.check_span_for_speech(
                    post.lower(), variation, POST_SPAN_WINDOW
                ):
                    quote_obj["speaker"] = canonical
                    break
                if self.check_span_for_speech(
                    prior.lower(), variation, PRIOR_SPAN_WINDOW
                ):
                    quote_obj["speaker"] = canonical
                    break
            if quote_obj["speaker"] == None:
                span_start = quote_obj["span"][0]
                for span_text, _direction in [(post.lower(), 1), (prior.lower(), -1)]:
                    words = span_text.split()
                    for word in words:
                        if self.match_speech_verbs_regex(word):
                            for w in words:
                                if w in ("he", "his", "himself"):
                                    quote_obj["speaker"] = self.coref_res(
                                        span_start, "he"
                                    )
                                if w in ("she", "her", "herself"):
                                    quote_obj["speaker"] = self.coref_res(
                                        span_start, "she"
                                    )
                                    break
                            break
                    if quote_obj["speaker"] is None:
                        break

            quote_obj["sentiment"] = self.sid_obj.polarity_scores(quote_obj["quote"])[
                "compound"
            ]
            attributed_quotes.append(quote_obj)
        return attributed_quotes
    
    def check_span_for_speech(self, span: str, name: str, span_len: int) -> bool:
        words = span.split(" ")
        name_lower = name.lower()
        for i, word in enumerate(words):
            if self.match_speech_verbs_regex(word):
                context = words[max(0, i - span_len) : i + span_len + 1]
                context_str = " ".join(context)
                if re.search(r"\b" + re.escape(name_lower) + r"\b", context_str):
                    return True
        return False
    
    def match_speech_verbs_regex(self, s: str) -> bool:
        verbs_regex = self.verbs_regex
        return bool(re.search(verbs_regex, s))
    
    @staticmethod
    def build_speech_verbs_regex() -> str:
        verbs = set()
        config_path = os.path.join(os.path.dirname(__file__), "..", "..", "config.json")
        try:
            with open(config_path, "r") as file:
                data = json.load(file)
            for word in data["speech_verbs"]:
                verbs.add(word)
        except json.JSONDecodeError as e:
            print(f"Error opening config.json: {e}")
        return r"\b(" + "|".join(verbs) + r")\b"
    
    @staticmethod
    def get_associated_quotes_by_chapter(associated_quotes: dict) -> dict:
        """
        Index associated quotes by chapter. For building chapter by chapter
        conversational network.

        :param associated_quotes: Associated quotes dictionary for entire text
        :type associated_quotes: dict
        """
        chapter_associated_quotes = defaultdict(list)
        for quote in associated_quotes:
            chapter_number = int(quote["chapter_number"])
            chapter_associated_quotes[chapter_number].append(quote)
        return chapter_associated_quotes
    
    def coref_res(self, index: int, pronoun: str) -> str:
        """
        Lightweight coreference resolution that replaces pronouns with
        the most recently named entity relative to gender.

        e.g. if Alice and John are the most recently used entities,
        "she said" becomes "Alice said", and "he said" becomes "John said".

        :param self: Description
        :param s: Description
        :type s: str
        """
        if pronoun in ("she", "hers", "herself"):
            return self.female_at[index]
        if pronoun in ("he", "his", "himself"):
            return self.male_at[index]
        
    def build_entity_index(self, s: str, characters: list[str]) -> None:
        """
        Takes the text/novel as a string and builds ana index of
        most recent gender
        """
        words = s.split(" ")
        male_at = [None] * len(s)
        female_at = [None] * len(s)
        male_entity = None
        female_entity = None
        ch_idx = 0
        for word_idx in range(len(words)):
            word = words[word_idx]
            clean_word = clean_string(word)
            if len(word) > 0 and word[0].isupper() and clean_word in characters:
                g = self.gender_detector.get_gender(word)
                if g == "male":
                    male_entity = clean_word
                if g == "female":
                    female_entity = clean_word
            for i in range(ch_idx, min(ch_idx + len(word), len(s))):
                male_at[i] = male_entity
                female_at[i] = female_entity
            ch_idx += len(word) + 1
        self.male_at = male_at
        self.female_at = female_at