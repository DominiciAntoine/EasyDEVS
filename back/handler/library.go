package handler

import (
	"app/database"
	"app/model"

	"github.com/gofiber/fiber/v2"
)

// GetAllLibraries query all Libraries
func GetAllLibraries(c *fiber.Ctx) error {
	db := database.DB
	var Libraries []model.Library
	db.Find(&Libraries)
	return c.JSON(fiber.Map{"status": "success", "message": "All Libraries", "data": Libraries})
}

// GetLibrary query library
func GetLibrary(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB
	var library model.Library
	db.Find(&library, id)
	if library.Title == "" {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No library found with ID", "data": nil})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Library found", "data": library})
}

// CreateLibrary new library
func CreateLibrary(c *fiber.Ctx) error {
	db := database.DB
	library := new(model.Library)
	if err := c.BodyParser(library); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Couldn't create library", "data": err})
	}
	db.Create(&library)
	return c.JSON(fiber.Map{"status": "success", "message": "Created library", "data": library})
}

// DeleteLibrary delete library
func DeleteLibrary(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB

	var library model.Library
	db.First(&library, id)
	if library.Title == "" {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No library found with ID", "data": nil})
	}
	db.Delete(&library)
	return c.JSON(fiber.Map{"status": "success", "message": "Library successfully deleted", "data": nil})
}
