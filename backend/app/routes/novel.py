from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from db import get_db

from models.novel import Novel as NovelModel

router = APIRouter(prefix="/novel", tags=["novel"])

class NovelSchemaBase(BaseModel):
    title: str | None = None
    author: str | None = None

class NovelSchemaCreate(NovelSchemaBase):
    pass

class NovelSchema(NovelSchemaBase):
    id: int

    class Config:
        from_attributes = True

@router.get("/get-novel", response_model=NovelSchema)
async def get_novel(id: int, db: AsyncSession = Depends(get_db)):
    novel = await NovelModel.get(db, id)
    return novel

@router.get("/get-novels", response_model=List[NovelSchema])
async def get_novels(db: AsyncSession = Depends(get_db)):
    users = await NovelModel.get_all(db)
    return users

@router.post("/create-novel", response_model=NovelSchema)
async def create_novel(novel: NovelSchemaCreate, db: AsyncSession = Depends(get_db)):
    novel = await NovelModel.create(db, **novel.dict())
    return novel