import json
import os
import spacy
import gender_guesser.detector as gender
import regex as re
import networkx as nx
from bs4 import BeautifulSoup
from app.parsers.epub import Epub
from itertools import combinations
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
        self.consolidated_persons = self.consolidate_persons()
        self.canonical_characters = [p[0] for p in self.consolidated_persons]
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
                persons.append((text, person_count))
        persons = sorted(persons, key=lambda x: x[1], reverse=True)
        return [person[0] for i, person in enumerate(persons)]

    def consolidate_persons(self) -> list[list[str]]:
        """
        Consolidates unique character name variations into groups.

        Each group contains a full name and some of it's possible variations
        e.g. ["Van Helsing", "Van", "Helsing"]

        :return: List of consolidated name groups
        :rtype: list[list[str]]
        """
        gen_persons = []
        stop_words = self.nlp.Defaults.stop_words
        name = self.clean_string(self.persons[0])
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
        for p_idx in range(len(self.persons)):
            seen = False
            p = self.clean_string(self.persons[p_idx])
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

    def persons_to_id(self):
        mapping = defaultdict(int)
        for i, person in enumerate(self.canonical_characters):
            mapping[person] = i
        return mapping
    
    def build_cooccurrence_network(self, paras: list[str]) -> dict:
        cooccurrence_dict = defaultdict(list)
        persons_dict = self.build_persons_dict()
        for para in paras:
            para_lower = para.lower()
            seen = set()
            for variant, canonical in persons_dict.items():
                if variant in para_lower:
                    seen.add(canonical)
            for char_a, char_b in combinations(seen, 2):
                key = tuple(sorted([char_a, char_b]))
                cooccurrence_dict[key].append(1)

        cooccurrence_frequency_dict = defaultdict(int)
        for pair, frequency_list in cooccurrence_dict.items():
            cooccurrence_frequency_dict[pair] = sum(frequency_list)

        graph = nx.Graph()
        for (char_a, char_b), weight in cooccurrence_frequency_dict.items():
            graph.add_edge(char_a, char_b, weight=weight)

        communities = nx.community.greedy_modularity_communities(graph, weight="weight")
        group_map = {}
        for group_idx, community in enumerate(communities):
            for character in community:
                group_map[character] = group_idx

        all_characters = set()
        for (a, b) in cooccurrence_frequency_dict:
            all_characters.add(a)
            all_characters.add(b)

        nodes = [{"id": char, "group": group_map.get(char, 0)} for char in all_characters]
        links = [{"source": a, "target": b, "value": v} for (a, b), v in cooccurrence_frequency_dict.items()]

        return {"nodes": nodes, "links": links}

    def build_chapter_cooccurrence(self, chapters_paras: dict[int, list[str]]) -> dict:
        persons_dict = self.build_persons_dict()
        result = {}
        for idx, paras in chapters_paras.items():
            counts = defaultdict(int)
            for para in paras:
                para_lower = para.lower()
                seen = set()
                for variant, canonical in persons_dict.items():
                    if variant in para_lower:
                        seen.add(canonical)
                for char_a, char_b in combinations(seen, 2):
                    key = tuple(sorted([char_a, char_b]))
                    counts[key] += 1
            result[idx] = {f"{a}--{b}": count for (a, b), count in counts.items()}
        return result

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
                "chapter_number": quote["chapter_number"],
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
            # UNCOMMENT TO SEE AWESOME QUOTE ATTRIBUTION STATS!!!
            # print(f"total: {total} attributed: {attributed} ratio: {attributed/total}")
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
            if (prev_speaker != curr_speaker) and (space < ALLOWED_CHARACTER_DIFF):
                nw_dict[curr_speaker][prev_speaker].append(
                    {"quote": quotes[q_idx]["quote"], "sentiment": sentiment}
                )
        return nw_dict

    @staticmethod
    def build_sentiment_dict_from_network(nw_dict: dict) -> dict:
        character_sentiment_dict = defaultdict(dict)
        for speaker, quote_dict in nw_dict.items():
            for target, quote_list in quote_dict.items():
                character_sentiment_dict[speaker][target] = [
                    q["sentiment"] for q in quote_list
                ]
        return character_sentiment_dict

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

    def character_lexical_richness(self, quotes, window: 100):
        """
        
        """
        associated_quotes = self.associate_text_quotes(quotes)
        associated_quotes_dict = defaultdict(list)
        for quote_obj in associated_quotes:
            quote = quote_obj["quote"]
            speaker = quote_obj["speaker"]
            if speaker in self.canonical_characters:
                associated_quotes_dict[speaker].append(quote)
        mattr_obj = defaultdict(float)
        for speaker, quotes_list in associated_quotes_dict.items():
            quote_str = (" ").join(quotes_list)
            tokens = [w.strip(".,!?;:\"'()") for w in quote_str.lower().split() if w.strip(".,!?;:\"'()")]
            if len(tokens) < window:
                ttr  = round(len(set(tokens)) / len(tokens), 3)
                if ttr != 1.0:
                    mattr_obj[speaker] = {"mattr": round(len(set(tokens)) / len(tokens), 3), "word_count": len(tokens)}
            else: 
                ttrs = []
                for i in range(len(tokens) - window + 1):
                    w = tokens[i : i + window]
                    ttrs.append(len(set(w)) / window)
                ttr = round(sum(ttrs) / len(ttrs), 3)
                if ttr != 1.0:
                    mattr_obj[speaker] = {"mattr": round(sum(ttrs) / len(ttrs), 3), "word_count": len(tokens)}
        return mattr_obj

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
        
    @staticmethod
    def compute_mattr(tokens, window):
        if len(tokens) < window:
            return len(set(tokens)) / len(tokens)
        ttrs = []
        for i in range(len(tokens) - window + 1):
            w = tokens[i : i + window]
            ttrs.append(len(set(w)) / window)
        return sum(ttrs) / len(ttrs)

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

    # TODO: move static methods from here to
    # a helper or service where applicable
    @staticmethod
    def get_nodes_from_network_dict(
        nw_dict: dict[str, dict[str, list[dict]]],
    ) -> list[dict]:
        nodes = []
        links = []
        seen_nodes = set()

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
        """
        Get a list of the top relationships from character to character.

        :param nw_dict: The network dictionary built from associated text quotes
        :type nw_dict: dict
        :param character: The character for which you want to retrieve the top relationships for.
        :type character: str
        :param n: The top n character relationships you want to retrieve
        :type n: int
        """
        counts = {}

        for target, quotes in nw_dict[character].items():
            counts[target] = {
                "count": len(quotes),
                "total_sentiment": sum(q["sentiment"] for q in quotes),
            }

        for speaker, network in nw_dict.items():
            if character in network and speaker != character:
                incoming_quotes = network[character]
                if speaker in counts:
                    counts[speaker]["count"] += len(incoming_quotes)
                    counts[speaker]["total_sentiment"] += sum(
                        q["sentiment"] for q in incoming_quotes
                    )
                else:
                    counts[speaker] = {
                        "count": len(incoming_quotes),
                        "total_sentiment": sum(q["sentiment"] for q in incoming_quotes),
                    }

        result = []
        for name, data in counts.items():
            result.append(
                (name, data["count"], data["total_sentiment"] / data["count"])
            )

        result.sort(key=lambda x: x[1], reverse=True)
        return result[:n]

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
    def get_all_characters(nw_dict: dict) -> list[str]:
        return list(nw_dict.keys())
