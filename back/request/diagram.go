package request

// DiagramRequest struct
type DiagramRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	WorkspaceID string `json:"workspaceId"`
}
