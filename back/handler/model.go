package handler

import (
	"app/database"
	"app/json"
	"app/middleware"
	"app/model"
	"app/request"
	"app/response"

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
	group.Get("/:id/recursive", getModelRecursive)
}

// getAllModels retrieves a list of all models
// @Summary Get all models
// @Description Retrieve a list of all models
// @Tags models
// @Produce json
// @Success 200 {array} []response.ModelResponse
// @Failure 500 {object} map[string]interface{}
// @Router /model [get]
func getAllModels(c *fiber.Ctx) error {
	db := database.DB
	var models []model.Model
	db.Find(&models, "user_id = ?", c.Locals("user_id").(string))

	res := []response.ModelResponse{}

	for _, model := range models {
		res = append(res, response.CreateModelResponse(model))
	}
	return c.JSON(res)
}

// getModel retrieves a single model by ID
// @Summary Get a model by ID
// @Description Retrieve a single model by its ID
// @Tags models
// @Produce json
// @Param id path string true "Model ID"
// @Success 200 {object} response.ModelResponse
// @Failure 404 {object} map[string]interface{}
// @Router /model/{id} [get]
func getModel(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB
	var model model.Model
	db.Find(&model, "user_id = ? AND id = ?", c.Locals("user_id").(string), id)
	if model.Name == "" {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No model found with ID", "data": nil})
	}

	res := response.CreateModelResponse(model)

	return c.JSON(res)
}

// getModel retrieves a single model by ID
// @Summary Get a model by ID
// @Description Retrieve a single model by its ID
// @Tags models
// @Produce json
// @Param id path string true "Model ID"
// @Success 200 {object} []response.ModelResponse
// @Failure 404 {object} map[string]interface{}
// @Router /model/{id}/recursive [get]
func getModelRecursive(c *fiber.Ctx) error {
	db := database.DB

	componentsId := make([]string, 0)
	componentsId = append(componentsId, c.Params("id"))
	models := make([]response.ModelResponse, 0)

	for len(componentsId) > 0 {
		var model model.Model

		flag := false

		for _, v := range models {
			if v.ID == componentsId[0] {
				flag = true
			}
		}
		if !flag {
			db.Find(&model, "user_id = ? AND id = ?", c.Locals("user_id").(string), componentsId[0])
			if model.Name == "" {
				return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No model found with ID", "data": nil})
			} else {
				models = append(models, response.CreateModelResponse(model))
				for _, v := range model.Components {
					componentsId = append(componentsId, v.ModelID)
				}
			}
		}
		componentsId = componentsId[1:]
	}

	return c.JSON(models)
}

// createModel creates a new model
// @Summary Create a model
// @Description Create a new model entry
// @Tags models
// @Accept json
// @Produce json
// @Param model body request.ModelRequest true "Model data"
// @Success 201 {object} response.ModelResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /model [post]
func createModel(c *fiber.Ctx) error {
	db := database.DB
	req := new(request.ModelRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Couldn't create model", "data": err})
	}

	components := make([]json.ModelComponent, 0)
	for _, a_mc := range req.Components {
		components = append(components, json.ModelComponent{
			ComponentID: a_mc.ComponentID,
			ModelID:     a_mc.ModelID,
		})
	}

	model := model.Model{
		LibID:       req.LibID,
		Name:        req.Name,
		Description: req.Description,
		Type:        req.Type,
		Code:        req.Code,
		UserID:      c.Locals("user_id").(string),
		Components:  components,
		Ports:       req.Ports,
		Metadata:    req.Metadata,
		Connections: req.Connections,
	}

	db.Create(&model)

	res := response.CreateModelResponse(model)

	return c.JSON(res)
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
	db.First(&model, "user_id = ? AND id = ?", c.Locals("user_id").(string), id)
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
// @Param updateData body request.ModelRequest true "Fields to update"
// @Success 200 {object} response.ModelResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /model/{id} [patch]
func patchModel(c *fiber.Ctx) error {
	db := database.DB
	id := c.Params("id")

	var model model.Model
	if err := db.First(&model, "user_id = ? AND id = ?", c.Locals("user_id").(string), id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Model not found"})
	}

	req := new(request.ModelRequest)
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid input", "data": err.Error()})
	}

	db.Model(&model).Updates(req)

	res := response.CreateModelResponse(model)

	return c.JSON(res)
}