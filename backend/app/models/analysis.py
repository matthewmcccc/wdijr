from sqlalchemy import String, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
class Analysis:
    id: Mapped[int] = mapped_column(primary_key=True)
    network_data: Mapped[Optional[dict]] = mapped_column(JSON)
    plot_sentiment: Mapped[Optional[dict]] = mapped_column(JSON)
    novel_id: Mapped[int] = mapped_column(ForeignKey("novel.id"))