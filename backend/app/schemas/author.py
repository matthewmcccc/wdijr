from pydantic import BaseModel
from app.schemas.quote import QuoteSchema
import uuid


class AuthorSchemaBase(BaseModel):
    name: str
    description: str
    image_url: str
    other_works: list
    novel_id: uuid.UUID


class AuthorSchemaCreate(AuthorSchemaBase):
    pass


class AuthorSchema(AuthorSchemaBase):
    id: int

    class Config:
        from_attributes = True
