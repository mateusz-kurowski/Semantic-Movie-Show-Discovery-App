import polars as pl
import pytest
from dataset import get_unique_values_from_df_col, str_to_str_list


# Arrange
@pytest.fixture
def test_dataset():
    return pl.DataFrame(
        {
            "id": [1, 2, 3, 4],
            "title": ["Test Movie 1", "Test Movie 2", "", None],
            "vote_average": [8.5, 7.0, 0.0, None],
            "vote_count": [100, 50, 0, None],
            "status": ["Released", "Released", "", None],
            "release_date": ["2023-01-01", "2022-05-15", "", None],
            "revenue": [1000000, 500000, 0, None],
            "runtime": [120, 90, 0, None],
            "adult": [False, False, False, None],
            "backdrop_path": ["/backdrop1.jpg", "/backdrop2.jpg", "", None],
            "budget": [500000, 200000, 0, None],
            "homepage": ["http://test1.com", "", "", None],
            "imdb_id": ["tt1234567", "tt7654321", "", None],
            "original_language": ["en", "fr", "", None],
            "original_title": ["Test Movie 1", "Un Autre Film", "", None],
            "overview": ["Overview 1.", "Overview 2.", "", None],
            "popularity": [10.5, 5.0, 0.0, None],
            "poster_path": ["/poster1.jpg", "/poster2.jpg", "", None],
            "tagline": ["Tagline 1", "Tagline 2", "", None],
            "genres": ["Action, Comedy", "Drama, Romance", "", None],
            "production_companies": ["Test Co", "French Co", "", None],
            "production_countries": ["United States", "France", "", None],
            "spoken_languages": ["English", "French", "", None],
            "keywords": ["test, action", "drama, french", "", None],
        }
    )


def test_str_to_str_list():
    # Act
    tags = "a, b, c, d, e"
    result = str_to_str_list(tags)
    # Assert
    assert result == ["a", "b", "c", "d", "e"]


def test_get_unique_values_from_df_col(test_dataset):
    # Act
    genres = get_unique_values_from_df_col(
        test_dataset.drop_nulls("genres").filter(pl.col("genres") != ""), "genres"
    )
    keywords = get_unique_values_from_df_col(
        test_dataset.drop_nulls("keywords").filter(pl.col("keywords") != ""), "keywords"
    )
    # Assert
    assert sorted(genres) == ["Action", "Comedy", "Drama", "Romance"]
    assert sorted(keywords) == ["action", "drama", "french", "test"]
