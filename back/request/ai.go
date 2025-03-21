package request

type PastMessages struct {
	Role    string `json:"role" validate:"required"`
	Content string `json:"content" validate:"required"`
}

type GenerateDiagramRequest struct {
	DiagramName   string         `json:"diagramName" example:"MyDiagram"`
	UserPrompt    string         `json:"userPrompt" example:"Create a software architecture diagram"`
	PastResponses []PastMessages `json:"pastMessages,omitempty" example:"[]"`
}

type GenerateModelRequest struct {
	ModelName          string `json:"modelName" example:"MyModel"`
	ModelType          string `json:"modelType" example:"DEVS"`
	PreviousModelsCode string `json:"previousModelsCode" example:"Existing model code"`
	UserPrompt         string `json:"userPrompt" example:"Generate a model based on the previous code"`
}
