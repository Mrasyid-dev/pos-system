# Tahapan Pengembangan Sistem Kasir

**Proyek**: Pengembangan POS System menjadi Sistem Kasir Lengkap  
**Tim**: Developer (Anda) + AI Assistant (Auto)  
**Paket**: Minimum (4 fitur utama - tanpa Receipt Printing)  
**Estimasi Total**: 6-8 hari kerja

**Catatan**: Receipt Printing di-exclude karena keterbatasan device printer. Receipt Display tetap ada untuk review transaksi.

---

## 📋 OVERVIEW PEMBAGIAN KERJA

### AI Assistant (Auto) akan membantu:
- ✅ **Backend Development** (Go services, handlers, database queries)
- ✅ **Frontend Components** (React components, pages, API integration)
- ✅ **Database Migrations** (SQL schema changes)
- ✅ **API Integration** (Frontend-backend connection)
- ✅ **Code Review & Refactoring**

### Developer (Anda) akan:
- ✅ **Testing & QA** (Manual testing, edge cases)
- ✅ **Business Logic Review** (Validasi requirement)
- ✅ **Deployment** (Setup hosting, environment)
- ✅ **Hardware Integration** (Printer, scanner setup)
- ✅ **Final Review** (Acceptance testing)

---

## 🎯 TAHAPAN PENGEMBANGAN

### **TAHAP 1: Real-time Stock Check di Frontend** 
**Prioritas**: ⭐⭐⭐ (Paling mudah, foundation untuk fitur lain)  
**Estimasi**: 1 hari kerja  
**Kompleksitas**: Low

#### Tugas AI:
1. ✅ Update frontend POS page untuk fetch inventory data
2. ✅ Tampilkan stock quantity di product list
3. ✅ Warning indicator jika stock < threshold (misal < 10)
4. ✅ Disable add to cart jika stock = 0
5. ✅ Real-time update stock setelah sale

#### Tugas Developer:
- Test di berbagai skenario (stock habis, stock rendah, dll)
- Set threshold yang sesuai untuk bisnis

#### Deliverables:
- [ ] Product list menampilkan stock
- [ ] Warning visual jika stock rendah
- [ ] Cart tidak bisa add jika stock habis
- [ ] Stock update real-time setelah transaksi

#### Dependencies:
- Tidak ada (bisa mulai langsung)

---

### **TAHAP 2: Receipt Display/Review**
**Prioritas**: ⭐⭐⭐ (Mudah, user experience penting)  
**Estimasi**: 1-2 hari kerja  
**Kompleksitas**: Low

#### Tugas AI:
1. ✅ Buat receipt display component (modal/page)
2. ✅ Tampilkan detail transaksi setelah payment success
3. ✅ Format receipt dengan layout yang rapi
4. ✅ Include: invoice number, items, total, payment method, change
5. ✅ Optional: Button untuk print (untuk future jika ada device)

#### Tugas Developer:
- Review design receipt (sesuai kebutuhan bisnis)
- Test tampilan di berbagai ukuran layar

#### Deliverables:
- [ ] Receipt display modal/page
- [ ] Format receipt yang rapi dan readable
- [ ] Semua informasi transaksi ditampilkan
- [ ] Bisa di-screenshot atau copy untuk dokumentasi

#### Dependencies:
- Tidak ada (bisa mulai langsung)

**Catatan**: Receipt Printing di-exclude dari paket ini. Receipt Display tetap ada untuk review transaksi di layar. Printing bisa ditambahkan nanti jika sudah ada device printer.

---

### **TAHAP 3: Void/Cancel Sale**
**Prioritas**: ⭐⭐⭐⭐⭐ (Sangat penting untuk operasional)  
**Estimasi**: 2-3 hari kerja  
**Kompleksitas**: Medium

#### Subtahap 3A: Database Schema (0.5 hari)
**Tugas AI:**
1. ✅ Migration: tambah kolom `status` ke table `sales`
2. ✅ Migration: tambah kolom `voided_at`, `voided_by`, `void_reason`
3. ✅ Update model dan queries

**Tugas Developer:**
- Review schema changes

