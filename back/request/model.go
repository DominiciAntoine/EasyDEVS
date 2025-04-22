package request

import (
	"app/enum"
	"app/json"
)

type ModelRequest struct {
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