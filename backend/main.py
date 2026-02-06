import io
from pathlib import Path
from parsers.epub import Epub
from nlp.ner import EntityExtractor
from nlp.plot_sentiment import PlotSentiment

if __name__ == "__main__":
    book_path = Path("./temp/dracula.epub")
    book: Epub = Epub(book_path)
    book_text = book.get_full_text()
    er: EntityExtractor = EntityExtractor("en_core_web_trf")
    er.process_text(book_text)
    er.print_entity_counts()
    # delta: list[(int, float)] = ps.first_difference(valence_vals)
    # ps.get_text_for_summarization(chapter_words, delta, len(valence_vals))
    # ps.normalize(valence_vals)
    # ps.visualise_sentiment(valence_vals)
    # ps.get_text_for_summarization(valence_vals)