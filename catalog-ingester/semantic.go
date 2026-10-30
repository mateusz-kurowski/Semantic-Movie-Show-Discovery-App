package main

import (
	"fmt"
	"slices"
	"strconv"
	"strings"
	"time"
)

const yearsPerCentury = 100
const yearsPerDecade = 10

func buildSemanticLineFromKeyAndSlice[T NamedEntity](key string, values []T) *string {
	if len(values) == 0 {
		return nil
	}

	names := namesFrom(values)
	slices.Sort(names)
	joinedValues := strings.Join(names, ", ")
	result := fmt.Sprintf("%s: %s", key, joinedValues)
	return &result
}

func buildTitleLine(title, originalTitle string, releaseDate *time.Time) string {
	var parts []string

	if title != "" {
		parts = append(parts, title)
	}

	if originalTitle != "" && title != originalTitle {
		parts = append(parts, fmt.Sprintf("(%s)", originalTitle))
	}

	if releaseDatePart := formatReleasePeriod(releaseDate); releaseDatePart != "" {
		parts = append(parts, releaseDatePart)
	}

	return strings.Join(parts, " ")
}

func buildOriginLine(productionCountries, spokenLanguages []string, runtime int) string {
	parts := make([]string, 0)

	if len(productionCountries) > 0 {
		parts = append(parts, fmt.Sprintf("Origin: %s", strings.Join(productionCountries, ", ")))
	}

	if len(spokenLanguages) > 0 {
		parts = append(parts, fmt.Sprintf("Languages: %s", strings.Join(spokenLanguages, ", ")))
	}

	if runtime > 0 {
		parts = append(parts, fmt.Sprintf("Runtime: %v min", runtime))
	}

	return strings.Join(parts, " | ")
}

func (m *Movie) buildSemanticText() string {
	// Build semantic text used later then for vectorization. See details in design/semantic_text.md

	lines := make([]string, 0)

	if titleLine := buildTitleLine(m.Title, m.OriginalTitle, m.ReleaseDate); titleLine != "" {
		lines = append(lines, "Title: "+titleLine)
	}

	if tagLine := strings.TrimRight(strings.TrimSpace(m.Tagline), ". ,"); tagLine != "" {
		lines = append(lines, "Tagline: "+tagLine)
	}

	genresLine := buildSemanticLineFromKeyAndSlice("Genres", m.Genres)

	if genresLine != nil {
		lines = append(lines, *genresLine)
	}

	originLine := buildOriginLine(namesFrom(m.ProductionCountries), namesFrom(m.SpokenLanguages), m.Runtime)

	if originLine != "" {
		lines = append(lines, originLine)
	}

	studiosLine := buildSemanticLineFromKeyAndSlice("Studios", m.ProductionCompanies)
	if studiosLine != nil {
		lines = append(lines, *studiosLine)
	}

	keywordsLine := buildSemanticLineFromKeyAndSlice("Keywords", m.Keywords)
	if keywordsLine != nil {
		lines = append(lines, *keywordsLine)
	}

	if overview := strings.Join(strings.Fields(m.Overview), " "); overview != "" {
		lines = append(lines, "Overview: "+overview)
	}

	semanticText := strings.Join(lines, "\n")

	m.SemanticText = semanticText
	return semanticText
}

func formatReleasePeriod(releaseDate *time.Time) string {
	if releaseDate == nil || releaseDate.IsZero() {
		return ""
	}
	year := releaseDate.Year()

	lastDigit := year % yearsPerDecade

	decade := year - lastDigit
	shortDecade := (year % yearsPerCentury) - lastDigit

	shortDecadeStr := strconv.Itoa(shortDecade)
	if len(shortDecadeStr) == 1 {
		shortDecadeStr = fmt.Sprintf("%s%s", shortDecadeStr, shortDecadeStr)
	}

	return fmt.Sprintf("(%v, %vs, %ss)",
		year, decade, shortDecadeStr)
}
