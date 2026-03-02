from contextlib import asynccontextmanager
from fastapi import FastAPI
from db import sessionmanager
import os

def init_app(init_db=True):
    lifespan = None
    db_url = ""

    try:
        db_url = os.getenv("DB_URL")
    except:
        raise Exception("Couldn't get DB URL") 

    if init_db:
        sessionmanager.init(db_url)

        @asynccontextmanager
        async def lifespan(app: FastAPI):
            yield
            if sessionmanager._engine is not None:
                await sessionmanager.close()

    server = FastAPI(title="FastAPI server", lifespan=lifespan)
    from routes.novel import router as novel_router

    server.include_router(novel_router, prefix="/api", tags=["novel"])

    return server
