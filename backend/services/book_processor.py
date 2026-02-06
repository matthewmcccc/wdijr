from parsers.epub import Epub
from celery_worker import celery_app
from nlp.plot_sentiment import PlotSentiment
from task_states import TaskState

@celery_app.task(bind=True)
def process_epub(self, book: Epub) -> None:
    ps: PlotSentiment = PlotSentiment()
    contents: list[str] = book.get_full_words()
    self.update_state(
        state = TaskState.PROCESSING,
        status = "Task is processing..."
    )
    valence_vals: list[float] = ps.get_section_valence(contents)
    self.update_state(
        state = TaskState.SUCCESS,
        result = len(valence_vals)
    )

    return {
        "valence_values": valence_vals,
        "total_valence_values": len(valence_vals)
    }  
