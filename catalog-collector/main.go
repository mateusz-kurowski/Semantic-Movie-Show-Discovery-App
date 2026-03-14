package main

import (
	"context"
	"os"

	"github.com/go-playground/validator/v10"
	"go.uber.org/zap"
)

type GlobalEnv struct {
	Validate *validator.Validate
	Logger   *zap.SugaredLogger
}

func exitWithErr(err error, code int) {
	if _, writeErr := os.Stderr.WriteString(err.Error() + "\n"); writeErr != nil {
		os.Exit(code)
	}
	os.Exit(code)
}

func main() {
	validate := validator.New(validator.WithRequiredStructEnabled())

	vars, err := ReadAndValidateEnvs(validate)
	if err != nil {
		exitWithErr(err, 1)
	}

	ctx := context.Background()

	logger, cleanupLogger, err := initLogger(ctx, vars)
	if err != nil {
		exitWithErr(err, 1)
	}
	sugarLogger := logger.Sugar()
	defer func() {
		if cleanupErr := cleanupLogger(ctx); cleanupErr != nil {
			logger.Error("failed to cleanup logger", zap.Error(cleanupErr))
		}
	}()
	env := GlobalEnv{
		Validate: validate,
		Logger:   sugarLogger,
	}
	shutdown, err := initTracer(ctx, env)
	if err != nil {
		logger.Error(errFailedToInitTracer.Error(), zap.Error(err))
	} else {
		defer func() {
			if shutdownErr := shutdown(ctx); shutdownErr != nil {
				sugarLogger.Errorw("failed to shutdown tracer", "error", shutdownErr)
			}
		}()
	}

	_ = connectDB(ctx, env, vars.DatabaseURL)
	_, _ = createTMDBClient(vars.TmdbAPIKey)

	sugarLogger.Info("Running job...")
}
