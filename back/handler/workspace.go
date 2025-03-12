package handler

import (
	"app/database"
	"app/middleware"
	"app/model"

	"github.com/gofiber/fiber/v2"
)

// SetupWorkspaceRoutes configures workspace-related routes
func SetupWorkspaceRoutes(app *fiber.App) {
	group := app.Group("/workspaces", middleware.Protected())

	group.Get("/", getAllWorkspaces)
	group.Get("/:id", getWorkspace)
	group.Post("/", createWorkspace)
	group.Delete("/:id", deleteWorkspace)
	group.Patch("/:id", patchWorkspace)
}

// Get all workspaces
// @Summary Get all workspaces
// @Description Retrieves a list of all workspaces
// @Tags Workspace
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "List of all workspaces"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Security BearerAuth
// @Router /workspaces [get]
func getAllWorkspaces(c *fiber.Ctx) error {
	db := database.DB
	var Workspaces []model.Workspace
	db.Find(&Workspaces)
	return c.JSON(fiber.Map{"status": "success", "message": "All Workspaces", "data": Workspaces})
}

// Get a single workspace by ID
// @Summary Get a workspace
// @Description Retrieves a single workspace by its ID
// @Tags Workspace
// @Accept json
// @Produce json
// @Param id path string true "Workspace ID"
// @Success 200 {object} map[string]interface{} "Workspace details"
// @Failure 404 {object} map[string]interface{} "Workspace not found"
// @Security BearerAuth
// @Router /workspaces/{id} [get]
func getWorkspace(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB
	var workspace model.Workspace
	db.Find(&workspace, id)
	if workspace.Title == "" {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No workspace found with ID", "data": nil})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Workspace found", "data": workspace})
}

// Create a new workspace
// @Summary Create a workspace
// @Description Creates a new workspace and stores it in the database
// @Tags Workspace
// @Accept json
// @Produce json
// @Param body body model.Workspace true "Workspace details"
// @Success 201 {object} map[string]interface{} "Workspace created successfully"
// @Failure 500 {object} map[string]interface{} "Failed to create workspace"
// @Security BearerAuth
// @Router /workspaces [post]
func createWorkspace(c *fiber.Ctx) error {
	db := database.DB
	workspace := new(model.Workspace)
	if err := c.BodyParser(workspace); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Couldn't create workspace", "data": err})
	}
	db.Create(&workspace)
	return c.JSON(fiber.Map{"status": "success", "message": "Created workspace", "data": workspace})
}

// Delete a workspace by ID
// @Summary Delete a workspace
// @Description Deletes a workspace based on its ID
// @Tags Workspace
// @Accept json
// @Produce json
// @Param id path string true "Workspace ID"
// @Success 200 {object} map[string]interface{} "Workspace deleted successfully"
// @Failure 404 {object} map[string]interface{} "Workspace not found"
// @Security BearerAuth
// @Router /workspaces/{id} [delete]
func deleteWorkspace(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB

	var workspace model.Workspace
	db.First(&workspace, id)
	if workspace.Title == "" {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No workspace found with ID", "data": nil})
	}
	db.Delete(&workspace)
	return c.JSON(fiber.Map{"status": "success", "message": "Workspace successfully deleted", "data": nil})
}

// Update a workspace
// @Summary Update a workspace
// @Description Updates an existing workspace
// @Tags Workspace
// @Accept json
// @Produce json
// @Param id path string true "Workspace ID"
// @Param body body map[string]interface{} true "Workspace fields to update"
// @Success 200 {object} map[string]interface{} "Workspace updated successfully"
// @Failure 400 {object} map[string]interface{} "Invalid input"
// @Failure 404 {object} map[string]interface{} "Workspace not found"
// @Security BearerAuth
// @Router /workspaces/{id} [patch]
func patchWorkspace(c *fiber.Ctx) error {
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
