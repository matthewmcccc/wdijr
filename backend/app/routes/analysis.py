from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from schemas.quote import QuoteSchema, QuoteSchemaCreate
from schemas.analysis import AnalysisSchema, AnalysisSchemaCreate
from services.book_processor import get_quotes
from db import get_db


router = APIRouter(prefix="/character", tags=["character"])

@router.get("/analysis/quotes", response_model=AnalysisSchema)
async def get_analysis_quotes(db: AsyncSession = Depends(get_db)):
    quotes = await get_quotes()
    return quotes