import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from sqlalchemy import select
from app.schemas.quote import QuoteSchema, QuoteSchemaCreate
from app.models.quote import Quote as QuoteModel
from app.db import get_db

router = APIRouter(prefix="/quote", tags=["quote"])


@router.get("/{novel_id}", response_model=List[QuoteSchema])
async def get_quotes_by_novel(novel_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    quotes = await QuoteModel.get_from_novel_id(db, novel_id)
    return quotes
