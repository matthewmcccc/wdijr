from pydantic import BaseModel

class NovelSchemaBase(BaseModel):
    title: str | None = None
    author: str | None = None

class NovelSchemaCreate(NovelSchemaBase):
    pass

class NovelSchema(NovelSchemaBase):
    id: int

    class Config:
        from_attributes = True