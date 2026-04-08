import uuid
from pydantic import BaseModel


class ChapterSchemaBase(BaseModel):
    id: str
    chapter_number: int
    title: str
    summary: str | None = None
    overview: str | None = None
    novel_id: uuid.UUID | None = None
    sentiment: list | None = None


class ChapterSchemaCreate(ChapterSchemaBase):
    pass


class ChapterSchema(ChapterSchemaBase):
    id: int

    class Config:
        from_attributes = True
