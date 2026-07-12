package main

import (
	"context"
	"log/slog"
	"strconv"
	"strings"
	"time"

	"github.com/qdrant/go-client/qdrant"
	"gorm.io/gorm"
)

type Movie struct {
	Adult               bool
	BackdropPath        *string
	Budget              int64
	ChunkID             uint64  `gorm:"-"`
	ChunkOrder          int     `gorm:"-"`
	SemanticText        string  `gorm:"-"`
	Genres              []Genre `gorm:"many2many:moviegenrelink;joinForeignKey:movie_id;joinReferences:genre_id"`
	Homepage            *string
	ID                  uint64
	ImdbID              *string
	IsPresentInSearch   bool
	Keywords            []Keyword `gorm:"many2many:moviekeywordlink;joinForeignKey:movie_id;joinReferences:keyword_id"`
	OriginalLanguage    string
	OriginalTitle       *string
	Overview            string
	Popularity          float64
	PosterPath          *string
	ProductionCompanies []Company `gorm:"many2many:moviecompanylink;joinForeignKey:movie_id;joinReferences:company_id"`
	ProductionCountries []Country `gorm:"many2many:moviecountrylink;joinForeignKey:movie_id;joinReferences:country_id"`
	ReleaseDate         time.Time
	Revenue             int64
	Runtime             int
	SpokenLanguages     []Language `gorm:"many2many:movielanguagelink;joinForeignKey:movie_id;joinReferences:language_id"`
	Status              string
	Tagline             *string
	Title               string
	VoteAverage         float64
	VoteCount           int
}

// TableName overrides the default GORM table name (which pluralizes "Movie" to "movies").
func (Movie) TableName() string {
	return "movie"
}

func (m Movie) toMap() map[string]any {
	result := map[string]any{
		"point_id":          strconv.FormatUint(m.ID, 10),
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
		"title":             m.Title,
		"overview":          m.Overview,
	}

	if m.ChunkID != 0 {
		result["chunk_id"] = m.ChunkID
	}
	if m.SemanticText != "" {
		result["semantic_text"] = m.SemanticText
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
	if m.PosterPath != nil {
		result["poster_path"] = *m.PosterPath
	}
	if m.Tagline != nil {
		result["tagline"] = *m.Tagline
	}
	if len(m.Genres) > 0 {
		genres := namesFrom(m.Genres)
		result["genres"] = StringSliceToAnySlicePlusTrimElements(genres)
	}
	if len(m.ProductionCompanies) > 0 {
		companies := namesFrom(m.ProductionCompanies)
		result["production_companies"] = StringSliceToAnySlicePlusTrimElements(companies)
	}
	if len(m.ProductionCountries) > 0 {
		countries := namesFrom(m.ProductionCountries)
		result["production_countries"] = StringSliceToAnySlicePlusTrimElements(countries)
	}
	if len(m.SpokenLanguages) > 0 {
		languages := namesFrom(m.SpokenLanguages)
		result["spoken_languages"] = StringSliceToAnySlicePlusTrimElements(languages)
	}
	if len(m.Keywords) > 0 {
		keywords := namesFrom(m.Keywords)
		result["keywords"] = StringSliceToAnySlicePlusTrimElements(keywords)
	}

	return result
}

func (m Movie) ToQdrantPayload(
	vectors []float32,
	denseVectorName string,
	sparseVectorName string,
) *qdrant.PointStruct {
	return &qdrant.PointStruct{
		Id: qdrant.NewIDNum(m.ID),
		Vectors: qdrant.NewVectorsMap(map[string]*qdrant.Vector{
			denseVectorName:  qdrant.NewVectorDense(vectors),
			sparseVectorName: qdrant.NewVectorDocument(&qdrant.Document{Text: m.SemanticText, Model: "Qdrant/bm25"}),
		}),
		Payload: qdrant.NewValueMap(m.toMap()),
	}
}

func (m Movie) buildSemanticText() string {
	tagline := ""
	if m.Tagline != nil {
		tagline = *m.Tagline
	}

	genres := strings.Join(namesFrom(m.Genres), ", ")
	keywords := strings.Join(namesFrom(m.Keywords), ", ")

	parts := []string{m.Title, tagline, genres, keywords, m.Overview}
	nonEmpty := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimRight(p, ". ,")
		if p != "" {
			nonEmpty = append(nonEmpty, p)
		}
	}

	return strings.Join(nonEmpty, ". ")
}

func GetMovieIDs(movies []Movie) []uint64 {
	ids := make([]uint64, len(movies))
	for i, m := range movies {
		ids[i] = m.ID
	}
	return ids
}

func getMovies(ctx context.Context, db *gorm.DB, logger *slog.Logger, batchSize int) ([]Movie, error) {
	movies := make([]Movie, 0)

	tx := db.Preload("Genres").
		Preload("ProductionCompanies").
		Preload("ProductionCountries").
		Preload("SpokenLanguages").
		Preload("Keywords").
		Where("is_present_in_search = ?", false).
		Limit(batchSize).
		Find(&movies)
	if tx.Error != nil {
		return nil, tx.Error
	}

	logger.InfoContext(ctx, "Fetched movies from DB", "count", len(movies))
	logger.DebugContext(ctx, "Movie IDs fetched", "ids", GetMovieIDs(movies))
	return movies, nil
}

func updateMoviesExistInSearch(ctx context.Context, movies []Movie, db *gorm.DB, logger *slog.Logger) error {
	ids := make([]uint64, len(movies))
	for i, m := range movies {
		ids[i] = m.ID
	}

	result := db.Model(&Movie{}).Where("id IN ?", ids).Update("is_present_in_search", true)
	if result.Error != nil {
		return result.Error
	}
	logger.InfoContext(ctx, "Updated movies to be present in search", "count", result.RowsAffected)
	logger.DebugContext(ctx, "Movie IDs updated to present in search", "ids", ids)
	return nil
}

func namesFrom[T NamedEntity](items []T) []string {
	names := make([]string, len(items))
	for i, item := range items {
		names[i] = item.EntityName()
	}
	return names
}
