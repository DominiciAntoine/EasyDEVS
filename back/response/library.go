package response

import (
	"time"

	"github.com/google/uuid"
)

// LibraryResponse struct
type LibraryResponse struct {
	ID          uuid.UUID `json:"id" validate:"required"`
	Title       string    `json:"title" validate:"required"`
	Description string    `json:"description" validate:"required"`
	CreatedAt   time.Time `json:"createdAt" validate:"required"`
	UpdatedAt   time.Time `json:"updatedAt" validate:"required"`
	DeletedAt   time.Time `json:"deletedAt" validate:"required"`
}
