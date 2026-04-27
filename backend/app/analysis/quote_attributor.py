import os
import re
import json
import gender_guesser.detector as gender
from collections import defaultdict
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from app.utils.util import clean_string

POST_SPAN_WINDOW = 3
PRIOR_SPAN_WINDOW = 10


class QuoteAttributor:
    def __init__(self, characters_list: list[str], characters_dict, text, canonical_to_gender: dict[str, str] = None):
        self.characters_dict = characters_dict
        self.gender_detector = gender.Detector()
        self.canonical_to_gender = canonical_to_gender
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

    def associate_text_quotes(
        self, quotes: list[dict]
    ) -> list[dict]:
        """
        Associate the quotes from a text with an entity (specifically a person)

        :param er: EntityExtractor for grabbing the dictionary of all variations of a persons canonical name
        :type er: EntityExtractor
        :return: A dictionary mapping canonical character names to a QuoteInfo object
        :rtype: dict[str, QuoteInfo]
        """
        attributed_quotes = []
        prior_mention_index = []
        post_mention_index = []
        for quote in quotes:
            quote_obj = {
                "quote": quote["quote"],
                "span": quote["span"],
                "word_count": quote["word_count"],
                "speaker": None,
                "sentiment": None,
                "chapter_number": quote["chapter_number"],
                "attribution_rule": None
            }
            prior = quote["prior"]
            post = quote["post"]
           
            for variation, canonical in self.characters_dict.items():
                if self.check_span_for_speech(
                    post.lower(), variation, POST_SPAN_WINDOW
                ):
                    for idx, word in enumerate(post.lower().split()):
                        if word == variation:
                            post_mention_index.append(idx)
                    quote_obj["speaker"] = canonical.lower()
                    quote_obj["attribution_rule"] = "post_span"
                    break
                if self.check_span_for_speech(
                    prior.lower(), variation, PRIOR_SPAN_WINDOW
                ):
                    mentions = []
                    for idx, word in enumerate(prior.lower().split()):
                        if word == variation:
                            mentions.append(idx)
                    if mentions:
                        prior_mention_index.append(len(prior.split()) - max(mentions))
                    quote_obj["speaker"] = canonical.lower()
                    quote_obj["attribution_rule"] = "prior_span"
                    break
                    
            # TODO: test usefulness of this logic on different novels.
            # appears to be beneficial for some, detrimental for others

            if quote_obj["speaker"] == None:
                span_start = quote_obj["span"][0]
                for span_text, _direction in [(post.lower(), 1), (prior.lower(), -1)]:
                    span_text_clean = clean_string(span_text).replace("  ", " ").replace(".", "").replace(",", "").replace("'", "").replace('"', "")
                    words = span_text_clean.split()
                    for word in words:
                        if self.match_speech_verbs_regex(word):
                            for w in words:
                                if w in ("he", "his", "himself"):
                                    quote_obj["speaker"] = self.coref_res(
                                        span_start, "he"
                                    )
                                    quote_obj["attribution_rule"] = "pronoun"
                                    break
                                if w in ("she", "her", "herself"):
                                    quote_obj["speaker"] = self.coref_res(
                                        span_start, "she"
                                    )
                                    quote_obj["attribution_rule"] = "pronoun"
                                    break
                            if quote_obj["speaker"] is not None:
                                break
                    if quote_obj["speaker"] is not None:
                        break
                    

            quote_obj["sentiment"] = self.sid_obj.polarity_scores(quote_obj["quote"])[
                "compound"
            ]
            attributed_quotes.append(quote_obj)
        
        print(f"Average prior mention index: {sum(prior_mention_index)/len(prior_mention_index) if prior_mention_index else 'N/A'}")
        print(f"Average post mention index: {sum(post_mention_index)/len(post_mention_index) if post_mention_index else 'N/A'}")
        
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
        if pronoun == "she":
            return self.female_at[index]
        if pronoun == "he":
            return self.male_at[index]

    def build_entity_index(self, s: str, characters: list[str]) -> None:
        words = s.split(" ")
        male_at = [None] * len(s)
        female_at = [None] * len(s)
        male_entity = None
        female_entity = None
        ch_idx = 0
        
        # Gender anchors
        MALE_TITLES = {"mr", "sir", "master", "captain", "colonel"}
        FEMALE_TITLES = {"mrs", "miss", "ms", "lady"}
        ALL_TITLES = MALE_TITLES | FEMALE_TITLES

        for word_idx in range(len(words)):
            word = words[word_idx]
            clean_word = clean_string(word)
            
            canonical = None
            detected_gender = None
            
            # Check if current word is a name or a title
            if clean_word in self.characters_dict or clean_word in ALL_TITLES:
                
                # Logic: If it's a title, try to pair it with the NEXT word
                if clean_word in ALL_TITLES and word_idx < len(words) - 1:
                    next_word = words[word_idx + 1]
                    clean_next = clean_string(next_word)
                    
                    if clean_next in self.characters_dict:
                        # Success: We found "Mr." + "Knightley"
                        canonical = self.characters_dict[clean_next]
                        detected_gender = "male" if clean_word in MALE_TITLES else "female"
                
                # If we haven't found a pair, check if the current word itself is a name
                if canonical is None and clean_word in self.characters_dict and clean_word not in ALL_TITLES:
                    canonical = self.characters_dict[clean_word]
                    
            # If we found a character, update our gender trackers
            if canonical is not None:
                # 1. Use Title-based gender if we have it
                # 2. Else use canonical_to_gender mapping
                # 3. Else fallback to guessing the first name
                g = detected_gender
                if g is None and self.canonical_to_gender:
                    g = self.canonical_to_gender.get(canonical)
                if g is None:
                    g_guess = self.gender_detector.get_gender(clean_word)
                    if g_guess in ("male", "mostly_male"): g = "male"
                    elif g_guess in ("female", "mostly_female"): g = "female"
                
                if g == "male":
                    male_entity = canonical
                elif g == "female":
                    female_entity = canonical

            # Fill character arrays
            for i in range(ch_idx, min(ch_idx + len(word), len(s))):
                male_at[i] = male_entity
                female_at[i] = female_entity
                
            ch_idx += len(word) + 1
            
        self.male_at = male_at
        self.female_at = female_at