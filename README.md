# POS System

A complete Point of Sale (POS) system built with Next.js (TypeScript) frontend and Go backend, featuring PostgreSQL database, JWT authentication, and Docker support.

## Features

- **Master Data Management**: Products, Categories, Users
- **Inventory Management**: Stock tracking and adjustments
- **Sales Processing**: Complete POS interface with cart and payment handling
- **Reports & Analytics**: Sales reports, top products, statistics dashboard
- **Authentication**: JWT-based authentication with role-based access (Admin/Cashier)
- **RESTful API**: Well-documented OpenAPI specification
- **Docker Support**: Complete Docker Compose setup for local development

## Technology Stack

### Backend
- **Go 1.21+** with Gin framework
- **PostgreSQL** database
- **sqlc** for type-safe database queries
- **pgx** PostgreSQL driver
- **JWT** for authentication
- **zap** for logging

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS** for styling
- **React Query** for data fetching
- **Recharts** for data visualization

## Project Structure

```
pos-system/
├── backend/
│   ├── cmd/pos-api/          # Application entry point
│   ├── internal/
│   │   ├── auth/             # Authentication service
│   │   ├── product/          # Product management
│   │   ├── inventory/        # Inventory management
│   │   ├── sale/             # Sales processing
│   │   ├── report/           # Reports and analytics
│   │   ├── db/               # Database layer (sqlc generated)
│   │   ├── server/            # HTTP server setup
│   │   └── config/            # Configuration
│   ├── migrations/           # SQL migrations
│   ├── db/queries/           # SQL queries for sqlc
│   └── Dockerfile
├── frontend/
│   ├── app/                  # Next.js app directory
│   │   ├── login/            # Login page
│   │   ├── pos/              # POS interface
│   │   ├── dashboard/        # Admin dashboard
│   │   ├── products/         # Product management
│   │   ├── inventory/        # Inventory management
│   │   └── reports/          # Reports page
│   ├── components/           # React components
│   ├── lib/                  # API clients and utilities
│   └── Dockerfile
├── docker-compose.yml
├── openapi.yaml              # API documentation
└── README.md
```

## Prerequisites

- **Docker** and **Docker Compose** (for easy setup)
- **Go 1.21+** (for local backend development)
- **Node.js 20+** (for local frontend development)
- **PostgreSQL 15+** (if running without Docker)
- **sqlc** (for generating database code)
- **golang-migrate** (for running migrations)

## Quick Start with Docker

1. **Clone the repository** (or navigate to the project directory)

2. **Start all services**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:8080
   - Database: localhost:5432

4. **Default credentials**:
   - Username: `admin` / Password: `admin123` (Admin role)
   - Username: `cashier` / Password: `admin123` (Cashier role)

## ⚠️ Windows Users

Jika Anda menggunakan Windows dan mendapat error `sqlc: command not found`, lihat file **`SOLUSI_WINDOWS.md`** untuk panduan instalasi lengkap.

## Local Development Setup

### Backend Setup

1. **Install dependencies**:
   ```bash
   cd backend
   go mod download
   ```

2. **Install sqlc** (if not installed):
   ```bash
   go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
   ```

3. **Install golang-migrate** (if not installed):
   ```bash
   go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
   ```

4. **Generate database code**:
   ```bash
   make sqlc
   # or manually:
   cd backend && sqlc generate
   ```

5. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

6. **Run migrations**:
   ```bash
   make migrate-up
   # or manually:
   migrate -path backend/migrations -database "postgres://user:pass@localhost:5432/pos_db?sslmode=disable" up
   ```

7. **Start the backend**:
   ```bash
   cd backend
   go run cmd/pos-api/main.go
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your API URL
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

## Database Migrations

The project uses SQL migrations located in `backend/migrations/`:

- `0001_init.sql` - Initial schema (users, products, categories, inventory, sales, sale_items)
- `0002_seed.sql` - Sample data (users, categories, products, inventory)

### Running Migrations

**With Docker**:
Migrations run automatically when the postgres container starts.

**Manually**:
```bash
# Up
migrate -path backend/migrations -database "postgres://user:pass@localhost:5432/pos_db?sslmode=disable" up