#### Subtahap 3B: Backend Void Service (1 hari)
**Tugas AI:**
1. ✅ Buat service `VoidSale()` di `sale/service.go`
2. ✅ Validasi: hanya sale hari ini yang bisa di-void (atau sesuai policy)
3. ✅ Return inventory otomatis (increase stock)
4. ✅ Audit log: simpan info siapa yang void, kapan, alasan
5. ✅ Endpoint `POST /api/v1/sales/:id/void` (Admin only)

**Tugas Developer:**
- Define business rules (kapan sale bisa di-void?)
- Test berbagai skenario

#### Subtahap 3C: Frontend Void UI (0.5-1 hari)
**Tugas AI:**
1. ✅ Button void di sales list/detail
2. ✅ Modal konfirmasi void dengan reason input
3. ✅ Update UI setelah void (tampilkan status)
4. ✅ Restrict void hanya untuk Admin

**Tugas Developer:**
- Test flow void
- Review UX

#### Deliverables:
- [ ] Database schema untuk void
- [ ] Backend void service dengan return stock
- [ ] Frontend void UI dengan confirmation
- [ ] Audit log untuk void
- [ ] Permission check (Admin only)

#### Dependencies:
- Tidak ada (bisa mulai setelah tahap 1)

---

### **TAHAP 4: Shift Management**
**Prioritas**: ⭐⭐⭐⭐⭐ (Sangat penting untuk akuntansi)  
**Estimasi**: 3-4 hari kerja  
**Kompleksitas**: Medium

#### Subtahap 4A: Database Schema (0.5 hari)
**Tugas AI:**
1. ✅ Migration: buat table `shifts`
   - id, user_id, opened_at, closed_at
   - opening_cash, closing_cash, expected_cash, difference
   - status (open/closed)
2. ✅ Migration: tambah `shift_id` ke table `sales` (optional, untuk tracking)

**Tugas Developer:**
- Review schema

#### Subtahap 4B: Backend Shift Service (1.5 hari)
**Tugas AI:**
1. ✅ Service: `OpenShift()` - buka shift baru
2. ✅ Service: `CloseShift()` - tutup shift dengan closing cash
3. ✅ Service: `GetCurrentShift()` - get shift yang sedang aktif
4. ✅ Service: `GetShiftReport()` - laporan shift (total sales, cash, dll)
5. ✅ Validasi: hanya 1 shift aktif per user
6. ✅ Endpoints:
   - `POST /api/v1/shifts/open`
   - `POST /api/v1/shifts/:id/close`
   - `GET /api/v1/shifts/current`
   - `GET /api/v1/shifts/:id/report`

**Tugas Developer:**
- Define business rules (buka/tutup shift policy)
- Test calculation

#### Subtahap 4C: Frontend Shift UI (1 hari)
**Tugas AI:**
1. ✅ Shift status indicator di navbar
2. ✅ Modal buka shift (input opening cash)
3. ✅ Modal tutup shift (input closing cash, tampilkan report)
4. ✅ Shift report page (list semua shift)
5. ✅ Validasi: tidak bisa buat sale jika shift belum dibuka

**Tugas Developer:**
- Test flow buka/tutup shift
- Review report format

#### Deliverables:
- [ ] Database schema untuk shifts
- [ ] Backend shift service (open/close/report)
- [ ] Frontend shift management UI
- [ ] Shift report dengan detail
- [ ] Validasi shift sebelum sale

#### Dependencies:
- Tidak ada (bisa mulai setelah tahap 1)

---

## 📅 JADWAL PENGEMBANGAN (Saran)

### Week 1: Foundation & Core Features
- **Day 1-2**: Tahap 1 (Real-time Stock Check) + Tahap 2 (Receipt Display)
- **Day 3-5**: Tahap 3 (Void/Cancel Sale)
- **Day 6-7**: Testing & Review Week 1

### Week 2: Shift Management & Polish
- **Day 8-10**: Tahap 4 (Shift Management)
- **Day 11-12**: Integration testing semua fitur
- **Day 13**: Bug fixes & optimization
- **Day 14**: Final review & deployment prep

