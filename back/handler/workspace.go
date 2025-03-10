package handler

import (
	"app/database"
	"app/middleware"
	"app/model"

	"github.com/gofiber/fiber/v2"
)

func SetupWorkspaceRoutes(app *fiber.App) {
	group := app.Group("/workspaces", middleware.Protected())

	group.Get("/", getAllWorkspaces)
	group.Get("/:id", getWorkspace)
	group.Post("/", createWorkspace)
	group.Delete("/:id", deleteWorkspace)
	group.Patch("/:id", patchWorkspace)
}

// GetAllWorkspaces query all Workspaces
func getAllWorkspaces(c *fiber.Ctx) error {
	db := database.DB
	var Workspaces []model.Workspace
	db.Find(&Workspaces)
	return c.JSON(fiber.Map{"status": "success", "message": "All Workspaces", "data": Workspaces})
}

// GetWorkspace query workspace
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

// CreateWorkspace new workspace
func createWorkspace(c *fiber.Ctx) error {
	db := database.DB
	workspace := new(model.Workspace)
	if err := c.BodyParser(workspace); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Couldn't create workspace", "data": err})
	}
	db.Create(&workspace)
	return c.JSON(fiber.Map{"status": "success", "message": "Created workspace", "data": workspace})
}

// DeleteWorkspace delete workspace
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

// PatchWorkspace met à jour un workspace existant
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
