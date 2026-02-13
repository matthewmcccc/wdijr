import io
from pathlib import Path
from parsers.epub import Epub
from nlp.ner import EntityExtractor
from nlp.plot_sentiment import PlotSentiment

if __name__ == "__main__":
    book_path = Path("./temp/aaiw.epub")
    book: Epub = Epub(book_path)
    text = book.get_full_text()
    er: EntityExtractor = EntityExtractor("en_core_web_trf", text)
    quotes = book.get_full_text_quotes(text)
    associated_quotes = er.associate_text_quotes(quotes)
    nw = er.build_conversational_network(associated_quotes)
    er.normalize_sentiment(nw)
    # delta: list[(int, float)] = ps.first_difference(valence_vals)
    # ps.get_text_for_summarization(chapter_words, delta, len(valence_vals))
    # ps.normalize(valence_vals)
    # ps.visualise_sentiment(valence_vals)
    # ps.get_text_for_summarization(valence_vals)
