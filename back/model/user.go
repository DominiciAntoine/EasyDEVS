package model

import (
	"time"
)

// User struct
type User struct {
	ID           string    `gorm:"primaryKey;<-:false;default:uuid_generate_v4()"`
	Username     string    `gorm:"uniqueIndex;not null;size:50;" validate:"required,min=3,max=50" json:"username"`
	Email        string    `gorm:"uniqueIndex;not null;size:255;" validate:"required,email" json:"email"`
	Password     string    `gorm:"not null;" validate:"required,min=6,max=50" json:"password"`
	Fullname     string    `json:"fullname"`
	RefreshToken string    `gorm:"size:255;" json:"refresh_token"`
	CreatedAt    time.Time `gorm:"type:timestamp;default:now()" json:"createdAt"`
	UpdatedAt    time.Time `gorm:"type:timestamp;default:now()" json:"updatedAt"`
	DeletedAt    time.Time `gorm:"index" json:"deletedAt"`
}
