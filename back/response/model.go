package response

import (
	"app/enum"
	"app/json"
	"app/model"
)

type ModelResponse struct {
	ID          string           `json:"id"`
	UserID      string           `json:"userId"`
	LibID       *string          `json:"libId"`
	Name        string           `json:"name" validate:"required"`
	Type        enum.ModelType   `json:"type" validate:"required"`
	Description string           `json:"description" validate:"required"`
	Code        string           `json:"code" validate:"required"`
	Components  []ModelResponse  `json:"components" validate:"required"`
	Ports       []json.ModelPort `json:"ports" validate:"required"`
}

func CreateModelResponse(model model.Model) ModelResponse {
	return ModelResponse{
		LibID:       model.LibID,
		Name:        model.Name,
		Description: model.Description,
		Type:        model.Type,
		Code:        model.Code,
		UserID:      model.UserID,
		ID:          model.ID,
		Components:  model.Components,
		Ports:       model.Ports,
	}
}