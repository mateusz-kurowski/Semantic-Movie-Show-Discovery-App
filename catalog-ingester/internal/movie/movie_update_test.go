package movie

import (
	"reflect"
	"testing"
)

func TestNamesFromFunctions(t *testing.T) {
	t.Run("NamesFromGenres", func(t *testing.T) {
		input := []Genre{{ID: 1, Name: "Action"}, {ID: 2, Name: "Comedy"}}
		expected := []string{"Action", "Comedy"}
		if got := NamesFromGenres(input); !reflect.DeepEqual(got, expected) {
			t.Errorf("NamesFromGenres() = %v, want %v", got, expected)
		}
		if got := NamesFromGenres(nil); len(got) != 0 {
			t.Errorf("NamesFromGenres(nil) = %v, want empty slice", got)
		}
	})

	t.Run("NamesFromCompanies", func(t *testing.T) {
		input := []Company{{ID: 1, Name: "Warner Bros"}, {ID: 2, Name: "Pixar"}}
		expected := []string{"Warner Bros", "Pixar"}
		if got := NamesFromCompanies(input); !reflect.DeepEqual(got, expected) {
			t.Errorf("NamesFromCompanies() = %v, want %v", got, expected)
		}
	})

	t.Run("NamesFromCountries", func(t *testing.T) {
		input := []Country{{ID: 1, Name: "USA"}, {ID: 2, Name: "UK"}}
		expected := []string{"USA", "UK"}
		if got := NamesFromCountries(input); !reflect.DeepEqual(got, expected) {
			t.Errorf("NamesFromCountries() = %v, want %v", got, expected)
		}
	})

	t.Run("NamesFromLanguages", func(t *testing.T) {
		input := []Language{{ID: 1, Name: "English"}, {ID: 2, Name: "Spanish"}}
		expected := []string{"English", "Spanish"}
		if got := NamesFromLanguages(input); !reflect.DeepEqual(got, expected) {
			t.Errorf("NamesFromLanguages() = %v, want %v", got, expected)
		}
	})

	t.Run("NamesFromKeywords", func(t *testing.T) {
		input := []Keyword{{ID: 1, Name: "space"}, {ID: 2, Name: "alien"}}
		expected := []string{"space", "alien"}
		if got := NamesFromKeywords(input); !reflect.DeepEqual(got, expected) {
			t.Errorf("NamesFromKeywords() = %v, want %v", got, expected)
		}
	})
}
