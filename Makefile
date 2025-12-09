.PHONY: help dev migrate-up migrate-down sqlc test clean

help:
	@echo "Available commands:"
	@echo "  make dev          - Start all services with docker-compose"
	@echo "  make migrate-up   - Run database migrations"
	@echo "  make migrate-down - Rollback database migrations"
	@echo "  make sqlc         - Generate sqlc code"
	@echo "  make test         - Run tests"
	@echo "  make clean        - Clean generated files"

dev:
	docker-compose up --build

migrate-up:
	@echo "Running migrations..."
	@cd backend && migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/pos_db?sslmode=disable" up

migrate-down:
	@echo "Rolling back migrations..."
	@cd backend && migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/pos_db?sslmode=disable" down

sqlc:
	@echo "Generating sqlc code..."
	@cd backend && sqlc generate

test:
	@echo "Running tests..."
	@cd backend && go test ./... -v

clean:
	@echo "Cleaning generated files..."
	@rm -rf backend/internal/db/*.go
	@rm -rf frontend/.next
	@rm -rf frontend/node_modules