# Down
migrate -path backend/migrations -database "postgres://user:pass@localhost:5432/pos_db?sslmode=disable" down
```

## Generating Database Code (sqlc)

After modifying SQL queries in `backend/db/queries/`, regenerate the Go code:

```bash
make sqlc
# or
cd backend && sqlc generate
```

This will update files in `backend/internal/db/` with type-safe database access code.

## API Documentation

The API follows RESTful conventions and is documented using OpenAPI 3.0. The specification is available in `openapi.yaml`.

### Key Endpoints

- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/products` - List products
- `POST /api/v1/products` - Create product (Admin)
- `POST /api/v1/sales` - Create sale
- `GET /api/v1/reports/sales` - Sales report
- `GET /api/v1/reports/stats` - Sales statistics

All endpoints (except login) require a Bearer token in the Authorization header.

## Testing

### Backend Tests

```bash
cd backend
go test ./... -v
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Building for Production

### Backend

```bash
cd backend
CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o pos-api ./cmd/pos-api
```

### Frontend

```bash
cd frontend
npm run build
npm start
```

## Deployment

### Using Docker

1. **Build images**:
   ```bash
   docker-compose build
   ```

2. **Deploy with docker-compose**:
   ```bash
   docker-compose up -d
   ```

### Manual Deployment

#### Backend

1. Set environment variables
2. Run migrations
3. Build and run the binary:
   ```bash
   go build -o pos-api ./cmd/pos-api
   ./pos-api
   ```

#### Frontend

1. Build the Next.js app:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

### Cloud Deployment (Example: Railway/Render)

1. **Connect your repository** to Railway/Render
2. **Set environment variables** in the platform dashboard
3. **Configure build commands**:
   - Backend: `go build -o pos-api ./cmd/pos-api && ./pos-api`
   - Frontend: `npm install && npm run build && npm start`
4. **Set up PostgreSQL** database (managed service)
5. **Run migrations** (can be automated via startup script)

### Environment Variables

**Backend**:
```
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASS=your-db-password
DB_NAME=pos_db
JWT_SECRET=your-secret-key
SERVER_PORT=8080
SERVER_HOST=0.0.0.0
ENVIRONMENT=production
```

**Frontend**:
```
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

**Catatan Penting**: 
- Setelah deploy POS system, URL production akan diberikan oleh platform deployment (contoh: `https://pos-system.vercel.app` atau `https://pos-system.railway.app`)
- URL ini kemudian perlu di-set sebagai `NEXT_PUBLIC_POS_DEMO_URL` di portfolio untuk link demo
- Link demo di portfolio bisa diubah kapan saja melalui environment variable tanpa perlu mengubah kode

**Frontend**:
```
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

## CI/CD Setup (GitHub Actions)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v4
        with:
          go-version: '1.21'
      - name: Install sqlc
        run: go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
      - name: Generate sqlc code
        run: cd backend && sqlc generate
      - name: Run tests
        run: cd backend && go test ./... -v
```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check environment variables match your database configuration
- Verify network connectivity if using Docker

### sqlc Generation Errors

- Ensure all SQL queries in `backend/db/queries/` are valid
- Check `sqlc.yaml` configuration
- Run `sqlc generate` from the `backend` directory

### Frontend API Errors

- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings in backend
- Ensure backend is running and accessible

## Security Notes

- **Change default JWT_SECRET** in production
- **Use strong passwords** for database and admin users
- **Enable HTTPS** in production
- **Implement rate limiting** for API endpoints
- **Regularly update dependencies**

## License

This project is provided as-is for educational and commercial use.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

For issues and questions, please open an issue on the repository.