**Catatan**: Jadwal lebih cepat karena tidak termasuk Receipt Printing. Jika nanti perlu tambah Receipt Printing, estimasi +3-5 hari kerja.

---

## 🔄 WORKFLOW SETIAP TAHAP

### Untuk Setiap Tahap:

1. **Planning** (Developer + AI)
   - Diskusi requirement detail
   - Review dependencies
   - Set acceptance criteria

2. **Development** (AI)
   - AI buat code sesuai spec
   - AI buat migration jika perlu
   - AI update documentation

3. **Code Review** (Developer)
   - Review code yang dibuat AI
   - Test di local environment
   - Berikan feedback

4. **Iteration** (AI + Developer)
   - AI fix berdasarkan feedback
   - Developer test lagi
   - Repeat sampai OK

5. **Integration** (Developer + AI)
   - Merge ke main branch
   - Integration test dengan fitur lain
   - AI help fix integration issues

6. **Testing** (Developer)
   - Manual testing
   - Edge case testing
   - User acceptance testing

---

## 🛠️ TEKNIS PENGEMBANGAN

### Backend (Go):
- **Pattern**: Service → Handler → Database Query
- **Testing**: Unit test untuk service layer
- **Migration**: Gunakan `golang-migrate`
- **Code Generation**: `sqlc generate` setelah update queries

### Frontend (Next.js):
- **Pattern**: Page → Component → API Client
- **State Management**: React Query untuk server state
- **Styling**: TailwindCSS (konsisten dengan existing)
- **Testing**: Manual testing di browser

### Database:
- **Migrations**: Semua perubahan via migration files
- **Naming**: `XXXX_description.sql` (sequential)
- **Backup**: Backup database sebelum migration

---

## 📝 CHECKLIST SETIAP TAHAP

### Pre-Development:
- [ ] Requirement jelas dan documented
- [ ] Dependencies sudah selesai
- [ ] Database backup dibuat
- [ ] Branch baru dibuat

### Development:
- [ ] Code sesuai dengan existing pattern
- [ ] Error handling ada
- [ ] Validation ada
- [ ] Comments untuk complex logic

### Post-Development:
- [ ] Code reviewed
- [ ] Tested di local
- [ ] Migration tested (up & down)
- [ ] Documentation updated
- [ ] Integration tested dengan fitur lain

---

## 🚨 CATATAN PENTING

### Untuk AI (Auto):
- **Jangan** buat perubahan besar sekaligus
- **Selalu** buat migration untuk schema changes
- **Selalu** test di local sebelum commit
- **Ikuti** existing code pattern
- **Tanya** jika requirement tidak jelas

### Untuk Developer:
- **Review** setiap code yang dibuat AI
- **Test** setiap fitur sebelum lanjut
- **Backup** database sebelum migration
- **Document** business rules yang penting
- **Komunikasi** jika ada perubahan requirement

---

## 📦 DELIVERABLES FINAL

Setelah semua tahap selesai, harus ada:

### Backend:
- [ ] Semua endpoints baru
- [ ] Database migrations
- [ ] Updated API documentation (openapi.yaml)
- [ ] Service layer untuk semua fitur

### Frontend:
- [ ] Semua UI components
- [ ] Updated API clients
- [ ] Receipt display working (tanpa printing)
- [ ] Shift management working
- [ ] Void sale working

### Documentation:
- [ ] User manual (cara pakai fitur baru)
- [ ] Technical documentation (untuk maintenance)
- [ ] Deployment guide (jika ada perubahan)

### Testing:
- [ ] All features tested
- [ ] Integration tested
- [ ] Edge cases handled
- [ ] Performance acceptable

---

## 🎯 NEXT STEPS

1. **Review dokumen ini** - Pastikan semua tahapan masuk akal
2. **Prioritize** - Tentukan urutan yang paling penting untuk bisnis
3. **Start Tahap 1** - Mulai dengan yang paling mudah
4. **Iterate** - Setiap tahap selesai, review dan lanjut ke berikutnya

---

**Dokumen ini akan di-update seiring progress pengembangan.**  
**Update terakhir: 27 Januari 2025**

