package database

import (
	"fmt"
	"strconv"

	"app/config"
	"app/model"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// ConnectDB initializes the database connection
func ConnectDB() {
	// Ensure environment variables are loaded
	config.LoadEnv()

	// Retrieve database configuration from environment variables
	host := config.Config("DB_HOST")
	portStr := config.Config("DB_PORT")
	user := config.Config("DB_USER")
	password := config.Config("DB_PASSWORD")
	dbname := config.Config("DB_NAME")

	// Validate DB_PORT
	if portStr == "" {
		panic("ERROR: DB_PORT is not set in environment variables")
	}
	port, err := strconv.Atoi(portStr)
	if err != nil {
		panic(fmt.Sprintf("ERROR: Invalid DB_PORT value: %s", portStr))
	}

	// Construct DSN (Data Source Name)
	dsn := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname,
	)

	// Connect to the database
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("ERROR: Failed to connect to the database")
	}

	// AutoMigrate models
	DB.AutoMigrate(&model.Library{}, &model.Diagram{}, &model.User{}, &model.Workspace{}, &model.Model{})
}
