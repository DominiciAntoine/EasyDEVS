package model

import (
	"app/json"
	"time"
)

type InstanceModel struct {
	ID           string                         `gorm:"type:uuid;primaryKey"`
	UserID       string                         `gorm:"type:uuid"`
	ModelTypeID  string                         `gorm:"type:uuid"`
	ParentID     *string                        `gorm:"type: uuid"`
	RootID       *string                        `gorm:"type: uuid"` // May be dont need me
	Metadata json.InstanceModelMetadata     `gorm:"type:json;default:'{}';serializer:json" json:"metadata"`
	Connections  []json.InstanceModelConnection `gorm:"type:json;default:'[]';serializer:json" json:"connections"`
	Ports        []json.ModelPort               `gorm:"type:json;default:'[]';serializer:json" json:"ports"`
	CreatedAt    time.Time                      `gorm:"type:timestamp;default:now()" json:"createdAt"`
	UpdatedAt    time.Time                      `gorm:"type:timestamp;default:now()" json:"updatedAt"`
	DeletedAt    *time.Time                     `gorm:"index" json:"deletedAt"`
}
