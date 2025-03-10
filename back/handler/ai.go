package handler

import (
	"app/middleware"
	"app/prompt"
	"context"
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	openai "github.com/sashabaranov/go-openai"
)

// SetupAiRoutes configure les routes de l'IA
func SetupAiRoutes(app *fiber.App) {
	group := app.Group("/ai", middleware.Protected())

	group.Post("/generate-diagram", generateDiagram)
	group.Post("/generate-model", generateModel)
}

// Structure des requêtes
type GenerateDiagramRequest struct {
	DiagramName string `json:"diagramName"`
	UserPrompt  string `json:"userPrompt"`
}

type GenerateModelRequest struct {
	ModelName          string `json:"modelName"`
	ModelType          string `json:"modelType"`
	PreviousModelsCode string `json:"previousModelsCode"`
	UserPrompt         string `json:"userPrompt"`
}

// Fonction pour générer un diagramme via l'IA
func generateDiagram(c *fiber.Ctx) error {
	var request GenerateDiagramRequest

	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Requête invalide"})
	}

	if request.DiagramName == "" || request.UserPrompt == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Tous les champs sont requis"})
	}

	// 🔹 Construction du prompt
	fullPrompt := fmt.Sprintf(`
		[DIAGRAM REQUEST]
		Diagram Name: %s
		User Description: %s
	`, request.DiagramName, request.UserPrompt)

	// 🔹 Appel au LLM OpenAI
	client := openai.NewClient(os.Getenv("AI_API_KEY"))
	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: "gpt-4",
			Messages: []openai.ChatCompletionMessage{
				{Role: "system", Content: prompt.DiagramPrompt},
				{Role: "user", Content: fullPrompt},
			},
			MaxTokens:   1000,
			Temperature: 0.9,
		},
	)

	if err != nil {
		log.Println("Erreur OpenAI:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Erreur AI"})
	}

	// 🔹 Extraction de la réponse brute
	rawContent := resp.Choices[0].Message.Content

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Diagramme généré",
		"data":    rawContent,
	})
}

// Fonction pour générer un modèle via l'IA
func generateModel(c *fiber.Ctx) error {
	var request GenerateModelRequest

	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Requête invalide"})
	}

	if request.ModelName == "" || request.ModelType == "" || request.PreviousModelsCode == "" || request.UserPrompt == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Tous les champs sont requis"})
	}

	// 🔹 Construction du prompt
	fullPrompt := fmt.Sprintf(`
		[MODEL REQUEST]
		Model Name: %s
		Model Type: %s

		Previous Models Code:
		%s

		User Description: %s
	`, request.ModelName, request.ModelType, request.PreviousModelsCode, request.UserPrompt)

	// 🔹 Appel au LLM OpenAI
	client := openai.NewClient(os.Getenv("AI_API_KEY"))
	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: "gpt-4",
			Messages: []openai.ChatCompletionMessage{
				{Role: "system", Content: prompt.ModelPrompt},
				{Role: "user", Content: fullPrompt},
			},
			MaxTokens:   1000,
			Temperature: 0.9,
		},
	)

	if err != nil {
		log.Println("Erreur OpenAI:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Erreur AI"})
	}

	// 🔹 Extraction de la réponse brute
	rawContent := resp.Choices[0].Message.Content

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Modèle généré",
		"data":    rawContent,
	})
}
