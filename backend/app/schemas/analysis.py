from pydantic import BaseModel
from typing import List
from app.schemas.quote import QuoteSchema
import uuid


class AnalysisSchemaBase(BaseModel):
    novel_id: uuid.UUID
    conversational_network: dict
    cooccurrence_network: list
    sentiment_values: list
    inflection_points: list
    plot_summaries: list
    character_sentiment: dict
    chapter_networks: dict


class AnalysisSchemaCreate(AnalysisSchemaBase):
    pass


class AnalysisSchema(AnalysisSchemaBase):
    id: int

    class Config:
        from_attributes = True
