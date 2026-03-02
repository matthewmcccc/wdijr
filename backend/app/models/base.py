from sqlalchemy import select
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession

class Base(DeclarativeBase):
    pass

    @classmethod
    async def create(cls, db: AsyncSession, id=None, **kwargs):
        tx = cls(id=id, **kwargs)
        db.add(tx)
        await db.commit()
        await db.refresh(tx)
        return tx
    
    @classmethod
    async def get(cls, db: AsyncSession, id: str):
        try:
            tx = await db.get(cls, id)
        except NoResultFound:
            return None
        return tx
    
    @classmethod
    async def get_all(cls, db: AsyncSession):
        return (await db.execute(select(cls))).scalars().all()