from pydantic import BaseModel
from typing import List
from schemas.quote import QuoteSchema
import uuid

class AnalysisSchemaBase(BaseModel):
    novel_id: uuid.UUID
    network: dict
    sentiment_values: list
    inflection_points: list

class AnalysisSchemaCreate(AnalysisSchemaBase):
    pass

class AnalysisSchema(AnalysisSchemaBase):
    id: int

    class Config:
        from_attributes = True


