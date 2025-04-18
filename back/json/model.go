package json

import (
	"app/enum"
)

type ModelPort struct {
	ID        string                  `json:"id" validate:"required"`
	Direction enum.ModelPortDirection `json:"type" validate:"required"`
}

type ModelConnection struct {
	From ModelLink `json:"from" validate:"required"`
	To   ModelLink `json:"to" validate:"required"`
}

type ModelLink struct {
	ModelID string `json:"modelId" validate:"required"`
	Port    string `json:"port" validate:"required"`
}

type ModelStyle struct {
	Width  int `json:"width" validate:"required"`
	Height int `json:"height" validate:"required"`
}

type ModelPosition struct {
	X int `json:"x" validate:"required"`
	Y int `json:"y" validate:"required"`
}

type ToolbarPosition string

const (
	ToolbarPositionTop    ToolbarPosition = "top"
	ToolbarPositionLeft   ToolbarPosition = "left"
	ToolbarPositionRight  ToolbarPosition = "right"
	ToolbarPositionBottom ToolbarPosition = "bottom"
)

type ModelMetadata struct {
	BackgroundColor     *string          `json:"backgroundColor,omitempty"`
	AlwaysShowToolbar   *bool            `json:"alwaysShowToolbar,omitempty"`
	AlwaysShowExtraInfo *bool            `json:"alwaysShowExtraInfo,omitempty"`
	ToolbarVisible      *bool            `json:"toolbarVisible,omitempty"`
	ToolbarPosition     *ToolbarPosition `json:"toolbarPosition,omitempty"`
	Position            ModelPosition    `json:"position" validate:"required"`
	Style               ModelStyle       `json:"style" validate:"required"`
}
