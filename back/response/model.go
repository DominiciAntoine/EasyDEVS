package response

import (
	"app/enum"
	"app/json"
	"app/model"
)

type ModelResponse struct {
	ID     string  `json:"id"`
	UserID string  `json:"userId"`
	LibID  *string `json:"libId"`

	Name            string                 `json:"name" validate:"required"`
	Type            enum.ModelType         `json:"type" validate:"required"`
	Description     string                 `json:"description" validate:"required"`
	Code            string                 `json:"code" validate:"required"`
	MetadataJSON    json.ModelMetadata     `json:"metadataJson" validate:"required"`
	ComponentsJSON  []json.ModelComponents `json:"componentsJson" validate:"required"`
	ConnectionsJSON []json.Connection      `json:"connectionsJson" validate:"required"`
	PortInJSON      []json.ModelPort       `json:"portInJson" validate:"required"`
	PortOutJSON     []json.ModelPort       `json:"portOutJson" validate:"required"`
}

func CreateModelResponse(model model.Model) ModelResponse {
	return ModelResponse{
		LibID:           model.LibID,
		Name:            model.Name,
		Description:     model.Description,
		Type:            model.Type,
		Code:            model.Code,
		MetadataJSON:    model.MetadataJSON,
		ComponentsJSON:  model.ComponentsJSON,
		PortInJSON:      model.PortInJSON,
		PortOutJSON:     model.PortOutJSON,
		UserID:          model.UserID,
		ID:              model.ID,
		ConnectionsJSON: model.ConnectionsJSON,
	}
}
