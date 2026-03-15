from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.schemas.character import CharacterSchema, CharacterSchemaCreate
from app.models.character import Character as CharacterModel
from app.db import get_db

router = APIRouter(prefix="/character", tags=["character"])

@router.get("/character/{character_id}", response_model=CharacterSchema)
async def get_character(id: int, db: AsyncSession = Depends(get_db)):
    character = await CharacterModel.get(db, id)
    return character

@router.get("/", response_model=List[CharacterSchema])
async def get_all_characters(db: AsyncSession = Depends(get_db)):
    characters = await CharacterModel.get_all(db)
    return characters

@router.post("/", response_model=CharacterSchema)
async def create_character(character: CharacterSchemaCreate, db: AsyncSession = Depends(get_db)):
    character = await CharacterModel.create(db, **character.dict())
    return character