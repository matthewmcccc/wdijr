from pydantic import BaseModel
from typing import List, Optional
from app.schemas.quote import QuoteSchema
import uuid


class AnalysisSchemaBase(BaseModel):
    novel_id: uuid.UUID
    conversational_network: dict
    cooccurrence_network: dict
    sentiment_values: list
    inflection_points: list
    plot_summaries: list
    character_sentiment: dict
    chapter_networks: dict
    motifs: Optional[dict] = None
    lexical_richness: Optional[dict] = None


class AnalysisSchemaCreate(AnalysisSchemaBase):
    pass


class AnalysisSchema(AnalysisSchemaBase):
    id: int

    class Config:
        from_attributes = True
