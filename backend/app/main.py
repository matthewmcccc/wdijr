from contextlib import asynccontextmanager
from fastapi import FastAPI
from db import sessionmanager
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import os

load_dotenv()

def init_app(init_db=True):
    lifespan = None
    
    db_url = os.getenv("DB_URL")
    if not db_url:
        raise Exception("DB_URL env variable doesn't exist")

    if init_db:
        sessionmanager.init(db_url)

        @asynccontextmanager
        async def lifespan(app: FastAPI):
            async with sessionmanager.connect() as connection:
                await sessionmanager.create_all(connection)
            yield
            if sessionmanager._engine is not None:
                await sessionmanager.close()

    server = FastAPI(title="FastAPI server", lifespan=lifespan)
    server.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    from routes.novel import router as novel_router
    from routes.character import router as character_router

    server.include_router(novel_router, prefix="/api", tags=["novel"])
    server.include_router(character_router, prefix="/api", tags=["character"])

    return server

server = init_app()
