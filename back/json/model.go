package json

import "app/enum"

type ModelPort struct {
	ID        string             `json:"id" validate:"required"`
	Direction enum.ModelPortDirection `json:"type" validate:"required"`
}