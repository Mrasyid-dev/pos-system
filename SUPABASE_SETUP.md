# 🗄️ Setup Supabase untuk POS System

Panduan lengkap untuk setup database Supabase dengan custom schema.

---

## 📋 **Langkah-langkah Setup**

### **1. Buat Project di Supabase**

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Klik **"New Project"**
3. Isi detail project:
   - **Name**: POS System
   - **Database Password**: Simpan password ini dengan aman!
   - **Region**: Singapore (ap-southeast-1) - untuk latency terbaik
4. Tunggu hingga project selesai dibuat (~2 menit)

---

### **2. Buat Custom Schema**

1. Buka **SQL Editor** di Supabase Dashboard
2. Buat schema baru dengan nama `pos-system-db`:

```sql
-- Create custom schema for POS System
CREATE SCHEMA IF NOT EXISTS "pos-system-db";

-- Grant permissions
GRANT USAGE ON SCHEMA "pos-system-db" TO postgres;
GRANT ALL ON SCHEMA "pos-system-db" TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA "pos-system-db" TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA "pos-system-db" TO postgres;

-- Set default privileges untuk tables yang akan dibuat
ALTER DEFAULT PRIVILEGES IN SCHEMA "pos-system-db" 
GRANT ALL ON TABLES TO postgres;

ALTER DEFAULT PRIVILEGES IN SCHEMA "pos-system-db" 
GRANT ALL ON SEQUENCES TO postgres;
```

3. Klik **"Run"** untuk execute

---

### **3. Jalankan Migrations**

Copy semua migrations dari folder `backend/migrations/` dan jalankan di SQL Editor **sesuai urutan**:

#### **Migration 1: Initial Schema**

Copy dan paste isi dari file `backend/migrations/0001_init.sql` ke SQL Editor, lalu Run.

#### **Migration 2: Seed Data**

Copy dan paste isi dari file `backend/migrations/0002_seed.sql` ke SQL Editor, lalu Run.

#### **Migration 3: Fix Passwords**

Copy dan paste isi dari file `backend/migrations/0003_fix_passwords.sql` ke SQL Editor, lalu Run.

---

### **4. Verifikasi Setup**

Jalankan query berikut untuk memastikan semuanya berhasil:

```sql
-- 1. Cek schema sudah dibuat
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'pos-system-db';

-- 2. Cek tables sudah dibuat
SET search_path TO "pos-system-db", public;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'pos-system-db'
ORDER BY table_name;

-- Expected output: categories, inventory, products, sale_items, sales, users

-- 3. Cek jumlah data
SELECT 
    'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'inventory', COUNT(*) FROM inventory
UNION ALL
SELECT 'sales', COUNT(*) FROM sales;

-- Expected output:
-- users: 4
-- categories: 10
-- products: 105
-- inventory: 105
-- sales: 10
```

---

### **5. Dapatkan Connection String**

1. Buka **Settings → Database** di Supabase Dashboard
2. Scroll ke bagian **"Connection Pooling"**
3. Mode: **Transaction** (recommended untuk connection pooling)
4. Copy connection string yang terlihat seperti:
   ```
   postgres://postgres.xxxxx:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
   ```

5. Extract informasi berikut untuk Railway environment variables:
   ```bash
   DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
   DB_PORT=5432
   DB_USER=postgres.xxxxx
   DB_PASS=[YOUR-PASSWORD]
   DB_NAME=postgres
   DB_SCHEMA=pos-system-db
   ```

---

## 🧪 **Test Connection dari Local**

Update file `backend/.env` dengan credentials Supabase:

```bash
DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
DB_PORT=5432
DB_USER=postgres.xxxxx
DB_PASS=your_password_here
DB_NAME=postgres
DB_SCHEMA=pos-system-db
JWT_SECRET=test_jwt_secret
SERVER_PORT=8080
SERVER_HOST=0.0.0.0
ENVIRONMENT=production
```

Jalankan backend:

```bash
cd backend
go run cmd/pos-api/main.go
```

Test API:

```bash
# Health check
curl http://localhost:8080/healthz

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Jika berhasil login dan mendapat token JWT, berarti koneksi ke Supabase sukses! ✅

---

## 🔐 **Security Best Practices**

1. **Jangan commit .env** ke Git:
   ```bash
   # Pastikan .env ada di .gitignore
   echo "backend/.env" >> .gitignore
   ```

2. **Gunakan JWT secret yang kuat** untuk production:
   ```bash
   # Generate random JWT secret
   openssl rand -base64 32
   ```

3. **Rotate database password** secara berkala di Supabase Settings

4. **Enable Row Level Security (RLS)** jika diperlukan:
   ```sql
   ALTER TABLE "pos-system-db".users ENABLE ROW LEVEL SECURITY;
   -- Buat policies sesuai kebutuhan
   ```

---

## 🚨 **Troubleshooting**

### Error: "schema does not exist"

**Solusi**: Pastikan schema sudah dibuat dengan query di step 2

### Error: "permission denied for schema"

**Solusi**: Jalankan GRANT permissions dari query di step 2

### Error: "SSL required"

**Solusi**: Pastikan `ENVIRONMENT=production` di environment variables (otomatis akan gunakan sslmode=require)

### Error: "connection timeout"

**Solusi**: 
- Cek firewall/network
- Pastikan menggunakan Connection Pooling URL (bukan Direct Connection)
- Pastikan region Supabase dekat dengan server Railway

### Data seed tidak muncul

**Solusi**: 
- Pastikan migrations dijalankan dengan urutan yang benar (0001 → 0002 → 0003)
- Cek search_path sudah di-set dengan: `SHOW search_path;`
- Query data dengan: `SET search_path TO "pos-system-db", public; SELECT * FROM products;`

---

## 📊 **Monitoring**

Monitor database usage di Supabase Dashboard:
- **Database → Database Health**: CPU, Memory, Storage
- **Database → Query Performance**: Slow queries
- **Database → Pooler Configuration**: Connection pool settings

Free tier Supabase limits:
- Storage: 500 MB
- Database size: 500 MB
- API requests: Unlimited (dengan rate limiting)
- Bandwidth: 5 GB

---

## 🔄 **Backup & Restore**

### Backup via Supabase Dashboard

1. **Settings → Database → Backups**
2. Daily automatic backups (retained for 7 days)
3. Manual backup: Click **"Backup now"**

### Backup via CLI (Manual)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Backup specific schema
pg_dump "postgres://..." \
  --schema=pos-system-db \
  --file=backup.sql
```

### Restore

```bash
# Via psql
psql "postgres://..." < backup.sql

# Or via Supabase SQL Editor (paste backup.sql content)
```

---

## ✅ **Checklist Sebelum Deploy**

- [ ] Schema `pos-system-db` sudah dibuat
- [ ] Semua migrations berhasil dijalankan
- [ ] Verifikasi data seed (105 products, 10 categories, etc)
- [ ] Test connection dari local dengan Supabase credentials
- [ ] JWT secret sudah di-generate dengan aman
- [ ] .env tidak ter-commit ke Git
- [ ] Connection pooling sudah di-enable
- [ ] Backup otomatis sudah aktif

---

Setelah semua checklist terpenuhi, Anda siap untuk deploy ke Railway! 🚀
