# Workflow Coding dengan AI Assistant

**Tujuan**: Panduan praktis untuk kolaborasi Developer + AI dalam pengembangan fitur

---

## 🎯 PRINSIP DASAR

### Kenapa Tidak Bisa Sekali Prompt?
1. **Kompleksitas**: Setiap fitur punya banyak komponen (backend, frontend, database)
2. **Dependencies**: Fitur saling terkait, perlu test integration
3. **Review Cycle**: Perlu review & feedback dari developer
4. **Error Handling**: Perlu iterasi untuk handle edge cases
5. **Testing**: Perlu test setiap komponen sebelum lanjut

### Strategi: **Incremental Development**
- Satu komponen per prompt session
- Test → Review → Fix → Lanjut
- Build dari yang kecil ke besar

---

## 📋 STRUKTUR PROMPT UNTUK AI

### Template Prompt untuk Setiap Subtahap:

```
Saya ingin mengembangkan [NAMA_FITUR] - [SUBTASUK].

Context:
- Ini bagian dari pengembangan sistem kasir
- Repository: pos-system
- Tech stack: Go backend, Next.js frontend, PostgreSQL

Requirement:
1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]

Acceptance Criteria:
- [ ] [Criteria 1]
- [ ] [Criteria 2]

Dependencies:
- [Fitur/komponen yang sudah ada]

Mohon buatkan:
1. Code untuk [komponen spesifik]
2. Migration jika perlu
3. Update documentation

Setelah selesai, tolong jelaskan:
- Apa yang sudah dibuat
- Bagaimana cara test
- Apa yang perlu di-review
```

---

## 🔄 WORKFLOW DETAIL PER TAHAP

### **TAHAP 1: Real-time Stock Check**

#### Prompt 1: Backend - Update Inventory Query
```
Saya ingin menambahkan real-time stock check di POS.

Requirement:
- Saat list produk di POS, tampilkan stock quantity
- Stock harus real-time (fetch dari inventory table)
- Jika stock = 0, produk tidak bisa ditambahkan ke cart

Mohon:
1. Update query untuk get products dengan inventory
2. Pastikan query efisien (tidak N+1 problem)
3. Update ProductResponse untuk include stock_qty
```

**Expected Output:**
- Updated SQL query di `db/queries/products.sql`
- Updated Go model/response
- Run `sqlc generate` command

**Review Points:**
- Query efisien? (JOIN vs separate query)
- Response structure OK?

---

#### Prompt 2: Frontend - Display Stock di POS
```
Saya ingin menampilkan stock quantity di POS page.

Requirement:
- Tampilkan stock di setiap product card
- Warning indicator jika stock < 10 (badge merah/kuning)
- Disable button "Add to Cart" jika stock = 0
- Update stock real-time setelah sale (invalidate query)

Mohon:
1. Update POS page untuk fetch stock
2. Tambah visual indicator untuk low stock
3. Disable add to cart jika stock habis
4. Update React Query untuk refresh setelah sale
```

**Expected Output:**
- Updated `frontend/app/pos/page.tsx`
- Stock display di product cards
- Disable logic untuk stock = 0
- Query invalidation setelah sale

**Review Points:**
- UI/UX OK?
- Performance? (tidak terlalu banyak re-render)
- Edge cases handled?

---

### **TAHAP 2: Receipt Display/Review**

#### Prompt 1: Receipt Component
```
Saya ingin membuat receipt display component.

Requirement:
- Tampilkan detail transaksi setelah payment success
- Format: Invoice number, date, items, total, payment method, change
- Layout rapi dan readable
- Modal atau dedicated page
- Bisa di-screenshot untuk dokumentasi (tidak perlu print)

Mohon:
1. Buat ReceiptDisplay component
2. Format data dari sale response
3. Styling dengan TailwindCSS (konsisten dengan existing)
4. Integrate ke POS page (show setelah sale success)
5. Optional: Button untuk copy/screenshot (untuk dokumentasi)
```

**Expected Output:**
- New component: `frontend/components/ReceiptDisplay.tsx`
- Updated POS page untuk show receipt
- Styling yang rapi
- Tidak perlu print functionality

**Review Points:**
- Design sesuai kebutuhan?
- Semua info ditampilkan?
- Responsive?
- Bisa di-screenshot dengan baik?

