package main

import (
	"fmt"
	"strings"

	"github.com/tmc/langchaingo/textsplitter"
)

const (
	chunkSize         = 1200
	chunkOverlap      = 120
	chunkIDMultiplier = 100
)

// We configure the text splitter to safely fit within E5's 512-token context window
// (approx ~1200 characters), while leaving overlap for semantic continuity.
//
//nolint:gochecknoglobals // recursiveCharacter is a global variable
var recursiveCharacter = textsplitter.NewRecursiveCharacter(
	textsplitter.WithChunkSize(chunkSize),
	textsplitter.WithChunkOverlap(chunkOverlap),
)

// buildSemanticDocument combines all relevant movie metadata into a single, highly-semantic
// block of text for the embedding model to read, maximizing vector similarity for searches.
func buildSemanticDocument(movie Movie) string {
	var doc strings.Builder

	if movie.Title != nil && *movie.Title != "" {
		fmt.Fprintf(&doc, "Title: %s\n", *movie.Title)
	}
	if movie.Tagline != nil && *movie.Tagline != "" {
		fmt.Fprintf(&doc, "Tagline: %s\n", *movie.Tagline)
	}
	if movie.Genres != nil && *movie.Genres != "" {
		fmt.Fprintf(&doc, "Genres: %s\n", *movie.Genres)
	}
	if movie.Keywords != nil && *movie.Keywords != "" {
		fmt.Fprintf(&doc, "Keywords: %s\n", *movie.Keywords)
	}
	if movie.Overview != nil && *movie.Overview != "" {
		fmt.Fprintf(&doc, "Overview: %s\n", *movie.Overview)
	}

	return doc.String()
}

func divideMovieIntoChunks(movie Movie) []Movie {
	semanticDoc := buildSemanticDocument(movie)
	if semanticDoc == "" {
		return nil
	}

	chunks, err := recursiveCharacter.SplitText(semanticDoc)
	if err != nil || len(chunks) == 0 {
		return nil
	}

	movies := make([]Movie, len(chunks))
	for i, chunk := range chunks {
		movies[i] = movie
		movies[i].SemanticText = chunk

		// Create a unique ChunkID based on the original Movie ID + Chunk Index.
		// (TMDB IDs are currently up to ~1.3 million. 1.3M * 100 = 130,000,000 - extremely safe inside uint64 limits)
		//nolint:gosec // Safe integer conversion
		movies[i].ChunkID = uint64(movie.ID)*chunkIDMultiplier + uint64(i)
		movies[i].ChunkOrder = i
	}
	return movies
}
