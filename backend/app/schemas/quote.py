from pydantic import BaseModel

class QuoteSchemaBase(BaseModel):
    id: str
    content: str
    novel_id: str | None = None

class QuoteSchemaCreate(QuoteSchemaBase):
    pass

class QuoteSchema(QuoteSchemaBase):
    id: int

    class Config:
        from_attributes = True