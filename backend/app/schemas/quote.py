from pydantic import BaseModel

class QuoteSchemaBase(BaseModel):
    id: str
    content: str