**Catatan**: Receipt Printing di-exclude dari paket ini. Receipt Display tetap ada untuk review transaksi di layar. Printing bisa ditambahkan nanti jika sudah ada device printer.

---

### **TAHAP 3: Void/Cancel Sale**

#### Prompt 1: Database Migration
```
Saya ingin menambahkan fitur void sale.

Requirement:
- Tambah kolom status, voided_at, voided_by, void_reason ke table sales
- Status: 'completed' atau 'voided'

Mohon:
1. Buat migration file
2. Update model
3. Run sqlc generate
```

**Expected Output:**
- Migration file
- Updated models

---

#### Prompt 2: Backend Void Service
```
Saya ingin membuat service untuk void sale.

Requirement:
- Void sale akan return stock otomatis
- Hanya sale hari ini yang bisa di-void (atau sesuai policy)
- Simpan audit log (siapa, kapan, alasan)
- Endpoint: POST /api/v1/sales/:id/void (Admin only)

Mohon:
1. Buat VoidSale method di sale/service.go
2. Business logic: return stock, update status
3. Handler untuk void endpoint
4. Permission check (Admin only)
```

**Expected Output:**
- Updated sale service
- New handler method
- Updated routes dengan permission

---

#### Prompt 3: Frontend Void UI
```
Saya ingin membuat UI untuk void sale.

Requirement:
- Button void di sales list/detail
- Modal konfirmasi dengan reason input
- Update UI setelah void (tampilkan status)
- Hanya Admin yang bisa void

Mohon:
1. Update sales list/detail page
2. Void confirmation modal
3. API client untuk void endpoint
4. Permission check di frontend
```

**Expected Output:**
- Updated sales pages
- Void modal component
- API integration

---

### **TAHAP 4: Shift Management**

#### Prompt 1: Database Schema
```
Saya ingin membuat shift management.

Requirement:
- Table shifts: id, user_id, opened_at, closed_at, opening_cash, closing_cash, status
- Optional: shift_id di table sales untuk tracking

Mohon:
1. Buat migration untuk table shifts
2. Update sales table jika perlu
3. Run sqlc generate
```

**Expected Output:**
- Migration file
- Updated models

---

#### Prompt 2: Backend Shift Service
```
Saya ingin membuat shift service.

Requirement:
- OpenShift(): buka shift baru dengan opening cash
- CloseShift(): tutup shift dengan closing cash, hitung difference
- GetCurrentShift(): get shift aktif user
- GetShiftReport(): laporan shift (total sales, cash, dll)
- Validasi: hanya 1 shift aktif per user

Mohon:
1. Buat shift service
2. Business logic untuk open/close
3. Calculation untuk shift report
4. Handlers untuk semua endpoints
```

**Expected Output:**
- New shift service
- All handlers
- Updated routes

---

#### Prompt 3: Frontend Shift UI
```
Saya ingin membuat UI untuk shift management.

Requirement:
- Shift status indicator di navbar
- Modal buka shift (input opening cash)
- Modal tutup shift (input closing cash, show report)
- Shift report page
- Validasi: tidak bisa sale jika shift belum dibuka

Mohon:
1. Shift status component
2. Open/close shift modals
3. Shift report page
4. Integration dengan POS (check shift sebelum sale)
```

**Expected Output:**
- Shift components
- Shift pages
- Integration dengan POS

---

## 🛠️ BEST PRACTICES

### Untuk Developer (Saat Memberi Prompt):

1. **Be Specific**
   - ❌ "Buat fitur void"
   - ✅ "Buat service void sale dengan return stock dan audit log"

2. **Provide Context**
   - Mention file yang relevan
   - Sebutkan pattern yang sudah ada
   - Kasih contoh jika perlu

3. **Set Acceptance Criteria**
   - Checklist jelas
   - Expected behavior
   - Edge cases yang perlu dihandle

4. **Review Before Next Prompt**
   - Test code yang dibuat AI
   - Berikan feedback
   - Fix issues sebelum lanjut

### Untuk AI (Saat Membuat Code):

1. **Follow Existing Patterns**
   - Lihat code yang sudah ada
   - Ikuti struktur yang sama
   - Konsisten dengan naming convention

2. **Make It Testable**
   - Code yang mudah di-test
   - Error handling yang jelas
   - Logging untuk debugging

