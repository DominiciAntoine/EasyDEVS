package model

import (
	"time"

	"app/enum"
	"app/response"
)

type Model struct {
	ID     string  `gorm:"type:uuid;default:uuid_generate_v4();primaryKey;<-:false" json:"id"`
	UserID string  `gorm:"type:uuid" json:"userId"`
	LibID  *string `gorm:"type:uuid" json:"libId"`

	Name         string                           `gorm:"type:varchar(255);not null" json:"name"`
	Type         enum.ModelType                   `gorm:"type:model_type;not null" json:"type"`
	Description  string                           `gorm:"type:text;not null" json:"description"`
	Code         string                           `gorm:"type:text;not null" json:"code"`
	MetadataJSON response.DatabaseModelMetadata   `gorm:"type:jsonb;default:'{}'" json:"metadataJson"`
	Components   []response.DatabaseModelMetadata `gorm:"type:jsonb;default:'[]'" json:"componentsJson"`
	Connections  []response.DatabaseConnection    `gorm:"type:jsonb;default:'[]'" json:"connectionsJson"`
	PortIn       []response.DatabaseModelLink     `gorm:"type:jsonb;default:'[]'" json:"portInJson"`
	PortOut      []response.DatabaseModelLink     `gorm:"type:jsonb;default:'[]'" json:"portOutJson"`
	CreatedAt    time.Time                        `gorm:"type:timestamp;default:now()" json:"createdAt"`
	UpdatedAt    time.Time                        `gorm:"type:timestamp;default:now()" json:"updatedAt"`
	DeletedAt    time.Time                        `gorm:"index" json:"deletedAt"`
}
