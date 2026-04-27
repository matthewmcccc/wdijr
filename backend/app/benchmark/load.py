import os
import csv
import os

data_dir = os.path.join(os.path.dirname(__file__), "data/annotations/")

def load(filename):
    quotes = []
    filepath = os.path.join(data_dir, filename)
    with open(filepath, mode='r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            quotes.append(row)
    return quotes