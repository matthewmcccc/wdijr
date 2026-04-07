from pydantic import BaseModel, Json
from typing import Any
import json
import uuid


class CharacterSchemaBase(BaseModel):
    name: str | None = None
    summary: str | None = None
    description: str | None = None
    top_relationships: dict | list
    top_quote: str | None = None
    novel_id: uuid.UUID | None = None
    image_url: str | None = None


class CharacterSchemaCreate(CharacterSchemaBase):
    pass


class CharacterSchema(CharacterSchemaBase):
    id: int

    class Config:
        from_attributes = True
