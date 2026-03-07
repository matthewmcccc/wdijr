from typing import List
from pydantic import BaseModel
from .novel import NovelSchema
from .character import CharacterSchema
from .analysis import AnalysisSchema

class SummarySchemaBase(BaseModel):
    novel: NovelSchema
    characters: List[CharacterSchema]
    analysis: AnalysisSchema

class SummarySchemaCreate(SummarySchemaBase):
    pass

class SummarySchema(SummarySchemaBase):
    id: int

    class Config:
        from_attributes = True
