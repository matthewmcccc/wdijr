import json
import os
import spacy
from spacy.language import Language
from collections import Counter
import regex as re
from typing import TypedDict
from collections import defaultdict

spacy.prefer_gpu()


class QuoteInfo(TypedDict):
    quotes: list[str]
    quote_count: int


class EntityExtractor:
    def __init__(self, model: str, text: str):
        self.nlp = spacy.load(model)
        self.doc = self.process_text(text)
        self.persons = self.get_persons_from_text()

    def process_text(self, text: str) -> None:
        """
        Docstring for process_text

        :param self: Description
        :param text: Description
        :type text: str
        """
        self.doc = self.nlp(text)
        return self.doc

    def get_persons_from_text(self) -> list[dict]:
        """
        Retrieve all entities with the label person from a text.

        :return: A list of all of the persons from a text and their counts.
        :rtype: list[dict]
        """
        persons = []
        if self.doc is None:
            return
        counts = Counter((ent.text, ent.label_) for ent in self.doc.ents)
        for (text, label), count in counts.most_common():
            if label == "PERSON":
                person_dict = {}
                person_dict["name"] = text
                person_dict["count"] = count
                persons.append(person_dict)
        return persons

    def consolidate_persons(self) -> list[list[str]]:
        """
        Consolidates character name variations into groups.

        Each group contains a full name and some of it's possible variations
        e.g. ["Van Helsing", "Van", "Helsing"]

        :return: List of consolidated name groups
        :rtype: list[list[str]]
        """
        sorted_persons = sorted(
            self.persons, reverse=True, key=lambda entity: len(entity["name"])
        )
        gen_persons = []
        stop_words = self.nlp.Defaults.stop_words
        name = self.clean_string(sorted_persons[0]["name"])
        gen_persons.append(
            [
                name,
                *[
                    item
                    for item in name.split(" ")
                    if len(item) >= 3 and item not in stop_words
                ],
            ]
        )
        for p_idx in range(len(sorted_persons)):
            seen = False
            p = self.clean_string(sorted_persons[p_idx]["name"])
            if len(p) <= 3 or p in stop_words:
                break
            p_split = p.split(" ")
            for g_idx in range(len(gen_persons)):
                if p in gen_persons[g_idx]:
                    seen = True
                for item in p_split:
                    if item in gen_persons[g_idx]:
                        seen = True
                if seen:
                    break
            if not seen:
                if [p] == p_split:
                    gen_persons.append([p])
                else:
                    gen_persons.append(
                        [
                            p,
                            *[
                                item
                                for item in p_split
                                if len(item) >= 3 and item not in stop_words
                            ],
                        ]
                    )
        return gen_persons

    def build_persons_dict(self) -> dict:
        """
        Build dictionary for associating variations of a name with their
        canonical name

        e.g. {"Van Helsing": "Van Helsing", "Van": "Van Helsing"}

        :return: Dictionary mapping variations of names to their parent or canonical name
        :rtype: dict
        """
        persons_dict = {}
        consolidated_persons = self.consolidate_persons()
        print(consolidated_persons)
        for group in consolidated_persons:
            for idx in range(len(group)):
                persons_dict[group[idx]] = group[0]
        return persons_dict

    def associate_text_quotes(self, quotes: list[dict]) -> dict[str, QuoteInfo]:
        """
        Associate the quotes from a text with an entity (specifically a person)

        :param er: EntityExtractor for grabbing the dictionary of all variations of a persons canonical name
        :type er: EntityExtractor
        :return: A dictionary mapping canonical character names to a QuoteInfo object
        :rtype: dict[str, QuoteInfo]
        """
        persons_dict = self.build_persons_dict()

        quote_dict = defaultdict(lambda: {"quotes": [], "quote_count": 0})
        for quote in quotes:
            q = quote["quote"]
            prior = quote["prior"]
            post = quote["post"]
            span = quote["span"]
            word_count = quote["word_count"]
            for variation, canonical in persons_dict.items():
                if (variation in prior.lower() or variation in post.lower()) and (
                    self.match_speech_verbs_regex(prior.lower())
                    or self.match_speech_verbs_regex(post.lower())
                ):
                    quote_dict[canonical]["quotes"].append(
                        {"quote": q, "span": span, "len_words": word_count}
                    )
                    quote_dict[canonical]["quote_count"] += 1
        return quote_dict

    def match_speech_verbs_regex(self, s: str) -> bool:
        speech_verbs = self.build_speech_verbs_regex()
        return bool(re.search(speech_verbs, s))

    @staticmethod
    def clean_string(s: str) -> str:
        """
        Removes all newspaces, punctuation, apostrophes, and converts
        the given string to lower case.

        :param s: String to be cleaned
        :type s: str
        :return: Cleaned string
        :rtype: str
        """
        s = s.replace("\n", " ").replace("’s", "").replace("'s", "").lower()
        return re.sub(r"\p{P}+", "", s)

    @staticmethod
    def build_speech_verbs_regex() -> str:
        verbs = set()
        config_path = os.path.join(os.path.dirname(__file__), "../config.json")
        try:
            with open(config_path, "r") as file:
                data = json.load(file)
            for word in data["speech_verbs"]:
                verbs.add(word)
        except json.JSONDecodeError as e:
            print(f"Error opening config.json: {e}")
        return r"\b(" + "|".join(verbs) + r")\b"
