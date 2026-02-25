import json
import os
import spacy
import gender_guesser.detector as gender
import regex as re
import networkx as nx
from networkx.algorithms import community
from spacy.language import Language
from collections import Counter
from typing import TypedDict
from collections import defaultdict
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

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
        self.gender_detector = gender.Detector()
        self.entity_index = self.build_entity_index(text)
        self.sid_obj = SentimentIntensityAnalyzer()

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
        Retrieve all entities with the "PERSON" entity label from a text.

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
        Consolidates unique character name variations into groups.

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
        for quote in quotes:
            quote_obj = {
                "quote": quote["quote"],
                "span": quote["span"],
                "word_count": quote["word_count"],
                "speaker": None,
                "sentiment": None,
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

    # TODO: write a TypedDict class for this return type...
    def build_conversational_network(
        self, quotes: list[dict]
    ) -> dict[str, dict[str, list[dict]]]:
        """
        Build a conversational network from a list of associated quotes.
        """
        quotes_len = len(quotes)
        nw_dict = defaultdict(lambda: defaultdict(list))
        for q_idx in range(1, quotes_len):
            prev_speaker = quotes[q_idx - 1]["speaker"]
            curr_speaker = quotes[q_idx]["speaker"]
            if prev_speaker is None or curr_speaker is None:
                continue
            prev_end = quotes[q_idx - 1]["span"][1]
            curr_start = quotes[q_idx]["span"][0]
            sentiment = quotes[q_idx]["sentiment"]
            space = curr_start - prev_end
            if (curr_speaker != prev_speaker) and (space < ALLOWED_CHARACTER_DIFF):
                nw_dict[prev_speaker][curr_speaker].append(
                    {"quote": quotes[q_idx]["quote"], "sentiment": sentiment}
                )
        return nw_dict

    def match_speech_verbs_regex(self, s: str) -> bool:
        verbs_regex = self.verbs_regex
        return bool(re.search(verbs_regex, s))

    def build_entity_index(self, s: str) -> None:
        words = s.split(" ")
        male_at = [None] * len(s)
        female_at = [None] * len(s)
        male_entity = None
        female_entity = None
        ch_idx = 0
        for word_idx in range(len(words)):
            word = words[word_idx]
            clean_word = self.clean_string(word)
            if len(word) > 0 and word[0].isupper() and clean_word in self.persons:
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

    # TODO: move static methods from here to
    # a helper or service where applicable
    @staticmethod
    def get_nodes_from_network_dict(
        nw_dict: dict[str, dict[str, list[dict]]],
    ) -> list[dict]:
        nodes = []
        links = []
        seen_nodes = set()
        seen_links = set()

        for character, network in nw_dict.items():
            if character not in seen_nodes:
                nodes.append({"id": str(character), "group": 1})
                seen_nodes.add(character)

            for name, quotes in network.items():
                if name not in seen_nodes:
                    nodes.append({"id": str(name), "group": 1})
                    seen_nodes.add(name)

                links.append(
                    {
                        "source": str(character),
                        "target": str(name),
                        "value": sum(q["sentiment"] for q in quotes),
                    }
                )
        G = nx.Graph()
        G.add_nodes_from([n["id"] for n in nodes])
        G.add_edges_from([(l["source"], l["target"]) for l in links])

        communities = community.louvain_communities(G)
        node_to_group = {}
        for group_id, members in enumerate(communities):
            for member in members:
                node_to_group[member] = group_id

        for node in nodes:
            node["group"] = node_to_group.get(node["id"], 0)

        return {"nodes": nodes, "links": links}

    # TODO: used typeddict
    @staticmethod
    def normalize_sentiment(
        quotes: dict[str, dict[str, list[dict]]],
    ) -> dict[str, dict[str, float]]:
        character_sentiment = defaultdict(lambda: defaultdict(float))

        for speaker, quotes_dict in quotes.items():
            for target, quotes in quotes_dict.items():
                avg_sentiment = sum(q["sentiment"] for q in quotes) / len(quotes)
                character_sentiment[speaker][target] = avg_sentiment

        return character_sentiment

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
    def get_top_relationships(
        nw_dict: dict[str, dict[str, list[dict]]], character, n=3
    ) -> list[str]:
        counts = {}

        for target, quotes in nw_dict[character].items():
            counts[target] = len(quotes)
        for speaker, network in nw_dict.items():
            if character in network and speaker != character:
                incoming = len(network[character])
                counts[speaker] = counts.get(speaker, 0) + incoming
        
        return sorted(counts.items(), key=lambda x: x[1], reverse=True)[:n]
        

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

    @staticmethod
    def get_all_characters(nw_dict: dict) -> list[str]:
        return list(nw_dict.keys())