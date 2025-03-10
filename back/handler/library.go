package handler

import (
	"app/database"
	"app/middleware"
	"app/model"

	"github.com/gofiber/fiber/v2"
)

func SetupLibraryRoutes(app *fiber.App) {
	group := app.Group("/library", middleware.Protected())

	group.Get("/", getAllLibraries)
	group.Get("/:id", getLibrary)
	group.Post("/", createLibrary)
	group.Delete("/:id", deleteLibrary)
	group.Patch("/:id", patchLibrary)
}

// GetAllLibraries query all Libraries
func getAllLibraries(c *fiber.Ctx) error {
	db := database.DB
	var Libraries []model.Library
	db.Find(&Libraries)
	return c.JSON(fiber.Map{"status": "success", "message": "All Libraries", "data": Libraries})
}

// GetLibrary query library
func getLibrary(c *fiber.Ctx) error {
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
func createLibrary(c *fiber.Ctx) error {
	db := database.DB
	library := new(model.Library)
	if err := c.BodyParser(library); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Couldn't create library", "data": err})
	}
	db.Create(&library)
	return c.JSON(fiber.Map{"status": "success", "message": "Created library", "data": library})
}

// DeleteLibrary delete library
func deleteLibrary(c *fiber.Ctx) error {
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

// PatchWorkspace met à jour un workspace existant
func patchLibrary(c *fiber.Ctx) error {
	db := database.DB
	id := c.Params("id")

	var workspace model.Workspace
	if err := db.First(&workspace, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Workspace not found"})
	}

	updateData := make(map[string]interface{})
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid input", "data": err.Error()})
	}

	db.Model(&workspace).Updates(updateData)

	return c.JSON(fiber.Map{"status": "success", "message": "Workspace updated", "data": workspace})
}
