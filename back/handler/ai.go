package handler

import (
	"app/middleware"
	"app/prompt"
	"app/response"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	openai "github.com/sashabaranov/go-openai"
	"github.com/sashabaranov/go-openai/jsonschema"
)

// SetupAiRoutes configures AI-related routes.
func SetupAiRoutes(app *fiber.App) {
	group := app.Group("/ai", middleware.Protected())

	group.Post("/generate-diagram", generateDiagram)
	group.Post("/generate-model", generateModel)
}

// Request structures
type GenerateDiagramRequest struct {
	DiagramName string `json:"diagramName" example:"MyDiagram"`
	UserPrompt  string `json:"userPrompt" example:"Create a software architecture diagram"`
}

type GenerateModelRequest struct {
	ModelName          string `json:"modelName" example:"MyModel"`
	ModelType          string `json:"modelType" example:"DEVS"`
	PreviousModelsCode string `json:"previousModelsCode" example:"Existing model code"`
	UserPrompt         string `json:"userPrompt" example:"Generate a model based on the previous code"`
}

// Retrieves the OpenAI API client.
func getOpenAIClient() (*openai.Client, error) {
	apiKey := os.Getenv("AI_API_KEY")
	apiURL := os.Getenv("AI_API_URL")

	if apiKey == "" || apiURL == "" {
		return nil, fmt.Errorf("OpenAI API key or URL is not set")
	}

	config := openai.DefaultConfig(apiKey)
	config.BaseURL = apiURL // Set custom OpenAI API URL

	return openai.NewClientWithConfig(config), nil
}

// GenerateDiagram godoc
// @Summary Generate a diagram
// @Description Sends a prompt to OpenAI to generate a diagram in JSON format based on a strict schema.
// @Tags AI
// @Accept json
// @Produce json
// @Param body body GenerateDiagramRequest true "Data required to generate a diagram"
// @Success 200 {object} response.DiagramResponse "Generated diagram"
// @Failure 400 {object} map[string]string "Invalid request"
// @Failure 500 {object} map[string]string "AI processing error"
// @Security BearerAuth
// @Router /ai/generate-diagram [post]
func generateDiagram(c *fiber.Ctx) error {
	var request GenerateDiagramRequest

	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	if request.DiagramName == "" || request.UserPrompt == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "All fields are required"})
	}

	fullPrompt := fmt.Sprintf(`
		[DIAGRAM REQUEST]
		Diagram Name: %s
		User Description: %s
		Please respond ONLY in JSON following the provided schema.
	`, request.DiagramName, request.UserPrompt)

	client, err := getOpenAIClient()
	if err != nil {
		log.Println("OpenAI error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	// Générer le schema JSON depuis la structure DiagramResponse
	var diagramSchema response.DiagramResponse
	schema, err := jsonschema.GenerateSchemaForType(diagramSchema)
	if err != nil {
		log.Println("Schema generation error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Schema generation error"})
	}

	// Appel OpenAI avec le schema JSON strict
	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: os.Getenv("AI_MODEL"),
			Messages: []openai.ChatCompletionMessage{
				{Role: "system", Content: prompt.DiagramPrompt},
				{Role: "user", Content: fullPrompt},
			},
			ResponseFormat: &openai.ChatCompletionResponseFormat{
				Type: openai.ChatCompletionResponseFormatTypeJSONSchema,
				JSONSchema: &openai.ChatCompletionResponseFormatJSONSchema{
					Name:   "diagram",
					Schema: schema,
					Strict: true,
				},
			},
			MaxTokens:   1500,
			Temperature: 0.7,
		},
	)
	if err != nil {
		log.Println("OpenAI API error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "AI processing error"})
	}

	// Parse la réponse directement dans la structure
	var diagramResponse response.DiagramResponse
	err = json.Unmarshal([]byte(resp.Choices[0].Message.Content), &diagramResponse)
	if err != nil {
		log.Println("Unmarshal error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Invalid AI response format"})
	}

	return c.JSON(diagramResponse)
}

// GenerateModel godoc
// @Summary Generate a model
// @Description Sends a prompt to OpenAI to generate a DEVS model code.
// @Tags AI
// @Accept json
// @Produce json
// @Param body body GenerateModelRequest true "Data required to generate a model"
// @Success 200 {object} response.GeneratedModelResponse "Generated model code"
// @Failure 400 {object} map[string]string "Invalid request"
// @Failure 500 {object} map[string]string "AI processing error"
// @Security BearerAuth
// @Router /ai/generate-model [post]
func generateModel(c *fiber.Ctx) error {
	var request GenerateModelRequest

	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	if request.ModelName == "" || request.ModelType == "" || request.PreviousModelsCode == "" || request.UserPrompt == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "All fields are required"})
	}

	fullPrompt := fmt.Sprintf(`
		[MODEL REQUEST]
		Model Name: %s
		Model Type: %s

		Previous Models Code:
		%s

		User Description: %s
		Respond ONLY with the Python code in JSON as { "code": "your_code_here" }
	`, request.ModelName, request.ModelType, request.PreviousModelsCode, request.UserPrompt)

	client, err := getOpenAIClient()
	if err != nil {
		log.Println("OpenAI error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	// Appel OpenAI avec demande de format JSON
	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: os.Getenv("AI_MODEL"),
			Messages: []openai.ChatCompletionMessage{
				{Role: "system", Content: prompt.ModelPrompt},
				{Role: "user", Content: fullPrompt},
			},
			MaxTokens:   1500,
			Temperature: 0.7,
		},
	)

	if err != nil {
		log.Println("OpenAI error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "AI processing error"})
	}

	// Extraire et parser directement la réponse dans la struct
	var modelResponse response.GeneratedModelResponse
	if err := json.Unmarshal([]byte(resp.Choices[0].Message.Content), &modelResponse); err != nil {
		log.Println("Unmarshal error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Invalid AI response format"})
	}

	return c.JSON(modelResponse)
}
