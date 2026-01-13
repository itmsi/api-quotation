# Analisis Impact: Penghapusan Tabel `componen_product_specifications`

## Ringkasan
Tabel `componen_product_specifications` akan dihapus karena sudah digantikan dengan kolom `specification_properties` (tipe JSONB) di tabel `componen_products`. Migrasi untuk menghapus tabel: `20260112000001_drop_componen_product_specifications_table.js`

## Status Migrasi Terkait
- ✅ **20260111000002**: Kolom `specification_properties` sudah ditambahkan ke tabel `componen_products`
- ✅ **20260112000001**: Migrasi untuk menghapus tabel `componen_product_specifications` (BARU)

## Impact Analysis

### 1. Module yang TERPENGARUH (Akan Error/Breaking)

#### 1.1. Module `componen_product_specification` (FULL IMPACT)
**Lokasi**: `src/modules/componen_product_specification/`

**File yang terpengaruh:**
- ✅ `postgre_repository.js` - Semua query ke tabel `componen_product_specifications` akan error
- ✅ `handler.js` - Semua handler yang memanggil repository akan error
- ✅ `index.js` - Route definitions masih valid, tapi endpoint akan error
- ✅ `validation.js` - Validation masih valid, tapi tidak akan pernah berhasil karena tabel tidak ada

**Endpoint yang akan error:**
- `POST /api/quotation/componen_product/specification/get` - List specifications
- `GET /api/quotation/componen_product/specification/:id` - Get by ID
- `POST /api/quotation/componen_product/specification/create` - Create specification
- `PUT /api/quotation/componen_product/specification/:id` - Update specification
- `DELETE /api/quotation/componen_product/specification/:id` - Delete specification

**Rekomendasi:**
- ⚠️ **HAPUS atau DEPRECATE** seluruh module `componen_product_specification`
- ⚠️ **HAPUS** route di `src/routes/V1/index.js` baris 50-51
- ⚠️ **HAPUS** atau **COMMENT** seluruh folder `src/modules/componen_product_specification/`

#### 1.2. Seeder (FULL IMPACT)
**Lokasi**: `src/repository/postgres/seeders/0014_componen_product_specifications_seeder.js`

**Impact:**
- Seeder akan error karena mencoba TRUNCATE dan INSERT ke tabel yang sudah tidak ada

**Rekomendasi:**
- ⚠️ **HAPUS** atau **RENAME** seeder ini (misalnya: `0014_componen_product_specifications_seeder.js.disabled`)
- ⚠️ **UPDATE** file SQL `sql_product/componen_product_specifications_202511111110.sql` - tidak diperlukan lagi

#### 1.3. Schema Swagger (MEDIUM IMPACT)
**Lokasi**: `src/static/schema/componen_product_specification.js`

**Impact:**
- Schema masih valid untuk dokumentasi, tapi tidak relevan lagi karena endpoint tidak berfungsi

**Rekomendasi:**
- ⚠️ **HAPUS** atau **DEPRECATE** file schema ini
- ✅ **UPDATE** `src/static/schema/componen_product.js` - Field `componen_product_specifications` sudah diubah menjadi string JSON (baris 358-362), ini sudah benar

### 2. Module yang TIDAK TERPENGARUH (Sudah Menggunakan `specification_properties`)

#### 2.1. Module `componen_product` (NO IMPACT - SUDAH MIGRATED)
**Lokasi**: `src/modules/componen_product/`

**Status:**
- ✅ **SUDAH MIGRATED** - Menggunakan kolom `specification_properties` (JSONB) dari tabel `componen_products`
- ✅ Repository (`postgre_repository.js`):
  - Baris 263-265: Membaca dari `specification_properties`
  - Baris 361: Menyimpan ke `specification_properties` sebagai JSON string
  - Baris 440: Update `specification_properties`
- ✅ Handler (`handler.js`):
  - Baris 326, 433: Menggunakan `parseSpecificationsInput` untuk memproses input
  - Sudah tidak bergantung pada tabel `componen_product_specifications`
- ✅ Validation (`validation.js`):
  - Baris 99-134, 238-273: Validasi untuk `componen_product_specifications` sebagai JSON string
  - Sudah sesuai dengan format baru

**Kesimpulan:** Module ini **TIDAK PERLU DIUBAH**, sudah menggunakan format baru.

### 3. File yang Perlu Diperhatikan

#### 3.1. Routes
**File**: `src/routes/V1/index.js`
- Baris 50-51: Route untuk `componen_product_specification` module
- **Action**: HAPUS atau COMMENT baris ini

#### 3.2. Migration Files
- ✅ `20251110000007_create_componen_product_specifications_table.js` - Migration create (tetap ada untuk history)
- ✅ `20260112000001_drop_componen_product_specifications_table.js` - Migration drop (BARU)

## Checklist Tindakan yang Diperlukan

### Sebelum Menjalankan Migrasi:
- [ ] Backup database (jika ada data penting di tabel `componen_product_specifications`)
- [ ] Migrate data dari `componen_product_specifications` ke `specification_properties` (jika diperlukan)
- [ ] Test bahwa module `componen_product` sudah berfungsi dengan `specification_properties`

### Setelah Migrasi:
- [ ] Hapus atau disable module `componen_product_specification`
- [ ] Hapus route di `src/routes/V1/index.js`
- [ ] Hapus atau disable seeder `0014_componen_product_specifications_seeder.js`
- [ ] Hapus atau deprecate schema `componen_product_specification.js`
- [ ] Update dokumentasi API (jika ada)
- [ ] Test semua endpoint `componen_product` untuk memastikan tidak ada regresi

## Catatan Penting

1. **Data Migration**: Jika ada data di tabel `componen_product_specifications` yang perlu dipindahkan ke `specification_properties`, buat script migrasi data terlebih dahulu sebelum menjalankan migration drop table.

2. **Backward Compatibility**: Pastikan semua client/consumer API sudah menggunakan format baru (JSON string di `specification_properties`) sebelum menghapus tabel.

3. **Testing**: Setelah migrasi, pastikan:
   - Create componen_product dengan specifications berfungsi
   - Update componen_product dengan specifications berfungsi
   - Get componen_product menampilkan specifications dengan benar

## Struktur Data Baru

**Sebelum (Tabel Terpisah):**
```sql
componen_product_specifications:
  - componen_product_specification_id (UUID)
  - componen_product_id (FK)
  - componen_product_specification_label
  - componen_product_specification_value
  - componen_product_specification_description
```

**Sesudah (JSONB Column):**
```sql
componen_products.specification_properties (JSONB):
[
  {
    "componen_product_id": "...",
    "componen_product_specification_label": "...",
    "componen_product_specification_value": "...",
    "componen_product_specification_description": "..."
  }
]
```

## Kesimpulan

✅ **Migrasi sudah dibuat**: `20260112000001_drop_componen_product_specifications_table.js`

⚠️ **Action Required**: 
1. Hapus/deprecate module `componen_product_specification`
2. Hapus route terkait
3. Hapus/disable seeder terkait
4. Pastikan tidak ada dependency lain yang menggunakan tabel ini

✅ **Module `componen_product` sudah siap** - tidak perlu perubahan karena sudah menggunakan `specification_properties`.

