package main

import (
	"testing"
	"time"
)

func TestBuildSemanticLineFromKeyAndSlice(t *testing.T) {
	t.Parallel()

	t.Run("valid example", func(t *testing.T) {
		t.Parallel()
		expectedSemanticLine := "genres: action, comedy, romance"

		movie := Movie{Genres: []Genre{{1, "action"}, {2, "romance"}, {3, "comedy"}}}
		key := "genres"
		semanticLine := buildSemanticLineFromKeyAndSlice(key, movie.Genres)

		if expectedSemanticLine != *semanticLine {
			t.Errorf(
				`buildSemanticLineFromKeyAndSlice differs from expected value.
				Expected = %v, Actual = %v`,
				expectedSemanticLine,
				semanticLine,
			)
		}
	})
}

func TestBuildOriginLine(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name      string
		countries []string
		languages []string
		runtime   int
		want      string
	}{
		{
			name:      "all segments present",
			countries: []string{"South Korea"},
			languages: []string{"Korean"},
			runtime:   132,
			want:      "Origin: South Korea | Languages: Korean | Runtime: 132 min",
		},
		{
			name:      "multiple countries and languages are comma-joined",
			countries: []string{"United Kingdom", "United States of America"},
			languages: []string{"English", "French"},
			runtime:   90,
			want:      "Origin: United Kingdom, United States of America | Languages: English, French | Runtime: 90 min",
		},
		{
			name:      "no countries omits origin segment",
			languages: []string{"Korean"},
			runtime:   132,
			want:      "Languages: Korean | Runtime: 132 min",
		},
		{
			name:      "no languages omits languages segment",
			countries: []string{"South Korea"},
			runtime:   132,
			want:      "Origin: South Korea | Runtime: 132 min",
		},
		{
			name:      "zero runtime omits runtime segment",
			countries: []string{"South Korea"},
			languages: []string{"Korean"},
			want:      "Origin: South Korea | Languages: Korean",
		},
		{
			name:      "negative runtime omits runtime segment",
			countries: []string{"South Korea"},
			runtime:   -1,
			want:      "Origin: South Korea",
		},
		{
			name:    "only runtime",
			runtime: 100,
			want:    "Runtime: 100 min",
		},
		{
			name: "all empty returns empty string",
			want: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			if got := buildOriginLine(tt.countries, tt.languages, tt.runtime); got != tt.want {
				t.Errorf("got:  %q\nwant: %q", got, tt.want)
			}
		})
	}
}

func TestFormatReleasePeriod(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		testDate       time.Time
		expectedResult string
	}{
		{
			name:           "Nineties",
			testDate:       time.Date(1998, time.January, 1, 0, 0, 0, 0, time.UTC),
			expectedResult: "(1998, 1990s, 90s)",
		},
		{
			name:           "2000s",
			testDate:       time.Date(2001, time.January, 1, 0, 0, 0, 0, time.UTC),
			expectedResult: "(2001, 2000s, 00s)",
		},
		{
			name:           "Twenties",
			testDate:       time.Date(2020, time.January, 1, 0, 0, 0, 0, time.UTC),
			expectedResult: "(2020, 2020s, 20s)",
		},
		{
			name:           "Empty time struct",
			testDate:       time.Time{},
			expectedResult: "",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			formattedRelease := formatReleasePeriod(&tt.testDate)

			if formattedRelease != tt.expectedResult {
				t.Errorf("Release period formatted incorrectly. Expected: %v Actual: %v",
					tt.expectedResult, formattedRelease)
			}
		})
	}
}

func TestBuildTitleLine(t *testing.T) {
	t.Parallel()

	testCases := []struct {
		name              string
		title             string
		originalTitle     string
		releaseDate       time.Time
		expectedTitleLine string
	}{
		{
			name:              "Valid example",
			title:             "A",
			originalTitle:     "B",
			releaseDate:       time.Date(2000, time.January, 1, 0, 0, 0, 0, time.UTC),
			expectedTitleLine: "A (B) (2000, 2000s, 00s)",
		},
		{
			name:              "Missing Original title",
			title:             "A",
			originalTitle:     "",
			releaseDate:       time.Date(2000, time.January, 1, 0, 0, 0, 0, time.UTC),
			expectedTitleLine: "A (2000, 2000s, 00s)",
		},
		{
			name:              "Original title equal to title",
			title:             "A",
			originalTitle:     "B",
			releaseDate:       time.Date(2000, time.January, 1, 0, 0, 0, 0, time.UTC),
			expectedTitleLine: "A (B) (2000, 2000s, 00s)",
		},
		{
			name:              "Missing release date",
			title:             "A",
			originalTitle:     "B",
			releaseDate:       time.Time{},
			expectedTitleLine: "A (B)",
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			titleLine := buildTitleLine(tt.title, tt.originalTitle, &tt.releaseDate)
			if titleLine != tt.expectedTitleLine {
				t.Errorf("got:  %s\nwant: %s", titleLine, tt.expectedTitleLine)
			}
		})
	}
}

