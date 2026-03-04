from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from schemas.quote import QuoteSchema, QuoteSchemaCreate
from models.quote import Quote as QuoteModel
from db import get_db