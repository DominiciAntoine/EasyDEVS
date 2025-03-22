package model

import (
	"time"

	"app/enum"
)

type Model struct {
	ID     string  `gorm:"type:uuid;default:uuid_generate_v4();primaryKey;<-:false" json:"id"`
	UserID string  `gorm:"type:uuid" json:"userId"`
	LibID  *string `gorm:"type:uuid" json:"libId"`

	Name            string         `gorm:"type:varchar(255);not null" json:"name"`
	Type            enum.ModelType `gorm:"type:model_type;not null" json:"type"`
	Description     string         `gorm:"type:text;not null" json:"description"`
	Code            string         `gorm:"type:text;not null" json:"code"`
	MetadataJSON    string         `gorm:"type:jsonb;default:'{}'" json:"metadataJson"`
	ComponentsJSON  string         `gorm:"type:jsonb;default:'[]'" json:"componentsJson"`
	ConnectionsJSON string         `gorm:"type:jsonb;default:'[]'" json:"connectionsJson"`
	PortInJSON      string         `gorm:"type:jsonb;default:'[]'" json:"portInJson"`
	PortOutJSON     string         `gorm:"type:jsonb;default:'[]'" json:"portOutJson"`
	CreatedAt       time.Time      `gorm:"type:timestamp;default:now()" json:"createdAt"`
	UpdatedAt       time.Time      `gorm:"type:timestamp;default:now()" json:"updatedAt"`
	DeletedAt       time.Time      `gorm:"index" json:"deletedAt"`
}
