import os
from parsers.epub import Epub
from services.celery_worker import celery_app
from nlp.plot_sentiment import PlotSentiment
from services.task_states import TaskState


@celery_app.task(bind=True)
def process_epub(self, book_path: str) -> None:
    try:
        if not os.path.exists(book_path):
            raise FileNotFoundError(f"File not found: {book_path}")

        book: Epub = Epub(book_path)
        ps: PlotSentiment = PlotSentiment()

        self.update_state(
            state=TaskState.PROCESSING, meta={"status": "Extracting text from book..."}
        )

        contents: list[str] = book.get_full_text_word_list()

        self.update_state(
            state=TaskState.PROCESSING, meta={"status": "Getting valence values..."}
        )

        valence_vals: list[float] = ps.get_section_valence(contents)

        return {
            "valence_values": valence_vals,
            "total_valence_values": len(valence_vals),
        }
    except Exception as e:
        print(f"Error processing {book_path}: {str(e)}")
    finally:
        if os.path.exists(book_path):
            try:
                os.remove(book_path)
                print(f"Cleaned up file: {book_path}")
            except Exception as e:
                print(f"Failed to delete {book_path}: {str(e)}")
