import json
import os
import spacy
from spacy.language import Language
from collections import Counter
import regex as re
from typing import TypedDict
from collections import defaultdict

spacy.prefer_gpu()

ALLOWED_CHARACTER_DIFF = 1500
POST_SPAN_WINDOW = 3
PRIOR_SPAN_WINDOW = 10

class QuoteInfo(TypedDict):
    quotes: list[str]
    quote_count: int


class EntityExtractor:
    def __init__(self, model: str, text: str):
        self.nlp = spacy.load(model)
        self.doc = self.process_text(text)
        self.persons = self.get_persons_from_text()
        self.verbs_regex = self.build_speech_verbs_regex()

    def process_text(self, text: str) -> None:
        """
        Docstring for process_text

        :param self: Description
        :param text: Description
        :type text: str
        """
        self.doc = self.nlp(text)
        return self.doc

    def get_persons_from_text(self) -> list[str]:
        """
        Retrieve all entities with the label person from a text.

        :return: A list of all of the persons from a text and their counts.
        :rtype: list[dict]
        """
        persons = []
        if self.doc is None:
            return

        label_counts = defaultdict(lambda: defaultdict(int))
        for ent in self.doc.ents:
            label_counts[ent.text.lower()][ent.label_] += 1

        for text, labels in label_counts.items():
            person_count = labels.get("PERSON", 0)
            total = sum(labels.values())
            if (
                person_count / total > 0.5
                and person_count > 3
                and len(text) >= 3
                and text not in self.nlp.Defaults.stop_words
            ):
                persons.append(text)
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
            self.persons, reverse=True, key=lambda entity: len(entity)
        )
        gen_persons = []
        stop_words = self.nlp.Defaults.stop_words
        name = self.clean_string(sorted_persons[0])
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
            p = self.clean_string(sorted_persons[p_idx])
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
        for group in consolidated_persons:
            for idx in range(len(group)):
                persons_dict[group[idx]] = group[0]
        return persons_dict

    def associate_text_quotes(self, quotes: list[dict]) -> list[dict]:
        """
        Associate the quotes from a text with an entity (specifically a person)

        :param er: EntityExtractor for grabbing the dictionary of all variations of a persons canonical name
        :type er: EntityExtractor
        :return: A dictionary mapping canonical character names to a QuoteInfo object
        :rtype: dict[str, QuoteInfo]
        """
        persons_dict = self.build_persons_dict()
        attributed_quotes = []
        unattributed_quotes = 0
        for quote in quotes:
            quote_obj = {
                "quote": quote["quote"],
                "span": quote["span"],
                "word_count": quote["word_count"],
                "speaker": None,
            }
            prior = quote["prior"]
            post = quote["post"]
            for variation, canonical in persons_dict.items():
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
            # if quote_obj["speaker"] == None:
            #     print("Speaker was none")
            #     print(f"Prior: {prior}, Post: {post}")
            attributed_quotes.append(quote_obj)
            attributed = len([q for q in attributed_quotes if q["speaker"] is not None])
            total = len(attributed_quotes)
            print(f"total: {total} attributed: {attributed} ratio: {attributed/total}")
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

    def build_conversational_network(self, quotes: list[dict]) -> dict:
        quotes_len = len(quotes)
        nw_dict = defaultdict(lambda: defaultdict(list))
        for q_idx in range(1, quotes_len):
            prev_speaker = quotes[q_idx - 1]["speaker"]
            curr_speaker = quotes[q_idx]["speaker"]
            if prev_speaker is None or curr_speaker is None:
                continue
            prev_end = quotes[q_idx - 1]["span"][1]
            curr_start = quotes[q_idx]["span"][0]
            space = curr_start - prev_end
            if (curr_speaker != prev_speaker) and (space < ALLOWED_CHARACTER_DIFF):
                nw_dict[prev_speaker][curr_speaker].append(quotes[q_idx]["quote"])
        return nw_dict

    def match_speech_verbs_regex(self, s: str) -> bool:
        verbs_regex = self.verbs_regex
        return bool(re.search(verbs_regex, s))

    # todo: finish this?
    def coref_res(self, s: str) -> None:
        """
        Lightweight coreference resolution that replaces pronouns with
        the most recently named entity relative to gender.

        e.g. if Alice and John are the most recently used entities,
        "she said" becomes "Alice said", and "he said" becomes "John said".

        :param self: Description
        :param s: Description
        :type s: str
        """
        text_words = s.split(" ")
        male_entity = None
        female_entity = None
        for word in text_words:
            clean_word = self.clean_string(word)
            if word[0].isupper() and clean_word in self.persons:
                pass

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
