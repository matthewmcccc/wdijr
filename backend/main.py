import io
from pathlib import Path
from parsers.epub import Epub
from nlp.ner import EntityExtractor
from nlp.plot_sentiment import PlotSentiment

if __name__ == "__main__":
    book_path = Path("./temp/frankenstein.epub")
    book: Epub = Epub(book_path)
    text = book.get_full_text()
    er: EntityExtractor = EntityExtractor("en_core_web_trf", text)
    book.associate_text_quotes(er)
    # delta: list[(int, float)] = ps.first_difference(valence_vals)
    # ps.get_text_for_summarization(chapter_words, delta, len(valence_vals))
    # ps.normalize(valence_vals)
    # ps.visualise_sentiment(valence_vals)
    # ps.get_text_for_summarization(valence_vals)
