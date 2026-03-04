import os
from parsers.epub import Epub
from services.celery_worker import celery_app
from nlp.plot_sentiment import PlotSentiment
from services.task_states import TaskState

book_path = "../temp/aaiw.epub"

@celery_app.task(bind=True)
def process_epub(self) -> Epub:
    try:
        if not os.path.exists(book_path):
            raise FileNotFoundError(f"File not found: {book_path}")

        book: Epub = Epub(book_path)
        self.update_state(
            state=TaskState.PROCESSING, meta={"status": "Processing novel..."}
        )

        return book
    except Exception as e:
        print(f"Error processing {book_path}: {str(e)}")
    finally:
        if os.path.exists(book_path):
            try:
                os.remove(book_path)
                print(f"Cleaned up file: {book_path}")
            except Exception as e:
                print(f"Failed to delete {book_path}: {str(e)}")


@celery_app.task(bind=True)
def get_quotes(self):
    try:
        book = process_epub(book_path)

        quotes = book.get_full_text_quotes()

        return quotes
    except Exception as e:
        print(f"Error grabbing quotes: {e}")
        


