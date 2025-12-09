# POS System Backend

Go backend for the POS system using Gin, PostgreSQL, and sqlc.

## Quick Start

1. **Generate database code** (required before first run):
   ```bash
   sqlc generate
   ```

2. **Install dependencies**:
   ```bash
   go mod download
   ```

3. **Set up environment**:
   ```bash
   cp ../.env.example .env
   # Edit .env with your database credentials
   ```

4. **Run migrations**:
   ```bash
   migrate -path migrations -database "postgres://user:pass@localhost:5432/pos_db?sslmode=disable" up
   ```

5. **Run the server**:
   ```bash
   go run cmd/pos-api/main.go
   ```

## Project Structure

- `cmd/pos-api/` - Application entry point
- `internal/` - Internal packages
  - `auth/` - Authentication and authorization
  - `product/` - Product management
  - `inventory/` - Inventory management
  - `sale/` - Sales processing
  - `report/` - Reports and analytics
  - `db/` - Database layer (sqlc generated)
  - `server/` - HTTP server setup
  - `config/` - Configuration management
- `migrations/` - SQL migrations
- `db/queries/` - SQL queries for sqlc

## Database Code Generation

After modifying SQL queries in `db/queries/`, regenerate the code:

```bash
sqlc generate
```

This updates files in `internal/db/` with type-safe database access.

## Testing

Run tests:
```bash
go test ./... -v
```

## Building

Build for production:
```bash
CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o pos-api ./cmd/pos-api
```

