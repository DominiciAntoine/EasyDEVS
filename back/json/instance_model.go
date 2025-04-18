package json

type InstanceModelLink struct {
	InstanceModelID string `json:"instanceModelId" validate:"required"`
	Port            string `json:"port" validate:"required"`
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

type InstanceToolbarPosition string

const (
	InstanceToolbarPositionTop    InstanceToolbarPosition = "top"
	InstanceToolbarPositionLeft   InstanceToolbarPosition = "left"
	InstanceToolbarPositionRight  InstanceToolbarPosition = "right"
	InstanceToolbarPositionBottom InstanceToolbarPosition = "bottom"
)

type InstanceModelMetadata struct {
	BackgroundColor     *string               `json:"backgroundColor,omitempty"`
	AlwaysShowToolbar   *bool                 `json:"alwaysShowToolbar,omitempty"`
	AlwaysShowExtraInfo *bool                 `json:"alwaysShowExtraInfo,omitempty"`
	ToolbarVisible      *bool                 `json:"toolbarVisible,omitempty"`
	ToolbarPosition     *ToolbarPosition      `json:"toolbarPosition,omitempty"`
	Position            InstanceModelPosition `json:"position" validate:"required"`
	Style               InstanceModelStyle    `json:"style" validate:"required"`
}
