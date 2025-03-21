package model

import (
	"time"

	"github.com/google/uuid"
)

// Library struct
type Diagram struct {
	ID uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`

	Name        string `gorm:"not null;size:50;" validate:"required,min=3,max=50" json:"name"`
	Description string `gorm:"not null" json:"description"`
	ModelID     string `gorm:"not null" json:"modelId"`
	WorkspaceID string `gorm:"not null" json:"workspaceId"`
	UserID      string `gorm:"not null" json:"userId"`

	CreatedAt time.Time `gorm:"type:timestamp;default:now()" json:"createdAt"`
	UpdatedAt time.Time `gorm:"type:timestamp;default:now()" json:"updatedAt"`
	DeletedAt time.Time `gorm:"index" json:"deletedAt"`
}
