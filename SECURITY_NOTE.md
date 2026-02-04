# 🔒 Security Notes

## ⚠️ IMPORTANT: Credentials Protection

### Files yang TIDAK BOLEH di-commit:

1. **Backend `.env` file**
   - Path: `backend/.env`
   - Contains: Supabase credentials, JWT secret
   - Status: ✅ Already in .gitignore

2. **Frontend `.env.local` file**
   - Path: `frontend/.env.local`
   - Contains: API URL
   - Status: ✅ Already in .gitignore

3. **Test files with credentials**
   - Pattern: `test*.go`, `generate*.go`, `DEBUG*.sql`, `VERIFY*.sql`
   - Status: ✅ Cleaned and added to .gitignore

### ✅ Safe to Commit:

- `.env.example` files (template without real credentials)
- `ENV_TEMPLATE.md` (documentation)
- Migration files (no credentials)
- Source code files

### 🔑 Environment Variables for Production:

Set these in Railway/Vercel dashboard (NEVER in git):

```bash
# Backend (Railway)
DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
DB_PORT=5432
DB_USER=postgres.xxxxx
DB_PASS=your_password_here
DB_NAME=postgres
DB_SCHEMA=pos-system-db
JWT_SECRET=your_secure_jwt_secret
SERVER_PORT=8080
SERVER_HOST=0.0.0.0
ENVIRONMENT=production

# Frontend (Vercel)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### 📋 Before Pushing to Git:

Run this checklist:

```bash
# 1. Check for exposed credentials
git status

# 2. Verify .env not tracked
git ls-files | grep -E '\.env$|\.env\.local$'
# Should return nothing

# 3. Check .gitignore is working
git check-ignore backend/.env
# Should output: backend/.env

# 4. If accidentally committed, remove from history:
# git filter-branch --index-filter 'git rm --cached --ignore-unmatch backend/.env' HEAD
# Or use: git-filter-repo (recommended)
```

### 🚨 If Credentials Leaked:

1. **Immediately rotate** all credentials:
   - Change Supabase password
   - Generate new JWT secret
   - Update environment variables in Railway/Vercel

2. **Remove from git history**:
   ```bash
   # Use BFG Repo-Cleaner or git-filter-repo
   # Never use force push to shared branches
   ```

3. **Audit access**:
   - Check Supabase logs for unauthorized access
   - Review Railway/Vercel deployment logs

---

**Last Updated**: 2026-02-04
**Status**: ✅ All credentials protected
