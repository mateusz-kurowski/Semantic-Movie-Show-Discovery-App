package main

import "testing"

func TestPtr(t *testing.T) {
	val := "hello"
	p := ptr(val)

	if p == nil {
		t.Fatal("expected pointer, got nil")
	}
	if *p != val {
		t.Errorf("expected %q, got %q", val, *p)
	}
}
