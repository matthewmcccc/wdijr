from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.db import sessionmanager
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
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
    data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data")
    server.mount("/data", StaticFiles(directory=data_dir), name="static_data")
    server.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    from app.routes.novel import router as novel_router
    from app.routes.character import router as character_router
    from app.routes.analysis import router as analysis_router
    from app.routes.quote import router as quote_router

    server.include_router(novel_router, prefix="/api", tags=["novel"])
    server.include_router(character_router, prefix="/api", tags=["character"])
    server.include_router(analysis_router, prefix="/api", tags=["analysis"])
    server.include_router(quote_router, prefix="/api", tags=["quote"])

    return server


server = init_app()
