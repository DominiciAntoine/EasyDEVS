package response

type DiagramResponse struct {
	Models      []Model      `json:"models" binding:"required"`      // obligatoire
	Connections []Connection `json:"connections" binding:"required"` // obligatoire
}

type ModelType string

const (
	ModelTypeAtomic  ModelType = "atomic"
	ModelTypeCoupled ModelType = "coupled"
)

type Model struct {
	ID         string    `json:"id" binding:"required"`   // obligatoire
	Type       ModelType `json:"type" binding:"required"` // enum obligatoire
	Ports      *Ports    `json:"ports,omitempty"`         // optionnel
	Components []string  `json:"components,omitempty"`    // optionnel
}

type Ports struct {
	In  []string `json:"in,omitempty"`
	Out []string `json:"out,omitempty"`
}

type Connection struct {
	From Endpoint `json:"from" binding:"required"` // obligatoire
	To   Endpoint `json:"to" binding:"required"`   // obligatoire
}

type Endpoint struct {
	Model string `json:"model" binding:"required"` // obligatoire
	Port  string `json:"port" binding:"required"`  // obligatoire
}

type GeneratedModelResponse struct {
	Code string `json:"code"`
}
