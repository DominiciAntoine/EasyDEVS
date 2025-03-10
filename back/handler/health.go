package handler

import (
	"github.com/gofiber/fiber/v2"
)

func SetupHealthRoutes(app *fiber.App) {
	group := app.Group("/health")
	group.Get("/", health)
}

// Hello handle api status
func health(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"status": "success", "message": "ok", "data": nil})
}
