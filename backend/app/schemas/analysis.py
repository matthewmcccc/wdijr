from pydantic import BaseModel
from typing import List
from schemas.quote import QuoteSchema

class AnalysisSchemaBase(BaseModel):
    novel_id: int
    network: dict

class AnalysisSchemaCreate(AnalysisSchemaBase):
    pass

class AnalysisSchema(AnalysisSchemaBase):
    id: int

    class Config:
        from_attributes = True


