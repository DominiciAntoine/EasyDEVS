package request

type RefreshRequest struct {
	RefreshToken string `json:"refreshToken"`
}

type RegisterRequest struct {
	Username string `json:"username" validate:"required,min=3,max=50"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6,max=50"`
}

type LogoutRequest struct {
	RefreshToken string `json:"refreshToken"`
}

type LoginRequest struct {
	Identity string `json:"identity"`
	Password string `json:"password"`
}
