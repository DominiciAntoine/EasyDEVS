package handler

import (
	"strconv"

	"app/database"
	"app/middleware"
	"app/model"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// SetupUserRoutes configures user-related routes
func SetupUserRoutes(app *fiber.App) {
	group := app.Group("/users", middleware.Protected())

	group.Get("/", getAllUsers)
	group.Get("/:id", getUser)
	group.Delete("/:id", deleteUser)
	group.Patch("/:id", patchUser)
}

func validToken(t *jwt.Token, id string) bool {
	n, err := strconv.Atoi(id)
	if err != nil {
		return false
	}

	claims := t.Claims.(jwt.MapClaims)
	uid := int(claims["user_id"].(float64))

	return uid == n
}

func validUser(id string, p string) bool {
	db := database.DB
	var user model.User
	db.First(&user, id)
	if user.Username == "" {
		return false
	}
	if !CheckPasswordHash(p, user.Password) {
		return false
	}
	return true
}

// Get all users
// @Summary Get all users
// @Description Retrieves a list of all users
// @Tags User
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "List of all users"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Security BearerAuth
// @Router /users [get]
func getAllUsers(c *fiber.Ctx) error {
	db := database.DB
	var users []model.User

	// Retrieve all users
	if err := db.Find(&users).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Error retrieving users", "data": err.Error()})
	}

	// Check if the list is empty
	if len(users) == 0 {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No users found", "data": nil})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Users retrieved", "data": users})
}

// Get a single user by ID
// @Summary Get a user
// @Description Retrieves a single user by their ID
// @Tags User
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} map[string]interface{} "User details"
// @Failure 404 {object} map[string]interface{} "User not found"
// @Security BearerAuth
// @Router /users/{id} [get]
func getUser(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB
	var user model.User
	db.Find(&user, id)
	if user.Username == "" {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No user found with ID", "data": nil})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "User found", "data": user})
}

// Update a user
// @Summary Update user
// @Description Updates an existing user
// @Tags User
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param body body UpdateUserInput true "User fields to update"
// @Success 200 {object} map[string]interface{} "User updated successfully"
// @Failure 400 {object} map[string]interface{} "Invalid input"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Security BearerAuth
// @Router /users/{id} [patch]
func patchUser(c *fiber.Ctx) error {
	type UpdateUserInput struct {
		Names string `json:"names"`
	}
	var uui UpdateUserInput
	if err := c.BodyParser(&uui); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Review your input", "errors": err.Error()})
	}
	id := c.Params("id")
	token := c.Locals("user").(*jwt.Token)

	if !validToken(token, id) {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Invalid token id", "data": nil})
	}

	db := database.DB
	var user model.User

	db.First(&user, id)
	user.Fullname = uui.Names
	db.Save(&user)

	return c.JSON(fiber.Map{"status": "success", "message": "User successfully updated", "data": user})
}

// Delete a user
// @Summary Delete user
// @Description Deletes a user account
// @Tags User
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param body body PasswordInput true "User password for validation"
// @Success 200 {object} map[string]interface{} "User deleted successfully"
// @Failure 400 {object} map[string]interface{} "Invalid input"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Security BearerAuth
// @Router /users/{id} [delete]
func deleteUser(c *fiber.Ctx) error {
	type PasswordInput struct {
		Password string `json:"password"`
	}
	var pi PasswordInput
	if err := c.BodyParser(&pi); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Review your input", "errors": err.Error()})
	}
	id := c.Params("id")
	token := c.Locals("user").(*jwt.Token)

	if !validToken(token, id) {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Invalid token id", "data": nil})
	}

	if !validUser(id, pi.Password) {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Not valid user", "data": nil})
	}

	db := database.DB
	var user model.User

	db.First(&user, id)

	db.Delete(&user)
	return c.JSON(fiber.Map{"status": "success", "message": "User successfully deleted", "data": nil})
}
