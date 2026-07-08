package main

import "strings"

func float64ArrayToFloat32(array []float64) []float32 {
	result := make([]float32, len(array))
	for i, v := range array {
		result[i] = float32(v)
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
