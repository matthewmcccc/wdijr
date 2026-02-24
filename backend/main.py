import io
from pathlib import Path
from parsers.epub import Epub
from nlp.ner import EntityExtractor
from nlp.plot_sentiment import PlotSentiment

if __name__ == "__main__":
    book_path = Path("./temp/wh.epub")
    book: Epub = Epub(book_path)
    text = book.get_full_text()
    words = book.get_full_text_word_list()
    er: EntityExtractor = EntityExtractor("en_core_web_trf", text)
    ps: PlotSentiment = PlotSentiment()
    valence_vals = ps.get_section_valence(words)
    x_vals = ps.normalize(valence_vals)
    print(f"valence values: {valence_vals}")
    print(f"x vals: {x_vals}")
    print(f"first difference: {ps.first_difference(valence_vals)}")
