import spacy
from collections import Counter

class EntityExtractor():
    def __init__(self, model: str):
        self.nlp = spacy.load(model)
        self.doc = None

    def process_text(self, text: str) -> None:
        self.doc = self.nlp(text)
        return self.doc
    
    def print_entity_counts(self) -> None:
        if self.doc is None:
            return
        counts = Counter((ent.text, ent.label_) for ent in self.doc.ents)
        for (text, label), count in counts.most_common():
            if label == "PERSON":
                print(f"{text} ({label}): {count}")

