package movie

import (
	"context"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/qdrant/go-client/qdrant"
	"gorm.io/gorm"
)

type Movie struct {
	Adult               bool
	BackdropPath        *string
	Budget              int64
	ChunkID             uint64 `gorm:"-"`
	ChunkOrder          int    `gorm:"-"`
	SemanticText        string `gorm:"-"`
	Genres              []Genre `gorm:"many2many:moviegenrelink;joinForeignKey:movie_id;joinReferences:genre_id"`
	Homepage            *string
	ID                  int
	ImdbID              *string
	IsPresentInSearch   bool
	Keywords            []Keyword `gorm:"many2many:moviekeywordlink;joinForeignKey:movie_id;joinReferences:keyword_id"`
	OriginalLanguage    string
	OriginalTitle       *string
	Overview            *string
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
		"point_id":          m.resolveQdrantPointID(),
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
	if len(m.Genres) > 0 {
		genres := NamesFromGenres(m.Genres)
		result["genres"] = StringSliceToAnySlicePlusTrimElements(genres)
	}
	if len(m.ProductionCompanies) > 0 {
		companies := NamesFromCompanies(m.ProductionCompanies)
		result["production_companies"] = StringSliceToAnySlicePlusTrimElements(companies)
	}
	if len(m.ProductionCountries) > 0 {
		countries := NamesFromCountries(m.ProductionCountries)
		result["production_countries"] = StringSliceToAnySlicePlusTrimElements(countries)
	}
	if len(m.SpokenLanguages) > 0 {
		languages := NamesFromLanguages(m.SpokenLanguages)
		result["spoken_languages"] = StringSliceToAnySlicePlusTrimElements(languages)
	}
	if len(m.Keywords) > 0 {
		keywords := NamesFromKeywords(m.Keywords)
		result["keywords"] = StringSliceToAnySlicePlusTrimElements(keywords)
	}

	return result
}

func StringSliceToAnySlicePlusTrimElements(strs []string) []any {
	res := make([]any, len(strs))
	for i, s := range strs {
		res[i] = strings.TrimSpace(s)
	}
	return res
}

func (m Movie) ToQdrantPayload(vectors []float32, denseVectorName string) *qdrant.PointStruct {
	idToUse := m.resolveQdrantPointID()

	return &qdrant.PointStruct{
		Id: qdrant.NewID(idToUse),
		Vectors: qdrant.NewVectorsMap(map[string]*qdrant.Vector{
			denseVectorName: qdrant.NewVectorDense(vectors),
		}),
		Payload: qdrant.NewValueMap(m.toMap()),
	}
}

func (m Movie) ToQdrantCloudPayload(text, model, denseVectorName string) *qdrant.PointStruct {
	idToUse := m.resolveQdrantPointID()

	return &qdrant.PointStruct{
		Id: qdrant.NewID(idToUse),
		Vectors: qdrant.NewVectorsMap(map[string]*qdrant.Vector{
			denseVectorName: qdrant.NewVectorDocument(&qdrant.Document{
				Text:  text,
				Model: model,
			}),
		}),
		Payload: qdrant.NewValueMap(m.toMap()),
	}
}

func (m Movie) resolveQdrantPointID() string {
	identity := fmt.Sprintf("movie:%d:chunk:%d", m.ID, m.ChunkOrder)
	return uuid.NewSHA1(uuid.NameSpaceURL, []byte(identity)).String()
}

func GetMovieIDs(movies []Movie) []int {
	ids := make([]int, len(movies))
	for i, m := range movies {
		ids[i] = m.ID
	}
	return ids
}

func GetMovies(ctx context.Context, db *gorm.DB, logger *slog.Logger, batchSize int) ([]Movie, error) {
	movies := make([]Movie, 0)

	tx := db.Preload("Genres").Preload("ProductionCompanies").Preload("ProductionCountries").Preload("SpokenLanguages").Preload("Keywords").Where("is_present_in_search = ?", false).Limit(batchSize).Find(&movies)
	if tx.Error != nil {
		return nil, tx.Error
	}

	logger.InfoContext(ctx, "Fetched movies from DB", "count", len(movies))
	logger.DebugContext(ctx, "Movie IDs fetched", "ids", GetMovieIDs(movies))
	return movies, nil
}

func UpdateMoviesExistInSearch(ctx context.Context, movies []Movie, db *gorm.DB, logger *slog.Logger) error {
	ids := make([]int, len(movies))
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
