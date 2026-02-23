package main

import "os"

type EnvVars struct {
	DatabaseURL string `validate:"required,uri,startswith=postgres"`
}

func ReadAndValidateEnvs(genv GlobalEnv) EnvVars {
	env := EnvVars{
		DatabaseURL: os.Getenv("DATABASE_URL"),
	}
	if err := genv.Validate.Struct(&env); err != nil {
		genv.Logger.Error("Please set DATABASE_URL")
		os.Exit(1)
	}
	return env
}
