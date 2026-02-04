import io
from pathlib import Path
from parsers.epub import Epub
from nlp.ner import EntityExtractor
from nlp.plot_sentiment import PlotSentiment

if __name__ == "__main__":
    book_path = Path("./temp/aaiw.epub")
    book: Epub = Epub(book_path)
    chapter_words = book.get_full_words()
    ps: PlotSentiment = PlotSentiment()
    valence_vals: list[float] = ps.get_section_valence(chapter_words)
    ps.visualise_sentiment(valence_vals)
    
