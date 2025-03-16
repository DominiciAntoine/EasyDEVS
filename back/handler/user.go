package handler

import (
	"strconv"

	"app/database"
	"app/middleware"
	"app/model"
	"app/request"

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

// validToken checks if the provided JWT token matches the user ID
func validToken(t *jwt.Token, id string) bool {
	n, err := strconv.Atoi(id)
	if err != nil {
		return false
	}

	claims := t.Claims.(jwt.MapClaims)
	uid := int(claims["user_id"].(float64))

	return uid == n
}

// validUser verifies if the user exists and the provided password is correct
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

// getAllUsers retrieves a list of all users
// @Summary Get all users
// @Description Retrieve a list of all users
// @Tags users
// @Produce json
// @Success 200 {array} model.User
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
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

	return c.JSON(users)
}

// getUser retrieves a single user by ID
// @Summary Get a user by ID
// @Description Retrieve a single user by their ID
// @Tags users
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} model.User
// @Failure 404 {object} map[string]interface{}
// @Router /users/{id} [get]
func getUser(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.DB
	var user model.User
	db.Find(&user, id)
	if user.Username == "" {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No user found with ID", "data": nil})
	}
	return c.JSON(user)
}

// patchUser updates an existing user by their ID
// @Summary Update a user
// @Description Update an existing user with partial data
// @Tags users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param user body request.UpdateUserRequest true "Partial user update"
// @Success 200 {object} model.User
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /users/{id} [patch]
func patchUser(c *fiber.Ctx) error {
	var uui request.UpdateUserRequest
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

	return c.JSON(user)
}

// deleteUser deletes a user by their ID
// @Summary Delete a user by ID
// @Description Delete an existing user by their ID
// @Tags users
// @Param id path string true "User ID"
// @Param user body request.PasswordRequest true "User password confirmation"
// @Success 204 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /users/{id} [delete]
func deleteUser(c *fiber.Ctx) error {
	var pi request.PasswordRequest
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
	return c.Status(fiber.StatusNoContent).JSON(fiber.Map{"status": "success", "message": "User successfully deleted", "data": nil})
}
