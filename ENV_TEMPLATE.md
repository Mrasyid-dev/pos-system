# 🔧 Environment Variables Template

Template untuk konfigurasi environment variables POS System.

---

## 📝 **Local Development (Docker)**

Buat file `backend/.env` dengan isi:

```bash
# Database Configuration (Docker)
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASS=postgres
DB_NAME=pos_db
DB_SCHEMA=pos-system-db

# Server Configuration
SERVER_PORT=8080
SERVER_HOST=0.0.0.0

# JWT Secret
JWT_SECRET=change_this_secret_key_in_production

# Environment
ENVIRONMENT=development
```

---

## 🚀 **Production - Railway Backend**

Environment variables untuk Railway:

```bash
# Database Configuration (Supabase Connection Pooler)
DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
DB_PORT=5432
DB_USER=postgres.ngixppucezcjmkrpufor
DB_PASS=your_supabase_password_here
DB_NAME=postgres
DB_SCHEMA=pos-system-db

# Server Configuration
SERVER_PORT=8080
SERVER_HOST=0.0.0.0

# JWT Secret (Generate: openssl rand -base64 32)
JWT_SECRET=pos_system_secure_jwt_secret_key_2026_production

# Environment
ENVIRONMENT=production
```

---

## 🌐 **Production - Vercel Frontend**

Environment variables untuk Vercel:

```bash
# API URL (ganti dengan Railway URL Anda)
NEXT_PUBLIC_API_URL=https://your-app-name.railway.app
```

---

## 🧪 **Test dengan Supabase dari Local**

Untuk test koneksi ke Supabase dari local, buat file `backend/.env`:

```bash
# Database Configuration (Supabase)
DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
DB_PORT=5432
DB_USER=postgres.xxxxx
DB_PASS=your_password_here
DB_NAME=postgres
DB_SCHEMA=pos-system-db

# Server Configuration
SERVER_PORT=8080
SERVER_HOST=0.0.0.0

# JWT Secret
JWT_SECRET=test_jwt_secret

# Environment (production untuk enable SSL)
ENVIRONMENT=production
```

Jalankan:

```bash
cd backend
go run cmd/pos-api/main.go
```

---

## 📋 **Cara Mendapatkan Supabase Credentials**

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Buka **Settings → Database**
4. Scroll ke **Connection Pooling** (pilih mode: Transaction)
5. Connection string format:
   ```
   postgres://[DB_USER]:[DB_PASS]@[DB_HOST]:[DB_PORT]/[DB_NAME]
   ```

Extract ke environment variables:
- `DB_HOST`: Bagian setelah `@` sampai sebelum `:`
- `DB_PORT`: Angka setelah `:` terakhir sebelum `/`
- `DB_USER`: Bagian setelah `//` sampai sebelum `:`
- `DB_PASS`: Bagian setelah `:` pertama sampai sebelum `@`
- `DB_NAME`: Bagian setelah `/` terakhir
- `DB_SCHEMA`: `pos-system-db` (custom schema yang kita buat)

---

## 🔐 **Generate JWT Secret yang Aman**

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Online
https://generate-secret.vercel.app/32
```

---

## ⚠️ **Important Notes**

1. **Jangan commit file .env** ke Git:
   ```bash
   # Pastikan ada di .gitignore
   backend/.env
   frontend/.env.local
   ```

2. **DB_SCHEMA harus sama** dengan schema yang dibuat di Supabase

3. **ENVIRONMENT=production** akan otomatis enable `sslmode=require` (required untuk Supabase)

4. **Railway** akan auto-escape special characters di password, gunakan plain text

5. **Vercel** environment variables bisa diset via dashboard atau CLI:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   ```

---

## 🧪 **Test Koneksi**

### Test Backend API:

```bash
# Health check
curl http://localhost:8080/healthz

# Login test
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Test Frontend:

```bash
# Buka di browser
http://localhost:3001

# Login dengan:
# Username: admin
# Password: admin123
```

---

## 📚 **Resources**

- [Supabase Database Settings](https://supabase.com/dashboard/project/_/settings/database)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Go PostgreSQL Driver](https://github.com/jackc/pgx)

---

Selamat mengkonfigurasi! 🎉