func TestBuildSemanticText(t *testing.T) {
	t.Parallel()
	t.Run("all fields present", func(t *testing.T) {
		t.Parallel()
		releaseDate := time.Date(2010, time.July, 16, 0, 0, 0, 0, time.UTC)
		movie := Movie{
			Title:         "Inception",
			OriginalTitle: "Inception",
			ReleaseDate:   &releaseDate,
			Tagline:       "Your mind is the scene of the crime.",
			Genres: []Genre{
				{ID: 3, Name: "Science Fiction"},
				{ID: 1, Name: "Action"},
				{ID: 2, Name: "Adventure"},
			},
			ProductionCountries: []Country{{ID: 1, Name: "United States of America"}},
			SpokenLanguages:     []Language{{ID: 1, Name: "English"}},
			Runtime:             148,
			ProductionCompanies: []Company{{ID: 2, Name: "Warner Bros. Pictures"}, {ID: 1, Name: "Legendary Pictures"}},
			Keywords: []Keyword{
				{ID: 1, Name: "dream"},
				{ID: 2, Name: "heist"},
				{ID: 3, Name: "subconscious"},
				{ID: 4, Name: "multi-layered"},
				{ID: 5, Name: "mind-bending"},
			},
			Overview: "A thief who steals corporate secrets.",
		}

		result := movie.buildSemanticText()
		expected := "Title: Inception (2010, 2010s, 10s)\n" +
			"Tagline: Your mind is the scene of the crime\n" +
			"Genres: Action, Adventure, Science Fiction\n" +
			"Origin: United States of America | Languages: English | Runtime: 148 min\n" +
			"Studios: Legendary Pictures, Warner Bros. Pictures\n" +
			"Keywords: dream, heist, mind-bending, multi-layered, subconscious\n" +
			"Overview: A thief who steals corporate secrets."

		if result != expected {
			t.Errorf("got:  %s\nwant: %s", result, expected)
		}
		if movie.SemanticText != expected {
			t.Errorf("SemanticText not set, got: %q", movie.SemanticText)
		}
	})

	t.Run("OriginalTitle different than title", func(t *testing.T) {
		t.Parallel()
		movie := Movie{
			Title:         "Parasite",
			OriginalTitle: "Gisaengchung",
		}
		result := movie.buildSemanticText()
		expected := "Title: Parasite (Gisaengchung)"
		if result != expected {
			t.Errorf("got:  %s\nwant: %s", result, expected)
		}
	})

	t.Run("empty tagline produces no empty line", func(t *testing.T) {
		t.Parallel()
		movie := Movie{
			Title:    "Inception",
			Genres:   []Genre{{ID: 1, Name: "Action"}},
			Keywords: []Keyword{{ID: 1, Name: "dream"}},
			Overview: "Some plot.",
		}
		result := movie.buildSemanticText()
		expected := "Title: Inception\nGenres: Action\nKeywords: dream\nOverview: Some plot."
		if result != expected {
			t.Errorf("got:  %s\nwant: %s", result, expected)
		}
	})

	t.Run("empty genres and keywords produce no empty lines", func(t *testing.T) {
		t.Parallel()
		movie := Movie{
			Title:    "Inception",
			Tagline:  "Your mind is the scene of the crime.",
			Overview: "Some plot.",
		}
		result := movie.buildSemanticText()
		expected := "Title: Inception\nTagline: Your mind is the scene of the crime\nOverview: Some plot."
		if result != expected {
			t.Errorf("got:  %s\nwant: %s", result, expected)
		}
	})

	t.Run("empty title and overview produce no leading or trailing newlines", func(t *testing.T) {
		t.Parallel()
		movie := Movie{
			Genres: []Genre{{ID: 1, Name: "Action"}},
		}
		result := movie.buildSemanticText()
		expected := "Genres: Action"
		if result != expected {
			t.Errorf("got:  %q\nwant: %q", result, expected)
		}
	})

	t.Run("overview whitespace is normalized", func(t *testing.T) {
		t.Parallel()
		movie := Movie{Overview: "  Line one.\n\nLine   two.  "}
		result := movie.buildSemanticText()
		expected := "Overview: Line one. Line two."
		if result != expected {
			t.Errorf("got:  %q\nwant: %q", result, expected)
		}
	})

	t.Run("all fields empty returns empty string", func(t *testing.T) {
		t.Parallel()
		movie := Movie{}
		result := movie.buildSemanticText()
		if result != "" {
			t.Errorf("got: %q, want empty string", result)
		}
	})

	t.Run("related entity order does not affect output", func(t *testing.T) {
		t.Parallel()
		first := Movie{
			Title:               "Inception",
			Genres:              []Genre{{ID: 1, Name: "Action"}, {ID: 2, Name: "Comedy"}},
			Keywords:            []Keyword{{ID: 1, Name: "dream"}, {ID: 2, Name: "heist"}},
			ProductionCompanies: []Company{{ID: 1, Name: "A"}, {ID: 2, Name: "B"}},
			Overview:            "Some plot.",
		}
		second := Movie{
			Title:               "Inception",
			Genres:              []Genre{{ID: 2, Name: "Comedy"}, {ID: 1, Name: "Action"}},
			Keywords:            []Keyword{{ID: 2, Name: "heist"}, {ID: 1, Name: "dream"}},
			ProductionCompanies: []Company{{ID: 2, Name: "B"}, {ID: 1, Name: "A"}},
			Overview:            "Some plot.",
		}

		if got, want := first.buildSemanticText(), second.buildSemanticText(); got != want {
			t.Errorf("got %q and %q, want identical", got, want)
		}
	})
}
