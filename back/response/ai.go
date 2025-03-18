package response

type DiagramResponse struct {
	Models      []Model      `json:"models"`      // obligatoire
	Connections []Connection `json:"connections"` // obligatoire
}

type ModelType string

const (
	ModelTypeAtomic  ModelType = "atomic"
	ModelTypeCoupled ModelType = "coupled"
)

type Model struct {
	ID         string    `json:"id"`                   // obligatoire
	Type       ModelType `json:"type"`                 // enum obligatoire
	Ports      *Ports    `json:"ports,omitempty"`      // optionnel
	Components []string  `json:"components,omitempty"` // optionnel
}

type Ports struct {
	In  []string `json:"in,omitempty"`
	Out []string `json:"out,omitempty"`
}

type Connection struct {
	From Endpoint `json:"from"` // obligatoire
	To   Endpoint `json:"to"`   // obligatoire
}

type Endpoint struct {
	Model string `json:"model"` // obligatoire
	Port  string `json:"port"`  // obligatoire
}

type GeneratedModelResponse struct {
	Code string `json:"code"`
}
