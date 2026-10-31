package main

import (
	"time"

	"github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
	gormlogrus "gorm.io/plugin/opentelemetry/logging/logrus"
)

const (
	defaultMaxOpenCons  = 100
	defaultMaxIdleConns = 10
	slowQueryThreshold  = 200 * time.Millisecond
)

func initDB(logger *logrus.Logger, dsn string) (*gorm.DB, error) {
	// WithLogger keeps GORM on the app's logrus instance; the default writer
	// would reconfigure logrus's global logger instead.
	gormLogger := gormlogger.New(
		gormlogrus.NewWriter(gormlogrus.WithLogger(logger)),
		gormlogger.Config{
			SlowThreshold: slowQueryThreshold,
			LogLevel:      gormlogger.Warn,
			Colorful:      false,
		},
	)

	db, openErr := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormLogger,
	})
	if openErr != nil {
		return nil, openErr
	}

	// Set connection pool
	sqlDB, connErr := db.DB()
	if connErr != nil {
		return nil, connErr
	}

	sqlDB.SetMaxIdleConns(defaultMaxIdleConns)
	sqlDB.SetMaxOpenConns(defaultMaxOpenCons)

	return db, nil
}

const (
	fieldCount      = "count"
	fieldCollection = "collection"
	fieldTotalCount = "total_count"
)