3. **Document Changes**
   - Comment untuk complex logic
   - Update README jika perlu
   - Changelog untuk migration

4. **Ask If Unsure**
   - Tanya jika requirement tidak jelas
   - Suggest alternatives jika ada
   - Highlight potential issues

---

## 🔍 TESTING CHECKLIST

Setelah AI membuat code, Developer harus test:

### Backend:
- [ ] Endpoint bisa diakses
- [ ] Request/response format benar
- [ ] Error handling bekerja
- [ ] Permission check bekerja
- [ ] Database changes benar

### Frontend:
- [ ] UI render dengan benar
- [ ] User interaction bekerja
- [ ] API call berhasil
- [ ] Error handling di UI
- [ ] Responsive design OK

### Integration:
- [ ] Frontend-backend connected
- [ ] Data flow benar
- [ ] Real-time update bekerja
- [ ] Tidak ada breaking changes

---

## 🚨 TROUBLESHOOTING

### Jika AI Buat Code yang Tidak Sesuai:

1. **Berikan Feedback Spesifik**
   - "Code ini tidak handle error X"
   - "Perlu tambah validation untuk Y"
   - "Format response harus seperti Z"

2. **Kasih Contoh**
   - "Seperti di file X, line Y"
   - "Ikuti pattern dari component Z"

3. **Request Fix**
   - "Tolong fix issue X"
   - "Update code untuk handle Y"
   - "Refactor untuk lebih clean"

### Jika Ada Breaking Changes:

1. **Rollback**
   - Git revert
   - Restore database backup

2. **Fix Incrementally**
   - Fix satu issue per prompt
   - Test setelah setiap fix

3. **Document**
   - Catat apa yang berubah
   - Update documentation

---

## 📝 TEMPLATE PROMPT STANDAR

Copy-paste template ini dan isi sesuai kebutuhan:

```
[NAMA_TAHAP] - [SUBTASUK]

Context:
- Repository: pos-system
- Tech: Go backend, Next.js frontend, PostgreSQL
- Pattern: [sebutkan pattern yang relevan]

Requirement:
1. [Detail requirement 1]
2. [Detail requirement 2]

Files yang relevan:
- [file1] - [penjelasan]
- [file2] - [penjelasan]

Acceptance Criteria:
- [ ] [Criteria 1]
- [ ] [Criteria 2]

Mohon buatkan:
1. [Apa yang perlu dibuat]
2. [Migration jika perlu]
3. [Update documentation]

Setelah selesai:
- Jelaskan apa yang dibuat
- Cara test
- Yang perlu di-review
```

---

## 🎯 CONTOH PROMPT LENGKAP

```
TAHAP 4: Void/Cancel Sale - Backend Service

Context:
- Repository: pos-system
- Tech: Go backend dengan Gin, PostgreSQL
- Pattern: Service → Handler → Database Query (seperti di sale/service.go)

Requirement:
1. Buat method VoidSale() di sale/service.go
2. Void sale harus return stock otomatis (increase inventory)
3. Hanya sale hari ini yang bisa di-void (created_at = today)
4. Simpan audit log: voided_at, voided_by (user_id), void_reason
5. Update status sale menjadi 'voided'
6. Endpoint: POST /api/v1/sales/:id/void (Admin only)

Files yang relevan:
- backend/internal/sale/service.go - existing sale service
- backend/internal/sale/handler.go - existing handlers
- backend/internal/inventory/service.go - untuk return stock
- backend/internal/auth/middleware.go - untuk Admin check

Acceptance Criteria:
- [ ] Void sale berhasil update status
- [ ] Stock kembali ke inventory
- [ ] Audit log tersimpan
- [ ] Hanya Admin yang bisa void
- [ ] Error handling untuk sale tidak ditemukan
- [ ] Error handling untuk sale sudah di-void

Mohon buatkan:
1. VoidSale() method di service
2. Handler untuk void endpoint
3. Update routes dengan permission check
4. Update openapi.yaml

Setelah selesai:
- Jelaskan flow void sale
- Cara test (curl command atau Postman)
- Yang perlu di-review (business logic, error handling)
```

---

**Dokumen ini akan di-update berdasarkan pengalaman development.**  
**Update terakhir: 27 Januari 2025**

