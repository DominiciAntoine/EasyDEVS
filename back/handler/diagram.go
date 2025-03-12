package handler

import (
	"app/database"
	"app/middleware"
	"app/model"

	"github.com/gofiber/fiber/v2"
)

func SetupDiagramRoutes(app *fiber.App) {
	group := app.Group("/diagram", middleware.Protected())

	group.Get("/", getAllDiagrams)
	group.Get("/:id", getDiagram)
	group.Post("/", createDiagram)
	group.Delete("/:id", deleteDiagram)
}

// GetAllDiagrams query all Diagrams
func getAllDiagrams(c *fiber.Ctx) error {
	db := database.DB
	var Diagrams []model.Diagram
	db.Find(&Diagrams)
	return c.JSON(fiber.Map{"status": "success", "message": "All Diagrams", "data": Diagrams})
}

// GetDiagram query diagram
func getDiagram(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB
	var diagram model.Diagram
	db.Find(&diagram, id)
	if diagram.Name == "" {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No diagram found with ID", "data": nil})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Diagram found", "data": diagram})
}

// CreateDiagram new diagram
func createDiagram(c *fiber.Ctx) error {
	db := database.DB
	diagram := new(model.Diagram)
	if err := c.BodyParser(diagram); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Couldn't create diagram", "data": err})
	}
	db.Create(&diagram)
	return c.JSON(fiber.Map{"status": "success", "message": "Created diagram", "data": diagram})
}

// DeleteDiagram delete diagram
func deleteDiagram(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB

	var diagram model.Diagram
	db.First(&diagram, id)
	if diagram.Name == "" {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No diagram found with ID", "data": nil})
	}
	db.Delete(&diagram)
	return c.JSON(fiber.Map{"status": "success", "message": "Diagram successfully deleted", "data": nil})
}
