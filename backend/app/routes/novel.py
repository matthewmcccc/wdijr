import uuid
from models.quote import Quote as QuoteModel
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from schemas.novel import NovelSchema, NovelSchemaCreate
from schemas.character import CharacterSchema
from models.novel import Novel as NovelModel
from models.character import Character as CharacterModel
from models.analysis import Analysis as AnalysisModel
from schemas.summary import SummarySchema
from db import get_db

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
    return {
        "novel": novel,
        "characters": characters,
        "analysis": analysis,
        "quotes": quotes
    }