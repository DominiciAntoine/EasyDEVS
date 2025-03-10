package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Model struct {
	ID     uuid.UUID  `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	UserID uuid.UUID  `gorm:"type:uuid;constraint:OnDelete:CASCADE;" json:"userId"`
	LibID  *uuid.UUID `gorm:"type:uuid;constraint:OnDelete:CASCADE;" json:"libId"`

	Name            string         `gorm:"type:varchar(255);not null" json:"name"`
	Type            string         `gorm:"type:enum('atomic','coupled');not null" json:"type"`
	Code            string         `gorm:"type:text;not null" json:"code"`
	MetadataJSON    string         `gorm:"type:jsonb;default:'{}'" json:"metadataJson"`
	ComponentsJSON  string         `gorm:"type:jsonb;default:'[]'" json:"componentsJson"`
	ConnectionsJSON string         `gorm:"type:jsonb;default:'[]'" json:"connectionsJson"`
	PortInJSON      string         `gorm:"type:jsonb;default:'[]'" json:"portInJson"`
	PortOutJSON     string         `gorm:"type:jsonb;default:'[]'" json:"portOutJson"`
	CreatedAt       time.Time      `gorm:"type:timestamp;default:now()" json:"createdAt"`
	UpdatedAt       time.Time      `gorm:"type:timestamp;default:now()" json:"updatedAt"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"deletedAt"`
}

func (m *Model) BeforeCreate(tx *gorm.DB) (err error) {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return
}
