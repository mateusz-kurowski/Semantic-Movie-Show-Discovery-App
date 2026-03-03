package main

import (
	"os"

	"github.com/joho/godotenv"
)

type EnvVars struct {
	DatabaseURL string `validate:"required,uri,startswith=postgres"`
	TmdbApiKey  string `validate:"required"`
}

func ReadAndValidateEnvs(genv GlobalEnv) EnvVars {
	if err := godotenv.Load(); err != nil {
		genv.Logger.Error("Error while reading envs: %s", err)
	}
	env := EnvVars{
		DatabaseURL: os.Getenv("DATABASE_URL"),
		TmdbApiKey:  os.Getenv("TMDB_API_KEY"),
	}
	if err := genv.Validate.Struct(&env); err != nil {
		genv.Logger.Error("Please set DATABASE_URL and TMDB_API_KEY")
		os.Exit(1)
	}
	return env
}
