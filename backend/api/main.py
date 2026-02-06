from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from nlp.plot_sentiment import PlotSentiment
from parsers.epub import Epub, epub
from services import book_processor
import os
import tempfile
import shutil
from celery.result import AsyncResult
from services.celery_worker import celery_app
from services.task_states import TaskState

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "API is running"}
    
@app.post("/upload")
async def upload(file: UploadFile):
    try:
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(file.file, tmp)
            book_path = tmp.name
        if "epub" in suffix:
            task = book_processor.process_epub.delay(book_path)
            return {"task_id": task.id, "status": "Task submitted"}
        # todo  
        if "pdf" in suffix:
            pass
    except Exception:
        raise HTTPException(status_code=500, detail="Couldn't read uploaded file")
    return {"filename": file.filename }

@app.get("/task/{task_id}")
async def get_task_status(task_id: str):
    task = AsyncResult(task_id, app=celery_app)

    if task.state == TaskState.PENDING:
        response = {
            "state": task.state,
            "status": "Task is waiting to start..."
        }
    elif task.state == TaskState.PROCESSING:
        response = {
            "state": task.state,
            "status": task.info.get("status", "")
        }
    elif task.state == TaskState.SUCCESS:
        response = {
            "state": task.state,
            "result": task.result
        }
    elif task.state == TaskState.FAILURE:
        response = {
            "state": task.state,
            "status": str(task.info)
        }
    else:
        response = {
            "state": task.state,
            "status": "Unknown state"
        }

    return response