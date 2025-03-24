package model

import (
	"time"

	"app/enum"
	"app/json"
)

type Model struct {
	ID     string  `gorm:"type:uuid;default:uuid_generate_v4();primaryKey;<-:false" json:"id"`
	UserID string  `gorm:"type:uuid" json:"userId"`
	LibID  *string `gorm:"type:uuid" json:"libId"`

	Name            string                 `gorm:"type:varchar(255);not null" json:"name"`
	Type            enum.ModelType         `gorm:"type:model_type;not null" json:"type"`
	Description     string                 `gorm:"type:text;not null" json:"description"`
	Code            string                 `gorm:"type:text;not null" json:"code"`
	MetadataJSON    json.ModelMetadata     `gorm:"type:json;default:'{}';serializer:json" json:"metadataJson"`
	ComponentsJSON  []json.ModelComponents `gorm:"type:json;default:'[]';serializer:json" json:"componentsJson"`
	ConnectionsJSON []json.Connection      `gorm:"type:json;default:'[]';serializer:json" json:"connectionsJson"`
	PortInJSON      []json.ModelPort       `gorm:"type:json;default:'[]';serializer:json" json:"portInJson"`
	PortOutJSON     []json.ModelPort       `gorm:"type:json;default:'[]';serializer:json" json:"portOutJson"`
	CreatedAt       time.Time              `gorm:"type:timestamp;default:now()" json:"createdAt"`
	UpdatedAt       time.Time              `gorm:"type:timestamp;default:now()" json:"updatedAt"`
	DeletedAt       time.Time              `gorm:"index" json:"deletedAt"`
}
