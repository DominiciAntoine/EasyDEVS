package model

import (
	"time"

	"gorm.io/gorm"
)

// User struct
type User struct {
	ID        string         `gorm:"primaryKey;<-:false;default:uuid_generate_v4()"`
	Username  string         `gorm:"uniqueIndex;not null;size:50;" validate:"required,min=3,max=50" json:"username"`
	Email     string         `gorm:"uniqueIndex;not null;size:255;" validate:"required,email" json:"email"`
	Password  string         `gorm:"not null;" validate:"required,min=6,max=50" json:"password"`
	Fullname  string         `json:"fullname"`
	CreatedAt time.Time      `gorm:"type:timestamp;default:now()" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"type:timestamp;default:now()" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt"`
}
