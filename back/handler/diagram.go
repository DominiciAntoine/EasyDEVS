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

// Get all diagrams
// @Summary Get all diagrams
// @Description Retrieves a list of all diagrams
// @Tags Diagram
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "List of all diagrams"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Security BearerAuth
// @Router /diagram [get]
func getAllDiagrams(c *fiber.Ctx) error {
	db := database.DB
	var Diagrams []model.Diagram
	db.Find(&Diagrams)
	return c.JSON(fiber.Map{"status": "success", "message": "All Diagrams", "data": Diagrams})
}

// Get a single diagram by ID
// @Summary Get a diagram
// @Description Retrieves a single diagram by its ID
// @Tags Diagram
// @Accept json
// @Produce json
// @Param id path string true "Diagram ID"
// @Success 200 {object} map[string]interface{} "Diagram details"
// @Failure 404 {object} map[string]interface{} "Diagram not found"
// @Security BearerAuth
// @Router /diagram/{id} [get]
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

// Create a new diagram
// @Summary Create a diagram
// @Description Creates a new diagram and stores it in the database
// @Tags Diagram
// @Accept json
// @Produce json
// @Param body body model.Diagram true "Diagram details"
// @Success 201 {object} map[string]interface{} "Diagram created successfully"
// @Failure 500 {object} map[string]interface{} "Failed to create diagram"
// @Security BearerAuth
// @Router /diagram [post]
func createDiagram(c *fiber.Ctx) error {
	db := database.DB
	diagram := new(model.Diagram)
	if err := c.BodyParser(diagram); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Couldn't create diagram", "data": err})
	}
	db.Create(&diagram)
	return c.JSON(fiber.Map{"status": "success", "message": "Created diagram", "data": diagram})
}

// Delete a diagram by ID
// @Summary Delete a diagram
// @Description Deletes a diagram based on its ID
// @Tags Diagram
// @Accept json
// @Produce json
// @Param id path string true "Diagram ID"
// @Success 200 {object} map[string]interface{} "Diagram deleted successfully"
// @Failure 404 {object} map[string]interface{} "Diagram not found"
// @Security BearerAuth
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
	return c.JSON(fiber.Map{"status": "success", "message": "Diagram successfully deleted", "data": nil})
}
