package handler

import (
	"app/database"
	"app/model"

	"github.com/gofiber/fiber/v2"
)

// GetAllDiagrams query all Diagrams
func GetAllDiagrams(c *fiber.Ctx) error {
	db := database.DB
	var Diagrams []model.Diagram
	db.Find(&Diagrams)
	return c.JSON(fiber.Map{"status": "success", "message": "All Diagrams", "data": Diagrams})
}

// GetDiagram query library
func GetDiagram(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB
	var library model.Diagram
	db.Find(&library, id)
	if library.Title == "" {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No library found with ID", "data": nil})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Diagram found", "data": library})
}

// CreateDiagram new library
func CreateDiagram(c *fiber.Ctx) error {
	db := database.DB
	library := new(model.Diagram)
	if err := c.BodyParser(library); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Couldn't create library", "data": err})
	}
	db.Create(&library)
	return c.JSON(fiber.Map{"status": "success", "message": "Created library", "data": library})
}

// DeleteDiagram delete library
func DeleteDiagram(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB

	var library model.Diagram
	db.First(&library, id)
	if library.Title == "" {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No library found with ID", "data": nil})
	}
	db.Delete(&library)
	return c.JSON(fiber.Map{"status": "success", "message": "Diagram successfully deleted", "data": nil})
}
