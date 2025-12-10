# Panduan Membuat Template Excel untuk Report

## Overview

Template Excel memungkinkan Anda untuk membuat desain report sesuai kebutuhan dengan border, styling, dan layout yang bisa disesuaikan. Data akan otomatis terisi ke template saat export.

## 🚀 Quick Start - Download Template

**Cara Termudah**: Download template yang sudah disiapkan!

1. Buka halaman Reports di aplikasi
2. Klik tombol **"Export Excel"**
3. Di modal, klik tombol **"Download Template"**
4. Template Excel akan terdownload dengan nama `report-template.xlsx`
5. Buka file tersebut di Excel dan edit sesuai kebutuhan
6. Simpan template Anda
7. Upload kembali template yang sudah diedit saat export

Template yang didownload sudah memiliki:
- ✅ Semua placeholder yang diperlukan
- ✅ Border pada semua tabel
- ✅ Styling header dan summary
- ✅ Format currency untuk revenue
- ✅ Layout yang rapi dan profesional

## Cara Membuat Template

### 1. Buat File Excel Baru

1. Buka Microsoft Excel atau Google Sheets
2. Buat file baru dengan nama `report-template.xlsx`
3. Simpan di lokasi yang mudah diakses

### 2. Struktur Template

Template harus memiliki **placeholder** yang akan diganti dengan data saat export. Berikut adalah placeholder yang tersedia:

#### Header Placeholders

| Placeholder | Deskripsi | Contoh Output |
|------------|-----------|---------------|
| `{{COMPANY_NAME}}` | Nama perusahaan | POS System |
| `{{CUSTOM_HEADER}}` | Header custom (opsional) | Internal Use Only |
| `{{REPORT_TITLE}}` | Judul report | Combined Sales Report |
| `{{PERIOD_FROM}}` | Tanggal mulai | 2025-11-09 |
| `{{PERIOD_TO}}` | Tanggal akhir | 2025-12-09 |
| `{{GENERATED_AT}}` | Waktu generate | 12/9/2025, 10:30:00 AM |

#### Data Placeholders

| Placeholder | Deskripsi | Lokasi |
|------------|-----------|--------|
| `{{SALES_START_ROW}}` | Marker untuk mulai insert data sales | Di baris kosong sebelum data sales |
| `{{PRODUCTS_START_ROW}}` | Marker untuk mulai insert data products | Di baris kosong sebelum data products |

#### Summary Placeholders

| Placeholder | Deskripsi | Contoh Output |
|------------|-----------|---------------|
| `{{TOTAL_TRANSACTIONS}}` | Total transaksi | 10 |
| `{{TOTAL_REVENUE}}` | Total revenue sales | $660.00 |
| `{{TOTAL_QUANTITY_SOLD}}` | Total quantity produk terjual | 20 |
| `{{TOTAL_PRODUCTS_REVENUE}}` | Total revenue produk | $660.00 |

### 3. Contoh Template Layout

```
┌─────────────────────────────────────────────────────────┐
│ Row 1: {{COMPANY_NAME}}                                  │
│         (Font: Bold, Size: 16, Merge cells A1:D1)        │
├─────────────────────────────────────────────────────────┤
│ Row 2: {{CUSTOM_HEADER}} (Optional)                     │
│         (Font: Italic, Merge cells A2:D2)                │
├─────────────────────────────────────────────────────────┤
│ Row 3: {{REPORT_TITLE}}                                   │
│         (Font: Bold, Size: 14, Merge cells A3:D3)        │
├─────────────────────────────────────────────────────────┤
│ Row 4: Period: {{PERIOD_FROM}} to {{PERIOD_TO}}         │
│         (Merge cells A4:D4)                              │
├─────────────────────────────────────────────────────────┤
│ Row 5: Generated: {{GENERATED_AT}}                      │
│         (Merge cells A5:D5)                              │
├─────────────────────────────────────────────────────────┤
│ Row 6: (Kosong - spacing)                                │
├─────────────────────────────────────────────────────────┤
│ Row 7: SALES BY DATE (Header)                            │
│         (Font: Bold, Background: Gray, Border: All)        │
├─────────────────────────────────────────────────────────┤
│ Row 8: Date | Transactions | Revenue                     │
│         (Header row dengan border)                       │
├─────────────────────────────────────────────────────────┤
│ Row 9: {{SALES_START_ROW}}                               │
│         (Marker - akan diganti dengan data)              │
├─────────────────────────────────────────────────────────┤
│ Row X: TOTAL | {{TOTAL_TRANSACTIONS}} | {{TOTAL_REVENUE}}│
│         (Summary row, Font: Bold, Border: All)           │
├─────────────────────────────────────────────────────────┤
│ Row Y: (Kosong - spacing)                                │
├─────────────────────────────────────────────────────────┤
│ Row Z: TOP PRODUCTS (Header)                             │
│         (Font: Bold, Background: Gray, Border: All)       │
├─────────────────────────────────────────────────────────┤
│ Row Z+1: Product Name | SKU | Qty Sold | Revenue         │
│          (Header row dengan border)                      │
├─────────────────────────────────────────────────────────┤
│ Row Z+2: {{PRODUCTS_START_ROW}}                          │
│          (Marker - akan diganti dengan data)             │
├─────────────────────────────────────────────────────────┤
│ Row Z+N: TOTAL | | {{TOTAL_QUANTITY_SOLD}} | {{TOTAL_PRODUCTS_REVENUE}}│
│          (Summary row, Font: Bold, Border: All)          │
└─────────────────────────────────────────────────────────┘
```

