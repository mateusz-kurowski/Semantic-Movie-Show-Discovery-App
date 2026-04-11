import pytest
from dataset import str_to_str_list
import polars as pl
import os


# Arrange
@pytest.fixture
def test_dataset():
    df_path = os.path.join("test_data", "short.csv")
    pl.scan_csv(df_path)


def test_str_to_str_list():
    # Act
    tags = "a, b, c, d, e"
    result = str_to_str_list(tags)
    # Assert
    assert result == ["a", "b", "c", "d", "e"]
