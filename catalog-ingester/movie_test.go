package main

import (
	"reflect"
	"testing"
)

func TestGetMovieIds(t *testing.T) {
	testCases := []struct {
		name        string
		movies      []Movie
		expectedIDs []int
	}{
		{
			name: "Basic case with 3 movies",
			movies: []Movie{
				{ID: 1, Title: ptr("Movie 1")},
				{ID: 2, Title: ptr("Movie 2")},
				{ID: 3, Title: ptr("Movie 3")},
			},
			expectedIDs: []int{1, 2, 3},
		},
		{
			name:   "Empty movie list",
			movies: []Movie{
				// No movies
			},
			expectedIDs: []int{},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			actualIDs := getMovieIDs(tc.movies)
			if !reflect.DeepEqual(tc.expectedIDs, actualIDs) {
				t.Errorf("Expected %v, got %v", tc.expectedIDs, actualIDs)
			}
		})
	}
}
