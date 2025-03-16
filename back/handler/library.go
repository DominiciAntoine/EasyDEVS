package handler

import (
	"app/database"
	"app/middleware"
	"app/model"

	"github.com/gofiber/fiber/v2"
)

// SetupLibraryRoutes configures library-related routes
func SetupLibraryRoutes(app *fiber.App) {
	group := app.Group("/library", middleware.Protected())

	group.Get("/", getAllLibraries)
	group.Get("/:id", getLibrary)
	group.Post("/", createLibrary)
	group.Delete("/:id", deleteLibrary)
	group.Patch("/:id", patchLibrary)
}

// getAllLibraries retrieves all libraries
// @Summary Get all libraries
// @Description Retrieve a list of all libraries
// @Tags libraries
// @Produce json
// @Success 200 {array} model.Library
// @Failure 500 {object} map[string]interface{}
// @Router /library [get]
func getAllLibraries(c *fiber.Ctx) error {
	db := database.DB
	var Libraries []model.Library
	db.Find(&Libraries)
	return c.JSON(Libraries)
}

// getLibrary retrieves a library by ID
// @Summary Get a library by ID
// @Description Retrieve a single library by its ID
// @Tags libraries
// @Produce json
// @Param id path string true "Library ID"
// @Success 200 {object} model.Library
// @Failure 404 {object} map[string]interface{}
// @Router /library/{id} [get]
func getLibrary(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB
	var library model.Library
	db.Find(&library, id)
	if library.Title == "" {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No library found with ID", "data": nil})
	}
	return c.JSON(library)
}

// createLibrary creates a new library
// @Summary Create a library
// @Description Create a new library entry
// @Tags libraries
// @Accept json
// @Produce json
// @Param library body model.Library true "Library data"
// @Success 201 {object} model.Library
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /library [post]
func createLibrary(c *fiber.Ctx) error {
	db := database.DB
	library := new(model.Library)
	if err := c.BodyParser(library); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Couldn't create library", "data": err})
	}
	db.Create(&library)
	return c.JSON(library)
}

// deleteLibrary deletes a library by ID
// @Summary Delete a library
// @Description Delete a library by its ID
// @Tags libraries
// @Param id path string true "Library ID"
// @Success 204 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /library/{id} [delete]
func deleteLibrary(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB

	var library model.Library
	db.First(&library, id)
	if library.Title == "" {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No library found with ID", "data": nil})
	}
	db.Delete(&library)
	return c.Status(201).JSON(fiber.Map{"status": "success", "message": "Library successfully deleted", "data": nil})
}

// patchLibrary updates an existing library by ID
// @Summary Update a library
// @Description Update an existing library with partial data
// @Tags libraries
// @Accept json
// @Produce json
// @Param id path string true "Library ID"
// @Param updateData body map[string]interface{} true "Fields to update"
// @Success 200 {object} model.Library
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /library/{id} [patch]
func patchLibrary(c *fiber.Ctx) error {
	db := database.DB
	id := c.Params("id")

	var library model.Library
	if err := db.First(&library, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Library not found"})
	}

	updateData := make(map[string]interface{})
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid input", "data": err.Error()})
	}

	db.Model(&library).Updates(updateData)

	return c.JSON(library)
}
