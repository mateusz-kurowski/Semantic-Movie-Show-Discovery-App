package main

import "testing"

func TestFloat64ArrayToFloat32(t *testing.T) {
	t.Parallel()
	t.Run("Correctly converts float64 array to float32 array", func(t *testing.T) {
		t.Parallel()
		sourceArray := []float64{1.0, 2.0, 3.0, 4.0, 5.0}
		expectedArray := []float32{1.0, 2.0, 3.0, 4.0, 5.0}

		result := float64ArrayToFloat32(sourceArray)

		if len(result) != len(expectedArray) {
			t.Fatalf("Expected length %d, got %d", len(expectedArray), len(result))
		}

		for i, v := range result {
			if v != expectedArray[i] {
				t.Fatalf("Expected value %f at index %d, got %f", expectedArray[i], i, v)
			}
		}
	})
}

func TestStringSliceToAnySlicePlusTrimElements(t *testing.T) {
	t.Parallel()
	source := []string{"  hello  ", "world", "  go  "}
	expectedResult := []any{"hello", "world", "go"}

	result := StringSliceToAnySlicePlusTrimElements(source)

	if len(result) != len(expectedResult) {
		t.Fatalf("Expected length %d, got %d", len(expectedResult), len(result))
	}

	for i, v := range result {
		if v != expectedResult[i] {
			t.Fatalf("Expected value %v at index %d, got %v", expectedResult[i], i, v)
		}
	}
}
