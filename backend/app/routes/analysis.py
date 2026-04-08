import tempfile
import requests
import os
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from celery.result import AsyncResult
from app.schemas.quote import QuoteSchema, QuoteSchemaCreate
from app.schemas.analysis import AnalysisSchema, AnalysisSchemaCreate
from app.models.analysis import Analysis as AnalysisModel
from app.services.book_processor import process_text
from app.db import get_db

router = APIRouter(prefix="/analysis", tags=["analysis"])
load_dotenv()


@router.post("/", response_model=AnalysisSchema)
async def create_analysis(
    analysis: AnalysisSchemaCreate, db: AsyncSession = Depends(get_db)
):
    analysis = await AnalysisModel.create(db, **analysis.dict())
    return analysis


@router.get("/")
async def get_all_analyses(db: AsyncSession = Depends(get_db)):
    analyses = await AnalysisModel.get_all(db)
    return analyses


@router.get("/process/{task_id}")
async def get_task_status(task_id: str):
    result = AsyncResult(task_id)

    if result.state == "PENDING":
        return {"status": "pending"}
    elif result.state == "PROCESSING":
        return {"status": "processing", "detail": result.info.get("status")}
    elif result.state == "SUCCESS":
        return {"status": "complete", "data": result.result}
    elif result.state == "FAILURE":
        return {"status": "failed", "detail": str(result.result)}


@router.post("/process")
async def get_analysis(file: UploadFile, db: AsyncSession = Depends(get_db)):
    upload_dir = os.path.join(os.getcwd(), "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    temp_file_path = os.path.join(upload_dir, file.filename)

    with open(temp_file_path, "wb") as temp_file:
        content = await file.read()
        temp_file.write(content)

    task = process_text.delay(temp_file_path)
    return {"task_id": task.id}


@router.post("/download/{book_id}")
async def download_epub(book_id: int):
    epub_res = requests.get(f"https://www.gutenberg.org/ebooks/{book_id}.epub3.images")

    upload_dir = os.path.join(os.getcwd(), "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, f"{book_id}.epub")
    with open(file_path, "wb") as f:
        f.write(epub_res.content)

    task = process_text.delay(file_path)
    return {"task_id": task.id}
