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

	group.Get("", getAllModels)
	group.Get("/:id", getModel)
	group.Post("", createModel)
	group.Delete("/:id", deleteModel)
	group.Patch("/:id", patchModel)
}

// getAllModels retrieves a list of all models
// @Summary Get all models
// @Description Retrieve a list of all models
// @Tags models
// @Produce json
// @Success 200 {array} model.Model
// @Failure 500 {object} map[string]interface{}
// @Router /model [get]
func getAllModels(c *fiber.Ctx) error {
	db := database.DB
	var Models []model.Model
	db.Find(&Models)
	return c.JSON(Models)
}

// getModel retrieves a single model by ID
// @Summary Get a model by ID
// @Description Retrieve a single model by its ID
// @Tags models
// @Produce json
// @Param id path string true "Model ID"
// @Success 200 {object} model.Model
// @Failure 404 {object} map[string]interface{}
// @Router /model/{id} [get]
func getModel(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB
	var model model.Model
	db.Find(&model, id)
	if model.Name == "" {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No model found with ID", "data": nil})
	}
	return c.JSON(model)
}

// createModel creates a new model
// @Summary Create a model
// @Description Create a new model entry
// @Tags models
// @Accept json
// @Produce json
// @Param model body model.Model true "Model data"
// @Success 201 {object} model.Model
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /model [post]
func createModel(c *fiber.Ctx) error {
	db := database.DB
	model := new(model.Model)
	if err := c.BodyParser(model); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Couldn't create model", "data": err})
	}
	db.Create(&model)
	return c.JSON(model)
}

// deleteModel deletes a model by its ID
// @Summary Delete a model
// @Description Delete a model by its ID
// @Tags models
// @Param id path string true "Model ID"
// @Success 204 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
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
	return c.Status(fiber.StatusNoContent).JSON(fiber.Map{"status": "success", "message": "Model successfully deleted", "data": nil})
}

// patchModel updates an existing model by its ID
// @Summary Update a model
// @Description Update an existing model with partial data
// @Tags models
// @Accept json
// @Produce json
// @Param id path string true "Model ID"
// @Param updateData body map[string]interface{} true "Fields to update"
// @Success 200 {object} model.Model
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
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

	return c.JSON(model)
}
