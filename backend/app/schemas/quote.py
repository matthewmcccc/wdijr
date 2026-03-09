import uuid
from pydantic import BaseModel

class QuoteSchemaBase(BaseModel):
    id: str
    content: str
    novel_id: uuid.UUID | None = None

class QuoteSchemaCreate(QuoteSchemaBase):
    pass

class QuoteSchema(QuoteSchemaBase):
    id: int

    class Config:
        from_attributes = True