import io
from pathlib import Path
from parsers.epub import Epub
from nlp.ner import EntityExtractor
from nlp.plot_sentiment import PlotSentiment

if __name__ == "__main__":
    book_path = Path("./temp/wh.epub")
    book: Epub = Epub(book_path)
    ps: PlotSentiment = PlotSentiment()
    text_span = book.get_text_span(67000, 69000)
    print(text_span)