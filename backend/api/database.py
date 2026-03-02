from sqlalchemy import create_engine

engine = create_engine("sqlite://./data/app.db", echo=True)