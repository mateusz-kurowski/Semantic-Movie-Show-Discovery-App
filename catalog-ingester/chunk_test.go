package main

import (
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
