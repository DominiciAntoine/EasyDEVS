package handler

import (
	"app/database"
	"app/middleware"
	"app/model"

	"github.com/gofiber/fiber/v2"
)

// SetupLibraryRoutes configures library-related routes
func SetupLibraryRoutes(router fiber.Router) {
	group := router.Group("/library", middleware.Protected())

	group.Get("/", getAllLibraries)
	group.Get("/:id", getLibrary)
	group.Post("/", createLibrary)
	group.Delete("/:id", deleteLibrary)
	group.Patch("/:id", patchLibrary)
}

// Get all libraries
// @Summary Get all libraries
// @Description Retrieves a list of all libraries
// @Tags Library
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "List of all libraries"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Security BearerAuth
// @Router /library [get]
func getAllLibraries(c *fiber.Ctx) error {
	db := database.DB
	var Libraries []model.Library
	db.Find(&Libraries)
	return c.JSON(fiber.Map{"status": "success", "message": "All Libraries", "data": Libraries})
}

// Get a single library by ID
// @Summary Get a library
// @Description Retrieves a single library by its ID
// @Tags Library
// @Accept json
// @Produce json
// @Param id path string true "Library ID"
// @Success 200 {object} map[string]interface{} "Library details"
// @Failure 404 {object} map[string]interface{} "Library not found"
// @Security BearerAuth
// @Router /library/{id} [get]
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

// Create a new library
// @Summary Create a library
// @Description Creates a new library and stores it in the database
// @Tags Library
// @Accept json
// @Produce json
// @Param body body model.Library true "Library details"
// @Success 201 {object} map[string]interface{} "Library created successfully"
// @Failure 500 {object} map[string]interface{} "Failed to create library"
// @Security BearerAuth
// @Router /library [post]
func createLibrary(c *fiber.Ctx) error {
	db := database.DB
	library := new(model.Library)
	if err := c.BodyParser(library); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Couldn't create library", "data": err})
	}
	db.Create(&library)
	return c.JSON(fiber.Map{"status": "success", "message": "Created library", "data": library})
}

// Delete a library by ID
// @Summary Delete a library
// @Description Deletes a library based on its ID
// @Tags Library
// @Accept json
// @Produce json
// @Param id path string true "Library ID"
// @Success 200 {object} map[string]interface{} "Library deleted successfully"
// @Failure 404 {object} map[string]interface{} "Library not found"
// @Security BearerAuth
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
	return c.JSON(fiber.Map{"status": "success", "message": "Library successfully deleted", "data": nil})
}

// Update a library
// @Summary Update a library
// @Description Updates an existing library
// @Tags Library
// @Accept json
// @Produce json
// @Param id path string true "Library ID"
// @Param body body map[string]interface{} true "Library fields to update"
// @Success 200 {object} map[string]interface{} "Library updated successfully"
// @Failure 400 {object} map[string]interface{} "Invalid input"
// @Failure 404 {object} map[string]interface{} "Library not found"
// @Security BearerAuth
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

	return c.JSON(fiber.Map{"status": "success", "message": "Library updated", "data": library})
}
