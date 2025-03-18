package response

type RegisterResponse struct {
	AccessToken  string       `json:"accessToken"`
	RefreshToken string       `json:"refreshToken"`
	User         UserResponse `json:"user"`
}

type LoginResponse struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	Username     string `json:"username"`
	Email        string `json:"email"`
}

type RefreshResponse struct {
	AccessToken string `json:"accessToken"`
}
