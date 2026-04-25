from pydantic import BaseModel
from typing import List, Optional
from app.schemas.quote import QuoteSchema
import uuid


class AnalysisSchemaBase(BaseModel):
    novel_id: uuid.UUID
    conversational_network: dict
    cooccurrence_network: dict
    chapter_cooccurrence_network: dict
    character_chapter_occurences: dict
    sentiment_values: Optional[list] = None
    inflection_points: Optional[list] = None
    plot_summaries: Optional[list] = None
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
