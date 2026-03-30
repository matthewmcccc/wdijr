import uuid
from .quote import QuoteSchema
from pydantic import BaseModel


class NovelSchemaBase(BaseModel):
    title: str | None = None
    author: str | None = None
    cover_url: str | None = None
    description: str | None = None


class NovelSchemaCreate(NovelSchemaBase):
    pass


class NovelSchema(NovelSchemaBase):
    id: uuid.UUID

    class Config:
        from_attributes = True
