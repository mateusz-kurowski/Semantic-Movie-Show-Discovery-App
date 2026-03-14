package main

import "errors"

var (
	errCreatingOTLPExporterError = errors.New("creating OTLP log exporter failed")
	errFailedToInitTracer        = errors.New("tracer initialization failed")
)
