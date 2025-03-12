package database

import (
	"fmt"
	"os"
	"strconv"

	"app/config"
	"app/model"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// ConnectDB connect to db
func ConnectDB() {
	// Charger .env.back UNE SEULE FOIS
	config.LoadEnv()

	var err error
	p := os.Getenv("DB_PORT") // On utilise os.Getenv() directement
	port, err := strconv.ParseUint(p, 10, 32)
	if err != nil {
		panic("failed to parse database port")
	}

	dsn := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		port,
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	DB.AutoMigrate(&model.Library{}, &model.Diagram{}, &model.User{}, &model.Workspace{}, &model.Model{})
}
