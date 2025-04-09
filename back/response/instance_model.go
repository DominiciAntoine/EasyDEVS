package response

import (
	"app/json"
	"app/model"
)

type InstanceModelResponse struct {
	ID          string                         `json:"id" validate:"required"`
	UserID      string                         `json:"userId"`
	ModelTypeID string                         `json:"modelTypeId"`
	Metadata    json.InstanceModelMetadata     `json:"metadata" validate:"required"`
	Connections []json.InstanceModelConnection `json:"connections" validate:"required"`
	Ports       []json.ModelPort               `json:"ports" validate:"required"`
}

func CreateInstanceModelResponse(model model.InstanceModel) InstanceModelResponse {
	return InstanceModelResponse{
		Metadata:    model.Metadata,
		ID:          model.ID,
		UserID:      model.UserID,
		ModelTypeID: model.ModelTypeID,
		Connections: model.Connections,
	}
}