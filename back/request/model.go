package request

import "app/enum"

type ModelRequest struct {
	LibID           *string        `json:"libId"`
	Name            string         `json:"name"`
	Description     string         `json:"description"`
	Type            enum.ModelType `json:"type"`
	Code            string         `json:"code"`
	MetadataJSON    string         `json:"metadataJson"`
	ComponentsJSON  string         `json:"componentsJson"`
	ConnectionsJSON string         `json:"connectionsJson"`
	PortInJSON      string         `json:"portInJson"`
	PortOutJSON     string         `json:"portOutJson"`
}
