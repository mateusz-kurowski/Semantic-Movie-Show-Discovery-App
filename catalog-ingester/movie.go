package main

import (
	"context"
	"time"

	"github.com/qdrant/go-client/qdrant"
)

type Movie struct {
	Adult               bool
	BackdropPath        *string
	Budget              int64
	ChunkID             uint64 `gorm:"-"`
	ChunkOrder          int    `gorm:"-"`
	SemanticText        string `gorm:"-"`
	Genres              *string
	Homepage            *string
	ID                  int
	ImdbID              *string
	IsPresentInSearch   bool
	Keywords            *string
	OriginalLanguage    string
	OriginalTitle       *string
	Overview            *string
	Popularity          float64
	PosterPath          *string
	ProductionCompanies *string
	ProductionCountries *string
	ReleaseDate         time.Time
	Revenue             int64
	Runtime             int
	SpokenLanguages     *string
	Status              string
	Tagline             *string
	Title               *string
	VoteAverage         float64
	VoteCount           int
}

// TableName overrides the default GORM table name (which pluralizes "Movie" to "movies").
func (Movie) TableName() string {
	return "movie"
}

func (m Movie) toMap() map[string]any {
	result := map[string]any{
		"vote_average":      m.VoteAverage,
		"vote_count":        m.VoteCount,
		"status":            m.Status,
		"release_date":      m.ReleaseDate.Format(time.RFC3339),
		"revenue":           m.Revenue,
		"runtime":           m.Runtime,
		"adult":             m.Adult,
		"budget":            m.Budget,
		"original_language": m.OriginalLanguage,
		"popularity":        m.Popularity,
		"original_id":       m.ID,
		"chunk_order":       m.ChunkOrder,
	}

	if m.ChunkID != 0 {
		result["chunk_id"] = m.ChunkID
	}
	if m.SemanticText != "" {
		result["semantic_text"] = m.SemanticText
	}

	if m.Title != nil {
		result["title"] = *m.Title
	}
	if m.BackdropPath != nil {
		result["backdrop_path"] = *m.BackdropPath
	}
	if m.Homepage != nil {
		result["homepage"] = *m.Homepage
	}
	if m.ImdbID != nil {
		result["imdb_id"] = *m.ImdbID
	}
	if m.OriginalTitle != nil {
		result["original_title"] = *m.OriginalTitle
	}
	if m.Overview != nil {
		result["overview"] = *m.Overview
	}
	if m.PosterPath != nil {
		result["poster_path"] = *m.PosterPath
	}
	if m.Tagline != nil {
		result["tagline"] = *m.Tagline
	}
	if m.Genres != nil {
		result["genres"] = *m.Genres
	}
	if m.ProductionCompanies != nil {
		result["production_companies"] = *m.ProductionCompanies
	}
	if m.ProductionCountries != nil {
		result["production_countries"] = *m.ProductionCountries
	}
	if m.SpokenLanguages != nil {
		result["spoken_languages"] = *m.SpokenLanguages
	}
	if m.Keywords != nil {
		result["keywords"] = *m.Keywords
	}

	return result
}

func (m Movie) ToQdrantPayload(vectors []float32) *qdrant.PointStruct {
	// Fall back to original ID if no ChunkID is provided (for non-chunked workflows)
	idToUse := m.ChunkID
	if idToUse == 0 {
		//nolint:gosec // Movie IDs are positive
		idToUse = uint64(m.ID)
	}

	return &qdrant.PointStruct{
		Id: qdrant.NewIDNum(idToUse),
		Vectors: qdrant.NewVectorsMap(map[string]*qdrant.Vector{
			"overview-dense-vector": qdrant.NewVectorDense(vectors),
		}),
		Payload: qdrant.NewValueMap(m.toMap()),
	}
}

func (m Movie) ToQdrantCloudPayload(text, model, denseVectorName string) *qdrant.PointStruct {
	// Fall back to original ID if no ChunkID is provided (for non-chunked workflows)
	idToUse := m.ChunkID
	if idToUse == 0 {
		//nolint:gosec // Movie IDs are positive
		idToUse = uint64(m.ID)
	}

	return &qdrant.PointStruct{
		Id: qdrant.NewIDNum(idToUse),
		Vectors: qdrant.NewVectorsMap(map[string]*qdrant.Vector{
			denseVectorName: qdrant.NewVectorDocument(&qdrant.Document{
				Text:  text,
				Model: model,
			}),
		}),
		Payload: qdrant.NewValueMap(m.toMap()),
	}
}

func getMovieIDs(movies []Movie) []int {
	ids := make([]int, len(movies))
	for i, m := range movies {
		ids[i] = m.ID
	}
	return ids
}

func getMovies(ctx context.Context, env GlobalEnv, vars EnvVars) ([]Movie, error) {
	movies := make([]Movie, 0)

	tx := env.DB.Where(Movie{IsPresentInSearch: false}).Limit(vars.IngestBatchSize).Find(&movies)
	if tx.Error != nil {
		return nil, tx.Error
	}

	env.Logger.InfoContext(ctx, "Fetched movies from DB", "count", len(movies))
	env.Logger.DebugContext(ctx, "Movie IDs fetched", "ids", getMovieIDs(movies))
	return movies, nil
}

func updateMoviesExistInSearch(ctx context.Context, movies []Movie, env GlobalEnv) error {
	ids := make([]int, len(movies))
	for i, m := range movies {
		ids[i] = m.ID
	}

	result := env.DB.Model(&Movie{}).Where("id IN ?", ids).Update("is_present_in_search", true)
	if result.Error != nil {
		return result.Error
	}
	env.Logger.InfoContext(ctx, "Updated movies to be present in search", "count", result.RowsAffected)
	env.Logger.DebugContext(ctx, "Movie IDs updated to present in search", "ids", ids)
	return nil
}
