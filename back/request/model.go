package request

import (
	"app/enum"
	"app/json"
	"app/model"
)

type ModelRequest struct {
	ID          *string                `json:"id"`
	LibID       *string                `json:"libId"`
	Name        string                 `json:"name" validate:"required"`
	Type        enum.ModelType         `json:"type" validate:"required"`
	Description string                 `json:"description" validate:"required"`
	Code        string                 `json:"code" validate:"required"`
	Components  []json.ModelComponent  `json:"components" validate:"required"`
	Ports       []json.ModelPort       `json:"ports" validate:"required"`
	Metadata    json.ModelMetadata     `json:"metadata" validate:"required"`
	Connections []json.ModelConnection `json:"connections" validate:"required"`
}

func (req ModelRequest) ToModel(userId string) model.Model {
	components := make([]json.ModelComponent, 0)
	for _, a_mc := range req.Components {
		components = append(components, json.ModelComponent{
			ComponentID: a_mc.ComponentID,
			ModelID:     a_mc.ModelID,
		})
	}

	return model.Model{
		LibID:       req.LibID,
		Name:        req.Name,
		Description: req.Description,
		Type:        req.Type,
		Code:        req.Code,
		UserID:      userId,
		Components:  components,
		Ports:       req.Ports,
		Metadata:    req.Metadata,
		Connections: req.Connections,
	}
}
