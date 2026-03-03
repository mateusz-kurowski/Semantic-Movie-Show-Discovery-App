package main

import (
	"fmt"

	tmdb "github.com/cyruzin/golang-tmdb"
)

func createTMDBClient(tmdbApiKey string) (*tmdb.Client, error) {

	tmdbClient, err := tmdb.Init(tmdbApiKey)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	// userful options
	tmdbClient.SetClientAutoRetry()
	tmdbClient.SetAlternateBaseURL()
	return tmdbClient, nil
}
