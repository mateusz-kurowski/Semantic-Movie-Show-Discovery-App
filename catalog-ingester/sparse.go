package main

import (
	"hash/fnv"
	"strings"
	"unicode"
)

const hashBufLength = 64

// textToSparseVector tokenizes text and returns a sparse vector as parallel
// (indices, values) slices suitable for Qdrant's SparseVector.
//
// Tokens are lowercased, stripped of surrounding punctuation, and mapped to
// indices via FNV-1a hash of the token bytes.
// Values are raw term frequencies. Qdrant's modifier:"idf" applies IDF
// weighting at query time, so raw TF is the correct input at index time.
func textToSparseVector(text string) ([]uint32, []float32) {
	freq := make(map[uint32]float32)

	// Zamiast dzielić tylko po spacjach, dzielimy po wszystkim, co NIE jest literą lub cyfrą.
	// To automatycznie załatwia sprawę interpunkcji w środku (np. "sparse-vectors") oraz na brzegach.
	tokens := strings.FieldsFunc(strings.ToLower(text), func(r rune) bool {
		return !unicode.IsLetter(r) && !unicode.IsNumber(r)
	})

	hasher := fnv.New32a()
	buf := make([]byte, 0, hashBufLength)

	for _, token := range tokens {
		// token jest już lowercase i pozbawiony interpunkcji dzięki FieldsFunc,
		// ale na wypadek pustych tokenów (np. podwójne znaki interpunkcyjne obok siebie):
		if token == "" {
			continue
		}

		hasher.Reset()
		buf = append(buf[:0], token...)
		_, err := hasher.Write(buf)
		if err != nil {
			continue
		}
		idx := hasher.Sum32()
		freq[idx]++
	}

	indices := make([]uint32, 0, len(freq))
	values := make([]float32, 0, len(freq))
	for idx, count := range freq {
		indices = append(indices, idx)
		values = append(values, count)
	}
	return indices, values
}
