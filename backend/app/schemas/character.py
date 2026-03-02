from pydantic import BaseModel

class CharacterSchemaBase(BaseModel):
    first_name: str | None = None
    surname: str | None = None
    description: str | None = None

class CharacterSchemaCreate(CharacterSchemaBase):
    pass

class CharacterSchema(CharacterSchemaBase):
    id: int

    class Config:
        from_attributes = True