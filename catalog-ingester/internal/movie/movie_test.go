package movie

import (
	"reflect"
	"testing"

	"github.com/google/uuid"
)

func TestResolveQdrantPointID(t *testing.T) {
	t.Run("is deterministic for movie id and chunk order", func(t *testing.T) {
		movie := Movie{ID: 10, ChunkOrder: 2}
		want := uuid.NewSHA1(uuid.NameSpaceURL, []byte("movie:10:chunk:2")).String()
		if got := movie.resolveQdrantPointID(); got != want {
			t.Fatalf("expected %s, got %s", want, got)
		}
	})

	t.Run("differs for different chunks", func(t *testing.T) {
		movieA := Movie{ID: 10, ChunkOrder: 1}
		movieB := Movie{ID: 10, ChunkOrder: 2}

		idA := movieA.resolveQdrantPointID()
		idB := movieB.resolveQdrantPointID()
		if idA == idB {
			t.Fatalf("expected different IDs for different chunk order")
		}
	})

	t.Run("returns valid UUID", func(t *testing.T) {
		movie := Movie{ID: 0, ChunkOrder: 0, SemanticText: "chunk text"}
		if _, err := uuid.Parse(movie.resolveQdrantPointID()); err != nil {
			t.Fatalf("expected valid UUID, got error: %v", err)
		}
	})
}

func TestToQdrantPayloadUsesResolvedID(t *testing.T) {
	movie := Movie{ID: 0, ChunkOrder: 0, SemanticText: "chunk text"}
	point := movie.ToQdrantPayload([]float32{0.1, 0.2}, "overview-dense-vector")
	if _, err := uuid.Parse(point.GetId().GetUuid()); err != nil {
		t.Fatalf("expected UUID point id, got error: %v", err)
	}

	payload := point.GetPayload()
	pointIDValue, exists := payload["point_id"]
	if !exists {
		t.Fatalf("expected point_id in payload")
	}
	if pointIDValue.GetStringValue() != point.GetId().GetUuid() {
		t.Fatalf("expected payload point_id to equal point UUID")
	}
}

func TestGetMovieIds(t *testing.T) {
	testCases := []struct {
		name        string
		movies      []Movie
		expectedIDs []int
	}{
		{
			name: "Basic case with 3 movies",
			movies: []Movie{
				{ID: 1, Title: new("Movie 1")},
				{ID: 2, Title: new("Movie 2")},
				{ID: 3, Title: new("Movie 3")},
			},
			expectedIDs: []int{1, 2, 3},
		},
		{
			name:   "Empty movie list",
			movies: []Movie{
				// No movies
			},
			expectedIDs: []int{},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			actualIDs := GetMovieIDs(tc.movies)
			if !reflect.DeepEqual(tc.expectedIDs, actualIDs) {
				t.Errorf("Expected %v, got %v", tc.expectedIDs, actualIDs)
			}
		})
	}
}
