package json

type InstanceModelLink struct {
	Model string `json:"model" validate:"required"`
	Port  string `json:"port" validate:"required"`
}

type InstanceModelConnection struct {
	From InstanceModelLink `json:"from" validate:"required"`
	To   InstanceModelLink `json:"to" validate:"required"`
}

type InstanceModelStyle struct {
	Width  int `json:"width" validate:"required"`
	Height int `json:"height" validate:"required"`
}

type InstanceModelPosition struct {
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

type InstanceModelMetadata struct {
	BackgroundColor     *string          `json:"backgroundColor,omitempty"`
	AlwaysShowToolbar   *bool            `json:"alwaysShowToolbar,omitempty"`
	AlwaysShowExtraInfo *bool            `json:"alwaysShowExtraInfo,omitempty"`
	ToolbarVisible      *bool            `json:"toolbarVisible,omitempty"`
	ToolbarPosition     *ToolbarPosition `json:"toolbarPosition,omitempty"`
	Position            InstanceModelPosition    `json:"position" validate:"required"`
	Style               InstanceModelStyle       `json:"style" validate:"required"`
}