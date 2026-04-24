import datetime
import pytest
import polars as pl
from sqlmodel import Session, SQLModel, create_engine, select

from db import _parse_list_col, _upsert_entities, insert_movies_in_batches
from models.movie import Movie
from models.genre import Genre
from models.links import MovieGenreLink
from models.named_entity import get_all_records


# Arrange
@pytest.fixture
def engine():
    engine = create_engine("sqlite:///:memory:")
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture
def test_dataset():
    return pl.DataFrame(
        {
            "id": [1, 2],
            "title": ["Test Movie 1", "Test Movie 2"],
            "vote_average": [8.5, 7.0],
            "vote_count": [100, 50],
            "status": ["Released", "Released"],
            "release_date": [datetime.date(2023, 1, 1), datetime.date(2022, 5, 15)],
            "revenue": [1000000, 500000],
            "runtime": [120, 90],
            "adult": [False, False],
            "backdrop_path": ["/backdrop1.jpg", "/backdrop2.jpg"],
            "budget": [500000, 200000],
            "homepage": ["http://test1.com", ""],
            "imdb_id": ["tt1234567", "tt7654321"],
            "original_language": ["en", "fr"],
            "original_title": ["Test Movie 1", "Un Autre Film"],
            "overview": ["Overview 1.", "Overview 2."],
            "popularity": [10.5, 5.0],
            "poster_path": ["/poster1.jpg", "/poster2.jpg"],
            "tagline": ["Tagline 1", "Tagline 2"],
            "genres": ["Action, Comedy", "Drama"],
            "production_companies": ["Test Co", ""],
            "production_countries": ["United States", ""],
            "spoken_languages": ["English", "French"],
            "keywords": ["action, fun", "drama, romantic"],
        }
    )


def test_parse_list_col():
    assert _parse_list_col("a, b, c") == ["a", "b", "c"]
    assert _parse_list_col(None) == []
    assert _parse_list_col("") == []
    assert _parse_list_col("a,, b") == ["a", "b"]


def test_upsert_entities(engine, monkeypatch):
    # Mock db.engine to use our in-memory engine
    import db

    monkeypatch.setattr(db, "engine", engine)

    # Act: First insert
    res1 = _upsert_entities(Genre, ["Action", "Comedy"])
    assert "Action" in res1
    assert "Comedy" in res1
    assert res1["Action"] == 1
    assert res1["Comedy"] == 2

    # Act: Second insert with an existing item and a new item
    res2 = _upsert_entities(Genre, ["Action", "Drama"])
    assert "Action" in res2
    assert "Drama" in res2
    assert res2["Action"] == 1
    assert res2["Drama"] == 3

    # Assert DB state
    records = get_all_records(engine, Genre)
    assert len(records) == 3
    names = [r.name for r in records]
    assert "Action" in names
    assert "Comedy" in names
    assert "Drama" in names


def test_insert_movies_in_batches(engine, test_dataset, monkeypatch):
    import db

    monkeypatch.setattr(db, "engine", engine)

    # Act
    insert_movies_in_batches(test_dataset, batch_size=10)

    # Assert
    with Session(engine) as session:
        movies = session.exec(select(Movie)).all()
        assert len(movies) == 2

        genres = session.exec(select(Genre)).all()
        assert len(genres) == 3
        genre_names = {g.name for g in genres}
        assert genre_names == {"Action", "Comedy", "Drama"}

        links = session.exec(select(MovieGenreLink)).all()
        assert len(links) == 3

        # Verify specific linkages instead of assuming ID orders
        action_id = next(g.id for g in genres if g.name == "Action")
        comedy_id = next(g.id for g in genres if g.name == "Comedy")
        drama_id = next(g.id for g in genres if g.name == "Drama")

        link_pairs = {(l.movie_id, l.genre_id) for l in links}
        assert (1, action_id) in link_pairs
        assert (1, comedy_id) in link_pairs
        assert (2, drama_id) in link_pairs
