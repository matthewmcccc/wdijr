from pydantic import BaseModel
import uuid

class CharacterSchemaBase(BaseModel):
    name: str | None = None
    summary: str | None = None
    description: str | None = None
    novel_id: uuid.UUID | None = None

class CharacterSchemaCreate(CharacterSchemaBase):
    pass

class CharacterSchema(CharacterSchemaBase):
    id: int

    class Config:
        from_attributes = True