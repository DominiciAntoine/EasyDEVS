package request

import (
	"app/enum"
	"app/json"
)

type ModelRequest struct {
	LibID *string `json:"libId"`

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
