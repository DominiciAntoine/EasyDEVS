package handler

import (
	"app/database"
	"app/middleware"
	"app/model"

	"github.com/gofiber/fiber/v2"
)

// SetupDiagramRoutes configures diagram-related routes
func SetupDiagramRoutes(app *fiber.App) {
	group := app.Group("/diagram", middleware.Protected())

	group.Get("", getAllDiagrams)
	group.Get("/:id", getDiagram)
	group.Post("", createDiagram)
	group.Patch("/:id", patchDiagram)
	group.Delete("/:id", deleteDiagram)
}

// getAllDiagrams retrieves all diagrams
// @Summary Get all diagrams
// @Description Retrieve a list of all diagrams
// @Tags diagrams
// @Produce json
// @Success 200 {array} model.Diagram
// @Failure 500 {object} map[string]interface{}
// @Router /diagram [get]
func getAllDiagrams(c *fiber.Ctx) error {
	db := database.DB
	var Diagrams []model.Diagram
	db.Find(&Diagrams)
	return c.JSON(Diagrams)
}

// getDiagram retrieves a diagram by ID
// @Summary Get a diagram by ID
// @Description Retrieve a single diagram by its ID
// @Tags diagrams
// @Produce json
// @Param id path string true "Diagram ID"
// @Success 200 {object} model.Diagram
// @Failure 404 {object} map[string]interface{}
// @Router /diagram/{id} [get]
func getDiagram(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB
	var diagram model.Diagram
	db.Find(&diagram, id)
	if diagram.Name == "" {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No diagram found with ID", "data": nil})
	}
	return c.JSON(diagram)
}

// createDiagram creates a new diagram
// @Summary Create a diagram
// @Description Create a new diagram entry
// @Tags diagrams
// @Accept json
// @Produce json
// @Param diagram body model.Diagram true "Diagram data"
// @Success 201 {object} model.Diagram
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /diagram [post]
func createDiagram(c *fiber.Ctx) error {
	db := database.DB
	diagram := new(model.Diagram)
	if err := c.BodyParser(diagram); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Couldn't create diagram", "data": err})
	}
	db.Create(&diagram)
	return c.JSON(diagram)
}

// patchDiagram updates an existing diagram by ID
// @Summary Update a diagram
// @Description Update an existing diagram with partial data
// @Tags diagrams
// @Accept json
// @Produce json
// @Param id path string true "Diagram ID"
// @Param updateData body map[string]interface{} true "Fields to update"
// @Success 200 {object} model.Diagram
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /diagram/{id} [patch]
func patchDiagram(c *fiber.Ctx) error {
	db := database.DB
	id := c.Params("id")

	var diagram model.Diagram
	if err := db.First(&diagram, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Diagram not found"})
	}

	updateData := make(map[string]interface{})
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid input", "data": err.Error()})
	}

	db.Model(&diagram).Updates(updateData)

	return c.JSON(diagram)
}

// deleteDiagram deletes a diagram by ID
// @Summary Delete a diagram
// @Description Delete a diagram by its ID
// @Tags diagrams
// @Param id path string true "Diagram ID"
// @Success 204 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /diagram/{id} [delete]
func deleteDiagram(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB

	var diagram model.Diagram
	db.First(&diagram, id)
	if diagram.Name == "" {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No diagram found with ID", "data": nil})
	}
	db.Delete(&diagram)
	return c.Status(201).JSON(nil)
}