### 4. Langkah-Langkah Membuat Template

#### Step 1: Setup Header

1. **Row 1 - Company Name**
   - Cell A1: Ketik `{{COMPANY_NAME}}`
   - Format: Font Bold, Size 16
   - Merge cells A1:D1 (atau sesuai lebar yang diinginkan)
   - Alignment: Center

2. **Row 2 - Custom Header (Optional)**
   - Cell A2: Ketik `{{CUSTOM_HEADER}}`
   - Format: Font Italic
   - Merge cells A2:D2
   - Jika tidak digunakan, bisa dihapus atau dikosongkan

3. **Row 3 - Report Title**
   - Cell A3: Ketik `{{REPORT_TITLE}}`
   - Format: Font Bold, Size 14
   - Merge cells A3:D3

4. **Row 4 - Period**
   - Cell A4: Ketik `Period: {{PERIOD_FROM}} to {{PERIOD_TO}}`
   - Merge cells A4:D4

5. **Row 5 - Generated Date**
   - Cell A5: Ketik `Generated: {{GENERATED_AT}}`
   - Merge cells A5:D5

#### Step 2: Setup Sales Table

1. **Row 7 - Section Title**
   - Cell A7: Ketik `SALES BY DATE`
   - Format: Font Bold, Background Color (Gray), Border All
   - Merge cells A7:C7

2. **Row 8 - Table Header**
   - Cell A8: `Date`
   - Cell B8: `Transactions`
   - Cell C8: `Revenue`
   - Format: Font Bold, Background Color (Light Gray), Border All
   - Alignment: Center

3. **Row 9 - Data Marker**
   - Cell A9: Ketik `{{SALES_START_ROW}}`
   - **PENTING**: Baris ini akan diganti dengan data sales
   - Bisa dikosongkan atau diisi placeholder

4. **Row X - Summary Row**
   - Cell A(X): `TOTAL`
   - Cell B(X): `{{TOTAL_TRANSACTIONS}}`
   - Cell C(X): `{{TOTAL_REVENUE}}`
   - Format: Font Bold, Border All

#### Step 3: Setup Top Products Table

1. **Row Y - Section Title**
   - Cell AY: Ketik `TOP PRODUCTS`
   - Format: Font Bold, Background Color (Gray), Border All
   - Merge cells AY:DY

2. **Row Y+1 - Table Header**
   - Cell A(Y+1): `Product Name`
   - Cell B(Y+1): `SKU`
   - Cell C(Y+1): `Quantity Sold`
   - Cell D(Y+1): `Revenue`
   - Format: Font Bold, Background Color (Light Gray), Border All

3. **Row Y+2 - Data Marker**
   - Cell A(Y+2): Ketik `{{PRODUCTS_START_ROW}}`
   - Baris ini akan diganti dengan data products

4. **Row Y+N - Summary Row**
   - Cell A(Y+N): `TOTAL`
   - Cell B(Y+N): (kosong)
   - Cell C(Y+N): `{{TOTAL_QUANTITY_SOLD}}`
   - Cell D(Y+N): `{{TOTAL_PRODUCTS_REVENUE}}`
   - Format: Font Bold, Border All

#### Step 4: Styling & Borders

1. **Border pada Tabel**
   - Pilih semua cell di tabel (header + data area)
   - Home → Borders → All Borders
   - Atau gunakan Format Cells → Border → All

2. **Header Styling**
   - Background: Light Gray (RGB: 224, 224, 224)
   - Font: Bold
   - Alignment: Center

3. **Summary Row Styling**
   - Font: Bold
   - Border: All
   - Bisa tambahkan background color berbeda

