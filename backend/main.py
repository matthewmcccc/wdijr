import io
from pathlib import Path
from parsers.epub import Epub
from nlp.ner import EntityExtractor
from nlp.plot_sentiment import PlotSentiment

if __name__ == "__main__":
    book_path = Path("./temp/wh.epub")
    book: Epub = Epub(book_path)
    ps: PlotSentiment = PlotSentiment()
    valence = ps.get_section_valence(book.get_full_text_word_list())
    fd = ps.first_difference(valence)
    wc = book.get_full_word_count()
    print(f"first difference: {fd}")
    print(f"word count: {wc}")