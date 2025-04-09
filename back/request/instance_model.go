package request

import (
	"app/json"
)

type InstanceModelRequest struct {
	ID          string                         `json:"id" validate:"required;uuid4"`
	ModelTypeID string                         `json:"modelTypeId" validate:"required"`
	ParentID    *string                        `json:"parentInstanceId"`
	RootID      *string                        `json:"rootInstanceId"` // May be dont need me
	Metadata    json.InstanceModelMetadata     `json:"metadata" validate:"required"`
	Connections []json.InstanceModelConnection `json:"connections" validate:"required"`
	Ports       []json.ModelPort               `json:"ports" validate:"required"`
}