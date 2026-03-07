from typing import List
from pydantic import BaseModel
from .novel import NovelSchema
from .character import CharacterSchema
from .analysis import AnalysisSchema

class SummarySchema(BaseModel):
    novel: NovelSchema
    characters: List[CharacterSchema]
    analysis: AnalysisSchema

    class Config:
        from_attributes = True