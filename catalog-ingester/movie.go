package main

import (
	"time"

	"github.com/qdrant/go-client/qdrant"
)

const defaultIngestCount = 8

type Movie struct {
	Id                  int
	Title               *string
	VoteAverage         float64
	VoteCount           int
	Status              string
	ReleaseDate         time.Time
	Revenue             int64
	Runtime             int
	Adult               bool
	BackdropPath        *string
	Budget              int64
	Homepage            *string
	ImdbId              *string
	OriginalLanguage    string
	OriginalTitle       *string
	Overview            *string
	Popularity          float64
	PosterPath          *string
	Tagline             *string
	Genres              *string
	ProductionCompanies *string
	ProductionCountries *string
	SpokenLanguages     *string
	Keywords            *string
	IsPresentInSearch   bool
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
	if m.ImdbId != nil {
		result["imdb_id"] = *m.ImdbId
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

	return &qdrant.PointStruct{
		Id: qdrant.NewIDNum(uint64(m.Id)),
		Vectors: qdrant.NewVectorsMap(map[string]*qdrant.Vector{
			"overview-dense-vector": qdrant.NewVectorDense(vectors),
		}),
		Payload: qdrant.NewValueMap(m.toMap()),
	}
}

func getMovies(env GlobalEnv) ([]Movie, error) {
	movies := make([]Movie, 0)

	env.Db.Where(Movie{IsPresentInSearch: false}).Limit(defaultIngestCount).Find(&movies)
	env.Logger.Info("Fetched movies from DB", "count", len(movies))
	env.Logger.Debug("Movie IDs fetched", "ids", func() []int {
		ids := make([]int, len(movies))
		for i, m := range movies {
			ids[i] = m.Id
		}
		return ids
	}())
	return movies, nil
}

func updateMoviesExistInSearch(movies []Movie, env GlobalEnv) error {
	ids := make([]int, len(movies))
	for i, m := range movies {
		ids[i] = m.Id
	}

	result := env.Db.Model(&Movie{}).Where("id IN ?", ids).Update("is_present_in_search", true)
	if result.Error != nil {
		return result.Error
	}
	env.Logger.Info("Updated movies to be present in search", "count", result.RowsAffected)
	env.Logger.Debug("Movie IDs updated to present in search", "ids", ids)
	return nil
}
