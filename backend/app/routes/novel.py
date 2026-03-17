import uuid
from app.models.quote import Quote as QuoteModel
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.schemas.novel import NovelSchema, NovelSchemaCreate
from app.schemas.character import CharacterSchema
from app.schemas.summary import SummarySchema
from app.models.novel import Novel as NovelModel
from app.models.character import Character as CharacterModel
from app.models.analysis import Analysis as AnalysisModel
from app.models.chapter import Chapter as ChapterModel
from app.db import get_db

router = APIRouter(prefix="/novel", tags=["novel"])


@router.get("/{novel_id}", response_model=NovelSchema)
async def get_novel(novel_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    novel = await NovelModel.get(db, novel_id)
    return novel


@router.get("/", response_model=List[NovelSchema])
async def get_novels(db: AsyncSession = Depends(get_db)):
    users = await NovelModel.get_all(db)
    return users


@router.post("/", response_model=NovelSchema)
async def create_novel(novel: NovelSchemaCreate, db: AsyncSession = Depends(get_db)):
    novel = await NovelModel.create(db, **novel.dict())
    return novel


@router.get("/{novel_id}/characters", response_model=List[CharacterSchema])
async def get_characters(novel_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    characters = await CharacterModel.get_from_novel_id(db=db, id=novel_id)
    return characters


@router.get("/{novel_id}/data", response_model=SummarySchema)
async def get_novel_data(novel_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    novel = await NovelModel.get_from_id(novel_id, db)
    characters = await CharacterModel.get_from_novel_id(db=db, id=novel_id)
    analysis = await AnalysisModel.get_from_novel_id(db, novel_id)
    quotes = await QuoteModel.get_from_novel_id(db, novel_id)
    chapters = await ChapterModel.get_from_novel_id(db, novel_id)
    return {
        "novel": novel,
        "characters": characters,
        "analysis": analysis,
        "quotes": quotes,
        "chapters": chapters,
    }
