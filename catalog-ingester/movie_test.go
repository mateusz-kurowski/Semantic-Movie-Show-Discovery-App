package main

import (
	"reflect"
	"strconv"
	"testing"
)

func TestToQdrantPayloadUsesResolvedID(t *testing.T) {
	t.Parallel()
	movie := Movie{ID: 0, ChunkOrder: 0, SemanticText: "chunk text"}
	point := movie.ToQdrantPayload([]float32{0.1, 0.2}, "overview-dense-vector", "overview-sparse-vector")

	if point.GetId().String() == "" {
		t.Fatalf("expected point ID to be set")
	}

	payload := point.GetPayload()
	pointIDValue, exists := payload["point_id"]
	if !exists {
		t.Fatalf("expected point_id in payload")
	}
	expectedPointID := strconv.FormatUint(movie.ID, 10)
	if pointIDValue.GetStringValue() != expectedPointID {
		t.Fatalf("expected payload point_id to be %q, got %q", expectedPointID, pointIDValue.GetStringValue())
	}
	if point.GetId().GetNum() != movie.ID {
		t.Fatalf("expected point num to be %d, got %d", movie.ID, point.GetId().GetNum())
	}
}

func TestGetMovieIds(t *testing.T) {
	t.Parallel()
	testCases := []struct {
		name        string
		movies      []Movie
		expectedIDs []uint64
	}{
		{
			name: "Basic case with 3 movies",
			movies: []Movie{
				{ID: 1, Title: "Movie 1"},
				{ID: 2, Title: "Movie 2"},
				{ID: 3, Title: "Movie 3"},
			},
			expectedIDs: []uint64{1, 2, 3},
		},
		{
			name:   "Empty movie list",
			movies: []Movie{
				// No movies
			},
			expectedIDs: []uint64{},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			actualIDs := GetMovieIDs(tc.movies)
			if !reflect.DeepEqual(tc.expectedIDs, actualIDs) {
				t.Errorf("Expected %v, got %v", tc.expectedIDs, actualIDs)
			}
		})
	}
}

func TestNamesFromFunctions(t *testing.T) {
	t.Parallel()
	t.Run("Genres", func(t *testing.T) {
		t.Parallel()
		input := []Genre{{ID: 1, Name: "Action"}, {ID: 2, Name: "Comedy"}}
		expected := []string{"Action", "Comedy"}
		if got := namesFrom(input); !reflect.DeepEqual(got, expected) {
			t.Errorf("NamesFrom() = %v, want %v", got, expected)
		}
		if got := namesFrom[Genre](nil); len(got) != 0 {
			t.Errorf("NamesFrom[Genre](nil) = %v, want empty slice", got)
		}
	})

	t.Run("Companies", func(t *testing.T) {
		t.Parallel()
		input := []Company{{ID: 1, Name: "Warner Bros"}, {ID: 2, Name: "Pixar"}}
		expected := []string{"Warner Bros", "Pixar"}
		if got := namesFrom(input); !reflect.DeepEqual(got, expected) {
			t.Errorf("NamesFrom() = %v, want %v", got, expected)
		}
	})

	t.Run("Countries", func(t *testing.T) {
		t.Parallel()
		input := []Country{{ID: 1, Name: "USA"}, {ID: 2, Name: "UK"}}
		expected := []string{"USA", "UK"}
		if got := namesFrom(input); !reflect.DeepEqual(got, expected) {
			t.Errorf("NamesFrom() = %v, want %v", got, expected)
		}
	})

	t.Run("Languages", func(t *testing.T) {
		t.Parallel()
		input := []Language{{ID: 1, Name: "English"}, {ID: 2, Name: "Spanish"}}
		expected := []string{"English", "Spanish"}
		if got := namesFrom(input); !reflect.DeepEqual(got, expected) {
			t.Errorf("NamesFrom() = %v, want %v", got, expected)
		}
	})

	t.Run("Keywords", func(t *testing.T) {
		t.Parallel()
		input := []Keyword{{ID: 1, Name: "space"}, {ID: 2, Name: "alien"}}
		expected := []string{"space", "alien"}
		if got := namesFrom(input); !reflect.DeepEqual(got, expected) {
			t.Errorf("NamesFrom() = %v, want %v", got, expected)
		}
	})
}

func TestBuildSemanticText(t *testing.T) {
	t.Parallel()
	t.Run("all fields present", func(t *testing.T) {
		t.Parallel()
		movie := Movie{
			Title:   "Inception",
			Tagline: new("Your mind is the scene of the crime."),
			Genres: []Genre{
				{ID: 1, Name: "Action"},
				{ID: 2, Name: "Adventure"},
				{ID: 3, Name: "Science Fiction"},
			},
			Keywords: []Keyword{
				{ID: 1, Name: "dream"},
				{ID: 2, Name: "heist"},
				{ID: 3, Name: "subconscious"},
				{ID: 4, Name: "multi-layered"},
				{ID: 5, Name: "mind-bending"},
			},
			Overview: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.",
		}

		result := movie.buildSemanticText()
		expected := "Inception. Your mind is the scene of the crime. Action, Adventure, Science Fiction. dream, heist, subconscious, multi-layered, mind-bending. A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster"

		if result != expected {
			t.Errorf("got:  %s\nwant: %s", result, expected)
		}
	})

	t.Run("nil tagline produces no empty segment", func(t *testing.T) {
		t.Parallel()
		movie := Movie{
			Title:    "Inception",
			Genres:   []Genre{{ID: 1, Name: "Action"}},
			Keywords: []Keyword{{ID: 1, Name: "dream"}},
			Overview: "Some plot.",
		}
		result := movie.buildSemanticText()
		expected := "Inception. Action. dream. Some plot"
		if result != expected {
			t.Errorf("got:  %s\nwant: %s", result, expected)
		}
	})

	t.Run("empty genres and keywords produce no empty segments", func(t *testing.T) {
		t.Parallel()
		movie := Movie{
			Title:    "Inception",
			Tagline:  new("Your mind is the scene of the crime."),
			Overview: "Some plot.",
		}
		result := movie.buildSemanticText()
		expected := "Inception. Your mind is the scene of the crime. Some plot"
		if result != expected {
			t.Errorf("got:  %s\nwant: %s", result, expected)
		}
	})

	t.Run("empty title and overview produce no leading/trailing dots", func(t *testing.T) {
		t.Parallel()
		movie := Movie{
			Title:    "",
			Genres:   []Genre{{ID: 1, Name: "Action"}},
			Overview: "",
		}
		result := movie.buildSemanticText()
		expected := "Action"
		if result != expected {
			t.Errorf("got:  %s\nwant: %s", result, expected)
		}
	})

	t.Run("all fields empty returns empty string", func(t *testing.T) {
		t.Parallel()
		movie := Movie{}
		result := movie.buildSemanticText()
		if result != "" {
			t.Errorf("got: %q, want empty string", result)
		}
	})
}
