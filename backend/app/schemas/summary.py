from typing import List
from pydantic import BaseModel
from .novel import NovelSchema
from .character import CharacterSchema
from .analysis import AnalysisSchema
from .quote import QuoteSchema
from .chapter import ChapterSchema
from .author import AuthorSchema


class SummarySchema(BaseModel):
    novel: NovelSchema
    characters: List[CharacterSchema]
    analysis: AnalysisSchema
    quotes: List[QuoteSchema]
    chapters: List[ChapterSchema]
    author: AuthorSchema

    class Config:
        from_attributes = True
