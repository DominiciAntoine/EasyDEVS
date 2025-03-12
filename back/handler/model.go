package handler

import (
	"app/database"
	"app/middleware"
	"app/model"

	"github.com/gofiber/fiber/v2"
)

func SetupModelRoutes(app *fiber.App) {
	group := app.Group("/model", middleware.Protected())

	group.Get("/", getAllModels)
	group.Get("/:id", getModel)
	group.Post("/", createModel)
	group.Delete("/:id", deleteModel)
	group.Patch("/:id", patchModel)
}

// GetAllModels query all Models
func getAllModels(c *fiber.Ctx) error {
	db := database.DB
	var Models []model.Model
	db.Find(&Models)
	return c.JSON(fiber.Map{"status": "success", "message": "All Models", "data": Models})
}

// GetModel query model
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

// CreateModel new model
func createModel(c *fiber.Ctx) error {
	db := database.DB
	model := new(model.Model)
	if err := c.BodyParser(model); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Couldn't create model", "data": err})
	}
	db.Create(&model)
	return c.JSON(fiber.Map{"status": "success", "message": "Created model", "data": model})
}

// DeleteModel delete model
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

// PatchModel met à jour un model existant
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
