package handler

import (
	"app/database"
	"app/middleware"
	"app/model"

	"github.com/gofiber/fiber/v2"
)

// SetupModelRoutes configures model-related routes
func SetupModelRoutes(app *fiber.App) {
	group := app.Group("/model", middleware.Protected())

	group.Get("/", getAllModels)
	group.Get("/:id", getModel)
	group.Post("/", createModel)
	group.Delete("/:id", deleteModel)
	group.Patch("/:id", patchModel)
}

// Get all models
// @Summary Get all models
// @Description Retrieves a list of all models
// @Tags Model
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "List of all models"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Security BearerAuth
// @Router /model [get]
func getAllModels(c *fiber.Ctx) error {
	db := database.DB
	var Models []model.Model
	db.Find(&Models)
	return c.JSON(fiber.Map{"status": "success", "message": "All Models", "data": Models})
}

// Get a single model by ID
// @Summary Get a model
// @Description Retrieves a single model by its ID
// @Tags Model
// @Accept json
// @Produce json
// @Param id path string true "Model ID"
// @Success 200 {object} map[string]interface{} "Model details"
// @Failure 404 {object} map[string]interface{} "Model not found"
// @Security BearerAuth
// @Router /model/{id} [get]
func getModel(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB
	var model model.Model
	db.Find(&model, id)
	if model.Name == "" {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No model found with ID", "data": nil})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Model found", "data": model})
}

// Create a new model
// @Summary Create a model
// @Description Creates a new model and stores it in the database
// @Tags Model
// @Accept json
// @Produce json
// @Param body body model.Model true "Model details"
// @Success 201 {object} map[string]interface{} "Model created successfully"
// @Failure 500 {object} map[string]interface{} "Failed to create model"
// @Security BearerAuth
// @Router /model [post]
func createModel(c *fiber.Ctx) error {
	db := database.DB
	model := new(model.Model)
	if err := c.BodyParser(model); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Couldn't create model", "data": err})
	}
	db.Create(&model)
	return c.JSON(fiber.Map{"status": "success", "message": "Created model", "data": model})
}

// Delete a model by ID
// @Summary Delete a model
// @Description Deletes a model based on its ID
// @Tags Model
// @Accept json
// @Produce json
// @Param id path string true "Model ID"
// @Success 200 {object} map[string]interface{} "Model deleted successfully"
// @Failure 404 {object} map[string]interface{} "Model not found"
// @Security BearerAuth
// @Router /model/{id} [delete]
func deleteModel(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB

	var model model.Model
	db.First(&model, id)
	if model.Name == "" {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No model found with ID", "data": nil})
	}
	db.Delete(&model)
	return c.JSON(fiber.Map{"status": "success", "message": "Model successfully deleted", "data": nil})
}

// Update a model
// @Summary Update a model
// @Description Updates an existing model
// @Tags Model
// @Accept json
// @Produce json
// @Param id path string true "Model ID"
// @Param body body map[string]interface{} true "Model fields to update"
// @Success 200 {object} map[string]interface{} "Model updated successfully"
// @Failure 400 {object} map[string]interface{} "Invalid input"
// @Failure 404 {object} map[string]interface{} "Model not found"
// @Security BearerAuth
// @Router /model/{id} [patch]
func patchModel(c *fiber.Ctx) error {
	db := database.DB
	id := c.Params("id")

	var model model.Model
	if err := db.First(&model, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Model not found"})
	}

	updateData := make(map[string]interface{})
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid input", "data": err.Error()})
	}

	db.Model(&model).Updates(updateData)

	return c.JSON(fiber.Map{"status": "success", "message": "Model updated", "data": model})
}
