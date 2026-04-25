package main

import (
	"catalog-ingester/internal/movie"
	"fmt"
	"testing"
)

func TestCreateChunkIDDeterministic(t *testing.T) {
	id1 := createChunkID(42, 0)
	id2 := createChunkID(42, 0)

	if id1 != id2 {
		t.Fatalf("expected deterministic ID, got %d and %d", id1, id2)
	}
}

func TestCreateChunkIDChangesWithChunkOrder(t *testing.T) {
	idOrder0 := createChunkID(42, 0)
	idOrder1 := createChunkID(42, 1)
	if idOrder0 == idOrder1 {
		t.Fatalf("expected different IDs for different chunk order")
	}
}

func TestCreateChunkIDChangesWithMovieID(t *testing.T) {
	idMovie1 := createChunkID(1, 3)
	idMovie2 := createChunkID(2, 3)

	if idMovie1 == idMovie2 {
		t.Fatalf("expected different IDs for different movie IDs")
	}
}

func TestCreateChunkIDFormula(t *testing.T) {
	got := createChunkID(123, 45)
	want := uint64(123)*chunkIDMultiplier + 45
	if got != want {
		t.Fatalf("expected %d, got %d", want, got)
	}
}

func TestCreateChunkIDLargeUniquenessSet(t *testing.T) {
	seen := map[uint64]string{}

	for movieIdx := range 200 {
		for chunkOrder := range 20 {
			id := createChunkID(movieIdx+1, chunkOrder)
			if id == 0 {
				t.Fatalf("expected non-zero ID")
			}
			key := fmt.Sprintf("movie=%d,chunk=%d", movieIdx+1, chunkOrder)
			if previous, exists := seen[id]; exists {
				t.Fatalf("unexpected collision for id=%d, current=%s, previous=%s", id, key, previous)
			}
			seen[id] = key
		}
	}
}

func TestBuildBaseMetadataDocument(t *testing.T) {
	tests := []struct {
		name  string
		movie movie.Movie
		want  string
	}{
		{
			name: "All fields present",
			movie: movie.Movie{
				Title:               new("The Matrix"),
				OriginalTitle:       new("The Matrix"), // Should be ignored since it equals title
				Tagline:             new("Free your mind."),
				VoteAverage:         8.7,
				VoteCount:           1000,
				Runtime:             136,
				Adult:               true,
				Genres:              []movie.Genre{{Name: "Action"}, {Name: "Sci-Fi"}},
				Keywords:            []movie.Keyword{{Name: "simulation"}, {Name: "hacker"}},
				ProductionCompanies: []movie.Company{{Name: "Warner Bros."}},
				ProductionCountries: []movie.Country{{Name: "USA"}},
				SpokenLanguages:     []movie.Language{{Name: "English"}},
			},
			want: "Title: The Matrix\nTagline: Free your mind.\nGenres: Action, Sci-Fi\nKeywords: simulation, hacker\nProduction Companies: Warner Bros.\nProduction Countries: USA\nSpoken Languages: English\nUser Rating: 8.7/10\nRuntime: 136 minutes\nContent: Adult (18+)",
		},
		{
			name: "Original title differs",
			movie: movie.Movie{
				Title:         new("Spirited Away"),
				OriginalTitle: new("Sen to Chihiro no Kamikakushi"),
			},
			want: "Title: Spirited Away\nOriginal Title: Sen to Chihiro no Kamikakushi",
		},
		{
			name:  "Empty movie",
			movie: movie.Movie{},
			want:  "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := buildBaseMetadataDocument(tt.movie)
			if got != tt.want {
				t.Errorf("buildBaseMetadataDocument() got = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestDivideMovieIntoChunks(t *testing.T) {
	tests := []struct {
		name      string
		movie     movie.Movie
		wantCount int
	}{
		{
			name:      "No overview, no metadata",
			movie:     movie.Movie{},
			wantCount: 0,
		},
		{
			name: "No overview, has metadata",
			movie: movie.Movie{
				Title: new("Short Movie"),
			},
			wantCount: 1,
		},
		{
			name: "Short overview",
			movie: movie.Movie{
				Title:    new("Test Movie"),
				Overview: new("This is a short overview."),
			},
			wantCount: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cfg := ChunkConfig{Size: 1200, Overlap: 120}
			got := divideMovieIntoChunks(tt.movie, cfg)
			if len(got) != tt.wantCount {
				t.Errorf("divideMovieIntoChunks() count got = %v, want %v", len(got), tt.wantCount)
			}
		})
	}
}
