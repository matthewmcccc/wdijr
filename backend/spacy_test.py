import spacy
import re
import nltk
import time
from collections import Counter
nltk.download('gutenberg')
from nltk.corpus import gutenberg
nlp = spacy.load('en_core_web_sm')

emma = gutenberg.raw('austen-emma.txt')
start = time.time()
parsed_emma = nlp(emma)
end = time.time()

print(f'NLP call time: {end - start:.2f} seconds')

temp = list(parsed_emma.sents)
sample = []

for sent in temp:
    sent = re.sub(r"\s+", " ", sent.text)
    sample.append(sent)

entities = []
type_entity = []
sentences=[]
person_counts = Counter()

start = time.time()
for ent in parsed_emma.ents:
    if ent.text not in entities:
        entities.append(ent.text)
        sentences.append(ent.sent.text)
        type_entity.append(ent.label_)
    if ent.label_ == "PERSON":
        name = ent.text.strip()
        name = re.sub(r"[^\w\s]", "", name)
        if len(name) > 1:
            person_counts[name] += 1
end = time.time()
print(f'NER time: {end - start:.2f} seconds')
print(f'The total number of entities detected was: {len(entities)}\n')
print(Counter(type_entity).most_common())

for name, count in person_counts.most_common(30):
    print(f"Name: {name}, Count: {count}")