4. **Column Width**
   - Sesuaikan lebar kolom agar data terlihat rapi
   - Atau biarkan auto-fit (akan diatur otomatis saat export)

### 5. Tips & Best Practices

1. **Gunakan Named Ranges (Opsional)**
   - Bisa menggunakan named ranges untuk memudahkan referensi
   - Tapi tidak wajib, placeholder sudah cukup

2. **Consistent Styling**
   - Gunakan style yang konsisten untuk semua tabel
   - Header: Bold + Background
   - Data: Normal + Border
   - Summary: Bold + Border

3. **Spacing**
   - Beri jarak antar section (1-2 baris kosong)
   - Membuat report lebih mudah dibaca

4. **Column Order**
   - Sales Table: Date, Transactions, Revenue
   - Products Table: Product Name, SKU, Quantity Sold, Revenue
   - Urutan ini harus sesuai dengan data yang akan diisi

5. **Number Formatting**
   - Revenue columns akan otomatis diformat sebagai currency ($)
   - Tapi bisa juga di-set manual di template

### 6. Contoh Template Sederhana

**Minimal Template (hanya placeholder):**

```
A1: {{COMPANY_NAME}}
A3: {{REPORT_TITLE}}
A4: Period: {{PERIOD_FROM}} to {{PERIOD_TO}}
A5: Generated: {{GENERATED_AT}}

A7: SALES BY DATE
A8: Date | B8: Transactions | C8: Revenue
A9: {{SALES_START_ROW}}
A10: TOTAL | B10: {{TOTAL_TRANSACTIONS}} | C10: {{TOTAL_REVENUE}}

A12: TOP PRODUCTS
A13: Product | B13: SKU | C13: Qty | D13: Revenue
A14: {{PRODUCTS_START_ROW}}
A15: TOTAL | C15: {{TOTAL_QUANTITY_SOLD}} | D15: {{TOTAL_PRODUCTS_REVENUE}}
```

### 7. Testing Template

1. Simpan template sebagai `report-template.xlsx`
2. Upload template di halaman Reports
3. Klik "Export with Template"
4. Cek hasil export:
   - Apakah placeholder sudah terisi?
   - Apakah border masih ada?
   - Apakah styling masih sesuai?
   - Apakah data terisi dengan benar?

### 8. Troubleshooting

**Problem: Placeholder tidak terisi**
- Pastikan placeholder ditulis dengan benar (case-sensitive)
- Pastikan menggunakan double curly braces `{{}}`
- Cek apakah ada typo

**Problem: Border hilang**
- Border di template akan tetap ada
- Pastikan border sudah di-set di template sebelum upload

**Problem: Data tidak terisi**
- Pastikan marker `{{SALES_START_ROW}}` dan `{{PRODUCTS_START_ROW}}` ada
- Pastikan urutan kolom sesuai

**Problem: Format number salah**
- Revenue akan otomatis diformat sebagai currency
- Jika perlu format lain, bisa di-set manual di template

## Download Template

### Opsi 1: Download dari UI (Recommended) ⭐
1. Buka halaman Reports
2. Klik "Export Excel"
3. Klik "Download Template"
4. Template akan terdownload langsung dengan nama `report-template.xlsx`
5. Buka di Excel dan edit sesuai kebutuhan
6. Upload kembali saat export

### Opsi 2: Generate via Script
Jika Anda ingin generate template via command line:

```bash
cd pos-system/frontend
npm run generate-template
```

Template akan tersimpan di `public/templates/report-template.xlsx`

### Opsi 3: Generate via Code
Template juga bisa di-generate secara programmatic menggunakan fungsi `generateTemplateExcel()` dari `@/lib/generateTemplate`

## Template Features

Template yang di-generate sudah termasuk:

✅ **Header Section**
- Company Name (Bold, Size 16, Centered)
- Custom Header (Italic, Optional)
- Report Title (Bold, Size 14)
- Period (Auto-filled dari date range)
- Generated Date (Auto-filled)

✅ **Sales Table**
- Section Title dengan background gray
- Table Header dengan border dan background
- Data marker untuk insert data
- Summary row dengan total

✅ **Top Products Table**
- Section Title dengan background gray
- Table Header dengan border dan background
- Data marker untuk insert data
- Summary row dengan total

✅ **Formatting**
- Border pada semua cell tabel
- Background color untuk header
- Bold font untuk summary
- Currency format untuk revenue
- Auto column width

## Support

Jika ada pertanyaan atau masalah dengan template, silakan hubungi tim development.

