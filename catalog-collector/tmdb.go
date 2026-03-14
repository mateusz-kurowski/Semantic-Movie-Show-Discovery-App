package main

import (
	tmdb "github.com/cyruzin/golang-tmdb"
)

func createTMDBClient(tmdbAPIKey string) (*tmdb.Client, error) {

	tmdbClient, err := tmdb.Init(tmdbAPIKey)
	if err != nil {
		return nil, err
	}

	// userful options
	tmdbClient.SetClientAutoRetry()
	tmdbClient.SetAlternateBaseURL()
	return tmdbClient, nil
}
