package database_test

import (
	"app/database"
	"testing"
)

func TestConnectDB(t *testing.T) {
	tests := []struct {
		name string // description of this test case
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			database.ConnectDB()
		})
	}
}
