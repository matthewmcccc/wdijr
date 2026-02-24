import io
from pathlib import Path
from parsers.epub import Epub
from nlp.ner import EntityExtractor
from nlp.plot_sentiment import PlotSentiment

if __name__ == "__main__":
    book_path = Path("./temp/wh.epub")
    book: Epub = Epub(book_path)
    ps: PlotSentiment = PlotSentiment()
    text_span = book.get_text_span(65000, 71000)
    words = book.get_full_text_word_list()
    valence = ps.get_section_valence(words)
    fd = ps.first_difference(valence)
    book.get_spans_from_index_list(fd)
    print(f"valence: {valence}")
    print(f"first difference: {fd}")