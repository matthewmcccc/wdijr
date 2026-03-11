from typing import List
from pydantic import BaseModel
from .novel import NovelSchema
from .character import CharacterSchema
from .analysis import AnalysisSchema
from .quote import QuoteSchema
from .chapter import ChapterSchema

class SummarySchema(BaseModel):
    novel: NovelSchema
    characters: List[CharacterSchema]
    analysis: AnalysisSchema
    quotes: List[QuoteSchema]
    chapters: List[ChapterSchema]

    class Config:
        from_attributes = True