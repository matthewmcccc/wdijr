from pydantic import BaseModel

class CharacterSchemaBase(BaseModel):
    name: str | None = None
    summary: str | None = None
    description: str | None = None
    novel_id: int | None = None

class CharacterSchemaCreate(CharacterSchemaBase):
    pass

class CharacterSchema(CharacterSchemaBase):
    id: int

    class Config:
        from_attributes = True