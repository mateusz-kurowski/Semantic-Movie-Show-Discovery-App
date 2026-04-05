package main

import (
	"fmt"
	"hash/fnv"
	"strconv"
	"strings"

	"github.com/tmc/langchaingo/textsplitter"
)

const (
	chunkSize    = 1200
	chunkOverlap = 120
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

		// Create a deterministic chunk ID from movie ID + chunk order.
		// This avoids collisions that can happen with multiplier-based IDs.
		h := fnv.New64a()
		_, _ = h.Write([]byte(strconv.Itoa(movie.ID)))
		_, _ = h.Write([]byte(":"))
		_, _ = h.Write([]byte(strconv.Itoa(i)))
		movies[i].ChunkID = h.Sum64()
		movies[i].ChunkOrder = i
	}
	return movies
}
