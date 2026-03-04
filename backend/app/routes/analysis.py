from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from celery.result import AsyncResult
from schemas.quote import QuoteSchema, QuoteSchemaCreate
from schemas.analysis import AnalysisSchema, AnalysisSchemaCreate
from services.book_processor import process_text
from db import get_db

router = APIRouter(prefix="/analysis", tags=["analysis"])

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
async def get_analysis_quotes(db: AsyncSession = Depends(get_db)):
    task = process_text.delay()
    return {"task_id": task.id}