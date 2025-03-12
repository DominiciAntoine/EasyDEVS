// @title Easy DEVS API
// @version 1.0
// @description This is the API documentation for Easy DEVS.
// @host localhost:3000
// @BasePath /

package main

import (
	"log"

	"app/database"
	"app/router"

	_ "app/docs"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/swagger"
	// "github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	app := fiber.New(fiber.Config{
		Prefork:       true,
		CaseSensitive: true,
		StrictRouting: true,
		ServerHeader:  "Fiber",
		AppName:       "Easy DEVS",
	})
	// app.Use(cors.New())

	app.Get("/swagger/*", swagger.HandlerDefault)

	database.ConnectDB()

	router.SetupRoutes(app)
	log.Fatal(app.Listen(":3000"))
}
