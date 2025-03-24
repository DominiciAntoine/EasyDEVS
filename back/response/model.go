package response

type DatabaseModelLink struct {
	Model string `json:"model"`
	Port  string `json:"port"`
}

type DatabaseConnection struct {
	From DatabaseModelLink `json:"from"`
	To   DatabaseModelLink `json:"to"`
}

type DatabaseModelStyle struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

type DatabaseModelPosition struct {
	X int `json:"x"`
	Y int `json:"y"`
}

type ToolbarPosition string

const (
	ToolbarPositionTop    ToolbarPosition = "top"
	ToolbarPositionLeft   ToolbarPosition = "left"
	ToolbarPositionRight  ToolbarPosition = "right"
	ToolbarPositionBottom ToolbarPosition = "bottom"
)

type DatabaseModelMetadata struct {
	BackgroundColor     *string               `json:"backgroundColor,omitempty"`
	AlwaysShowToolbar   *bool                 `json:"alwaysShowToolbar,omitempty"`
	AlwaysShowExtraInfo *bool                 `json:"alwaysShowExtraInfo,omitempty"`
	ToolbarVisible      *bool                 `json:"toolbarVisible,omitempty"`
	ToolbarPosition     *ToolbarPosition      `json:"toolbarPosition,omitempty"`
	Position            DatabaseModelPosition `json:"position"`
	Style               DatabaseModelStyle    `json:"style"`
}
