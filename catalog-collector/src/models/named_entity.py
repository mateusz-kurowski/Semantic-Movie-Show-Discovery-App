from collections.abc import Sequence
from typing import TypeVar

from sqlalchemy import Engine
from sqlmodel import Field, Session, SQLModel, select

T = TypeVar("T", bound="NamedEntity")


class NamedEntity(SQLModel):
    id: int | None = Field(default=None, primary_key=True)
    name: str


def get_all_records(engine: Engine, model: type[T]) -> Sequence[T]:
    with Session(engine) as session:
        stmt = select(model)
        records = session.exec(stmt)
        return records.all()


def create_entries(engine: Engine, entries: list[T]) -> None:
    with Session(engine) as session:
        for entry in entries:
            session.add(entry)
        session.commit()
