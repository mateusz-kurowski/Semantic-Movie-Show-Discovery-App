package main

import (
	"catalog-ingester/internal/movie"
	"fmt"
	"strings"

	"github.com/tmc/langchaingo/textsplitter"
)

// ChunkConfig holds chunking configuration.
type ChunkConfig struct {
	Size    int
	Overlap int
}

// DefaultChunkConfig returns the default chunking configuration.
func DefaultChunkConfig() ChunkConfig {
	return ChunkConfig{
		Size:    DefaultChunkSize,
		Overlap: DefaultChunkOverlap,
	}
}

const chunkIDMultiplier = 1_000_000

// buildBaseMetadataDocument combines all relevant movie metadata into a single string,
// excluding the long text fields like Overview. This base context is prepended to
// every chunk to ensure the semantic meaning of the chunk remains grounded.
func buildBaseMetadataDocument(m movie.Movie) string {
	var doc strings.Builder

	if m.Title != nil && *m.Title != "" {
		fmt.Fprintf(&doc, "Title: %s\n", *m.Title)
	}
	if m.OriginalTitle != nil && *m.OriginalTitle != "" && (m.Title == nil || *m.OriginalTitle != *m.Title) {
		fmt.Fprintf(&doc, "Original Title: %s\n", *m.OriginalTitle)
	}
	if !m.ReleaseDate.IsZero() {
		fmt.Fprintf(&doc, "Release Year: %d\n", m.ReleaseDate.Year())
	}
	if m.Tagline != nil && *m.Tagline != "" {
		fmt.Fprintf(&doc, "Tagline: %s\n", *m.Tagline)
	}
	if len(m.Genres) > 0 {
		fmt.Fprintf(&doc, "Genres: %s\n", strings.Join(movie.NamesFromGenres(m.Genres), ", "))
	}
	if len(m.Keywords) > 0 {
		fmt.Fprintf(&doc, "Keywords: %s\n", strings.Join(movie.NamesFromKeywords(m.Keywords), ", "))
	}
	if len(m.ProductionCompanies) > 0 {
		fmt.Fprintf(
			&doc,
			"Production Companies: %s\n",
			strings.Join(movie.NamesFromCompanies(m.ProductionCompanies), ", "),
		)
	}
	if len(m.ProductionCountries) > 0 {
		fmt.Fprintf(
			&doc,
			"Production Countries: %s\n",
			strings.Join(movie.NamesFromCountries(m.ProductionCountries), ", "),
		)
	}
	if len(m.SpokenLanguages) > 0 {
		fmt.Fprintf(&doc, "Spoken Languages: %s\n", strings.Join(movie.NamesFromLanguages(m.SpokenLanguages), ", "))
	}
	if m.VoteCount > 0 {
		fmt.Fprintf(&doc, "User Rating: %.1f/10\n", m.VoteAverage)
	}
	if m.Runtime > 0 {
		fmt.Fprintf(&doc, "Runtime: %d minutes\n", m.Runtime)
	}
	if m.Adult {
		doc.WriteString("Content: Adult (18+)\n")
	}

	return strings.TrimSpace(doc.String())
}

func divideMovieIntoChunks(m movie.Movie, cfg ChunkConfig) []movie.Movie {
	baseMetadata := buildBaseMetadataDocument(m)

	// If there's no overview, just return the base metadata as a single chunk
	if m.Overview == nil || *m.Overview == "" {
		if baseMetadata == "" {
			return nil
		}
		m.SemanticText = baseMetadata
		m.ChunkID = createChunkID(m.ID, 0)
		m.ChunkOrder = 0
		return []movie.Movie{m}
	}

	// Calculate how much space we have left for the overview chunk
	// "Overview: \n" is about 10 characters.
	overviewPrefix := "\nOverview: "
	availableSpace := cfg.Size - len(baseMetadata) - len(overviewPrefix)

	// Ensure we always have at least a minimal chunk size for the text splitter
	// so it doesn't crash if metadata is extremely long.
	minOverviewChunkSize := 100
	if availableSpace < minOverviewChunkSize {
		availableSpace = minOverviewChunkSize
	}

	// Create a text splitter tailored to the remaining space
	splitter := textsplitter.NewRecursiveCharacter(
		textsplitter.WithChunkSize(availableSpace),
		textsplitter.WithChunkOverlap(cfg.Overlap),
	)

	chunks, err := splitter.SplitText(*m.Overview)
	if err != nil || len(chunks) == 0 {
		// Fallback if splitter fails for some reason
		m.SemanticText = baseMetadata + overviewPrefix + *m.Overview
		m.ChunkID = createChunkID(m.ID, 0)
		m.ChunkOrder = 0
		return []movie.Movie{m}
	}

	movies := make([]movie.Movie, len(chunks))
	for i, chunk := range chunks {
		movies[i] = m
		movies[i].SemanticText = baseMetadata + overviewPrefix + chunk
		movies[i].ChunkID = createChunkID(m.ID, i)
		movies[i].ChunkOrder = i
	}
	return movies
}

func createChunkID(movieID, chunkOrder int) uint64 {
	if movieID < 0 {
		movieID = -movieID
	}
	if chunkOrder < 0 {
		chunkOrder = 0
	}

	//nolint:gosec // movieID/chunkOrder are normalized to non-negative values above.
	return uint64(movieID)*chunkIDMultiplier + uint64(chunkOrder)
}
