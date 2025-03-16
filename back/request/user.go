package request

type UpdateUserRequest struct {
	Names string `json:"names"`
}

type PasswordRequest struct {
	Password string `json:"password"`
}
