package handler

import (
	"errors"
	"log"
	"net/mail"
	"time"

	"app/config"
	"app/database"
	"app/model"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var jwtSecret = []byte(config.Config("JWT_SECRET"))
var refreshSecret = []byte(config.Config("REFRESH_TOKEN_SECRET"))

// SetupAuthRoutes définit les routes d'authentification
func SetupAuthRoutes(router fiber.Router) {
	group := router.Group("/auth")
	group.Post("/login", login)
	group.Post("/refresh", refreshToken)
	group.Post("/logout", logout)
	group.Post("/register", register)
}

// Register a new user
// @Summary Register a new user
// @Description Creates a new user account and returns access and refresh tokens
// @Tags Authentication
// @Accept json
// @Produce json
// @Param body body RegisterInput true "User registration data"
// @Success 200 {object} map[string]interface{} "User registered successfully"
// @Failure 400 {object} map[string]interface{} "Invalid request body"
// @Failure 409 {object} map[string]interface{} "Username or Email already taken"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /auth/register [post]
func register(c *fiber.Ctx) error {
	type RegisterInput struct {
		Username string `json:"username" validate:"required,min=3,max=50"`
		Email    string `json:"email" validate:"required,email"`
		Password string `json:"password" validate:"required,min=6,max=50"`
	}

	input := new(RegisterInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid request", "errors": err.Error()})
	}

	validate := validator.New()
	if err := validate.Struct(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid request body", "errors": err.Error()})
	}

	db := database.DB
	var existingUser model.User

	// Vérifier si l'email ou le username existent déjà
	if err := db.Where("email = ? OR username = ?", input.Email, input.Username).First(&existingUser).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"status": "error", "message": "Username or Email already taken"})
	}

	// Hasher le mot de passe
	hash, err := hashPassword(input.Password)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Couldn't hash password", "errors": err.Error()})
	}

	// Créer l'utilisateur
	user := model.User{
		Username: input.Username,
		Email:    input.Email,
		Password: hash,
	}

	// Générer les tokens
	accessToken, err := generateToken(user.ID, jwtSecret, time.Minute*15)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Failed to generate access token"})
	}

	refreshToken, err := generateToken(user.ID, refreshSecret, time.Hour*24*7)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Failed to generate refresh token"})
	}

	// Stocker le refresh token
	user.RefreshToken = refreshToken
	if err := db.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Couldn't create user", "errors": err.Error()})
	}

	// Retourner les tokens directement
	return c.JSON(fiber.Map{
		"status":        "success",
		"message":       "User registered successfully",
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"user": fiber.Map{
			"username": user.Username,
			"email":    user.Email,
		},
	})
}

// Fonction de hash du mot de passe
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// CheckPasswordHash vérifie le mot de passe
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	log.Println(hash, "haaaash")
	return err == nil
}

func getUserByEmail(e string) (*model.User, error) {
	db := database.DB
	var user model.User
	if err := db.Where(&model.User{Email: e}).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func getUserByUsername(u string) (*model.User, error) {
	db := database.DB
	var user model.User
	if err := db.Where(&model.User{Username: u}).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func valid(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}

// Générer un token JWT
func generateToken(userID string, secret []byte, duration time.Duration) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(duration).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secret)
}

// Login a user
// @Summary Authenticate a user
// @Description Logs in a user and returns access and refresh tokens
// @Tags Authentication
// @Accept json
// @Produce json
// @Param body body LoginInput true "User login credentials"
// @Success 200 {object} map[string]interface{} "User logged in successfully"
// @Failure 400 {object} map[string]interface{} "Invalid request"
// @Failure 401 {object} map[string]interface{} "Invalid identity or password"
// @Failure 500 {object} map[string]interface{} "Failed to generate token"
// @Router /auth/login [post]
func login(c *fiber.Ctx) error {
	type LoginInput struct {
		Identity string `json:"identity"`
		Password string `json:"password"`
	}

	input := new(LoginInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid request", "errors": err.Error()})
	}

	identity := input.Identity
	pass := input.Password
	var userModel *model.User
	var err error

	if valid(identity) {
		userModel, err = getUserByEmail(identity)
	} else {
		userModel, err = getUserByUsername(identity)
	}

	if err != nil || userModel == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Invalid identity or password"})
	}

	if !CheckPasswordHash(pass, userModel.Password) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Invalid identity or password"})
	}

	// Génération des tokens
	accessToken, err := generateToken(userModel.ID, jwtSecret, time.Minute*15)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Failed to generate access token"})
	}

	refreshToken, err := generateToken(userModel.ID, refreshSecret, time.Hour*24*7)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Failed to generate refresh token"})
	}

	// Stockage du refresh token en base
	db := database.DB
	userModel.RefreshToken = refreshToken
	db.Save(userModel)

	return c.JSON(fiber.Map{
		"status":        "success",
		"message":       "Success login",
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	})
}

// Refresh access token
// @Summary Refresh access token
// @Description Generates a new access token using a valid refresh token
// @Tags Authentication
// @Accept json
// @Produce json
// @Param body body RefreshInput true "Refresh token"
// @Success 200 {object} map[string]interface{} "New access token generated"
// @Failure 400 {object} map[string]interface{} "Invalid request"
// @Failure 401 {object} map[string]interface{} "Invalid refresh token"
// @Router /auth/refresh [post]
func refreshToken(c *fiber.Ctx) error {
	type RefreshInput struct {
		RefreshToken string `json:"refresh_token"`
	}

	var input RefreshInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid request"})
	}

	db := database.DB
	var user model.User

	// Vérification si le refresh token est valide en base
	if err := db.Where("refresh_token = ?", input.RefreshToken).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Invalid refresh token"})
	}

	// Vérification de la validité du token
	token, err := jwt.Parse(input.RefreshToken, func(token *jwt.Token) (interface{}, error) {
		return refreshSecret, nil
	})

	if err != nil || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Invalid refresh token"})
	}

	// Génération d'un nouveau access token
	newAccessToken, err := generateToken(user.ID, jwtSecret, time.Minute*15)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Failed to generate new access token"})
	}

	return c.JSON(fiber.Map{
		"access_token": newAccessToken,
	})
}

// Logout a user
// @Summary Logout user
// @Description Logs out a user and invalidates the refresh token
// @Tags Authentication
// @Accept json
// @Produce json
// @Param body body LogoutInput true "Refresh token to invalidate"
// @Success 200 {object} map[string]interface{} "User logged out successfully"
// @Failure 400 {object} map[string]interface{} "Invalid request"
// @Failure 401 {object} map[string]interface{} "Invalid refresh token"
// @Router /auth/logout [post]
func logout(c *fiber.Ctx) error {
	type LogoutInput struct {
		RefreshToken string `json:"refresh_token"`
	}

	var input LogoutInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid request"})
	}

	db := database.DB
	var user model.User

	// Vérification si le refresh token est valide en base
	if err := db.Where("refresh_token = ?", input.RefreshToken).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Invalid refresh token"})
	}

	// Suppression du refresh token
	user.RefreshToken = ""
	db.Save(&user)

	return c.JSON(fiber.Map{"status": "success", "message": "User logged out"})
}
