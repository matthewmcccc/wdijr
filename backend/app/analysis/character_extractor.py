from collections import defaultdict
from app.utils.util import clean_string

class CharacterExtractor:
    def __init__(
        self,
        text: str,
        nlp,
    ):
        self.text = text
        self.nlp = nlp 

        self.doc = None
        self.characters = []
        self.consolidated_characters = []

    def run(self):
        """
        Takes in entire content of a novel as a string
        and runs it through the spaCy NLP pipeline.

        :param self: Description
        :param text: Description
        :type text: str
        """
        self.doc = self.nlp(self.text)
        self.characters = self.get_characters_from_text()
        self.consolidated_characters = self.consolidate_characters()
        return self

    def get_characters_from_text(self) -> list[str]:
        """
        Retrieves all entities with the "PERSON" entity label from a text
        with some filtering.

        :return: A list of all of the characters from a text and their counts.
        :rtype: list[dict]
        """
        characters = []
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
                characters.append((text, person_count))
        characters = sorted(characters, key=lambda x: x[1], reverse=True)
        return [person[0] for i, person in enumerate(characters)]

    def consolidate_characters(self) -> list[list[str]]:
        """
        Consolidates unique character name variations into groups.

        Each group contains a full name and some of it's possible variations
        e.g. ["Van Helsing", "Van", "Helsing"]

        :return: List of consolidated name groups
        :rtype: list[list[str]]
        """
        gen_characters = []
        stop_words = self.nlp.Defaults.stop_words
        if not self.characters:
            return
        for p_idx in range(len(self.characters)):
            seen = False
            p = clean_string(self.characters[p_idx])
            p_split = p.split(" ")
            for g_idx in range(len(gen_characters)):
                if p in gen_characters[g_idx]:
                    seen = True
                for item in p_split:
                    if item in gen_characters[g_idx]:
                        seen = True
                if seen:
                    if p not in gen_characters[g_idx]:
                        gen_characters[g_idx].append(p)
                    break
            if not seen:
                if [p] == p_split:
                    gen_characters.append([p])
                else:
                    gen_characters.append(
                        [
                            p,
                            *[
                                item
                                for item in p_split
                                if len(item) >= 3 and item not in stop_words
                            ],
                        ]
                    )
        return gen_characters

    def characters_to_id(self):
        mapping = defaultdict(int)
        for i, character in enumerate(self.canonical_characters):
            mapping[character] = i
        return mapping

    def build_character_dict(self) -> dict:
        """
        Build dictionary for associating variations of a name with their
        canonical name

        e.g. {"Van Helsing": "Van Helsing", "Van": "Van Helsing"}

        :return: Dictionary mapping variations of names to their parent or canonical name
        :rtype: dict
        """
        persons_dict = {}
        for group in self.consolidated_characters:
            for idx in range(len(group)):
                persons_dict[group[idx]] = group[0]
        return persons_dict
