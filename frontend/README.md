# POS System Frontend

Next.js 14 frontend for the POS system.

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your API URL
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## Project Structure

- `app/` - Next.js App Router pages
  - `login/` - Login page
  - `pos/` - POS interface
  - `dashboard/` - Admin dashboard
  - `products/` - Product management
  - `inventory/` - Inventory management
  - `reports/` - Reports page
- `components/` - Reusable React components
- `lib/` - API clients and utilities

## Features

- Responsive design with TailwindCSS
- Real-time data with React Query
- Charts and visualizations with Recharts
- Type-safe API clients

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8080)

