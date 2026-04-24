package movie

func NamesFromGenres(genres []Genre) []string {
	names := make([]string, len(genres))
	for i, g := range genres {
		names[i] = g.Name
	}
	return names
}

func NamesFromCompanies(companies []Company) []string {
	names := make([]string, len(companies))
	for i, c := range companies {
		names[i] = c.Name
	}
	return names
}

func NamesFromCountries(countries []Country) []string {
	names := make([]string, len(countries))
	for i, c := range countries {
		names[i] = c.Name
	}
	return names
}

func NamesFromLanguages(languages []Language) []string {
	names := make([]string, len(languages))
	for i, l := range languages {
		names[i] = l.Name
	}
	return names
}

func NamesFromKeywords(keywords []Keyword) []string {
	names := make([]string, len(keywords))
	for i, k := range keywords {
		names[i] = k.Name
	}
	return names
}
