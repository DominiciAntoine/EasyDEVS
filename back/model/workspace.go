package model

import (
	"time"

	"gorm.io/gorm"
)

// Workspace struct
type Workspace struct {
	ID          string         `gorm:"primaryKey;<-:false;default:uuid_generate_v4()"`
	Title       string         `gorm:"not null" json:"title"`
	Description string         `gorm:"not null" json:"description"`
	CreatedAt   time.Time      `gorm:"type:timestamp;default:now()" json:"createdAt"`
	UpdatedAt   time.Time      `gorm:"type:timestamp;default:now()" json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deletedAt"`
}
