from sqlmodel import Field, SQLModel


class Keyword(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
