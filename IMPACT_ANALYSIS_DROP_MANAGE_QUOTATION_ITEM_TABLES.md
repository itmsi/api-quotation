# Analisis Impact: Penghapusan Tabel `manage_quotation_item_accessories` dan `manage_quotation_item_specifications`

## Ringkasan
Kedua tabel akan dihapus karena sudah digantikan dengan kolom JSONB di tabel `manage_quotation_items`:
- `specification_properties` (JSONB) - menggantikan `manage_quotation_item_specifications`
- `accesories_properties` (JSONB) - menggantikan `manage_quotation_item_accessories`

**Migrasi**: `20260113000001_drop_manage_quotation_item_tables.js`

## Status Migrasi Terkait
- ✅ **20250228000003**: Kolom `specification_properties` dan `accesories_properties` sudah ditambahkan ke `manage_quotation_items`
- ✅ **20260108000001**: Kolom `specification_properties` dan `accesories_properties` sudah ditambahkan (duplikat/update)
- ✅ **20260113000001**: Migrasi untuk menghapus kedua tabel (BARU)

## Impact Analysis

### 1. Module yang TERPENGARUH

#### 1.1. Module `manage_quotation` - Repository Functions (HIGH IMPACT)
**Lokasi**: `src/modules/manage_quotation/postgre_repository.js`

**Fungsi yang akan ERROR** (menggunakan tabel yang akan dihapus):

**Accessories Functions:**
- ✅ `createAccessories()` - Baris 1128-1154 - INSERT ke `manage_quotation_item_accessories`
- ✅ `getAccessoriesByQuotationId()` - Baris 1159-1197 - SELECT dari `manage_quotation_item_accessories`
- ✅ `deleteAccessoriesByQuotationId()` - Baris 1202-1212 - DELETE dari `manage_quotation_item_accessories`
- ✅ `replaceAccessories()` - Baris 1217-1225 - Menggunakan `deleteAccessoriesByQuotationId()` dan `createAccessories()`

**Specifications Functions:**
- ✅ `createSpecifications()` - Baris 1231-1255 - INSERT ke `manage_quotation_item_specifications`
- ✅ `getSpecificationsByQuotationId()` - Baris 1257-1296 - SELECT dari `manage_quotation_item_specifications`
- ✅ `deleteSpecificationsByQuotationId()` - Baris 1298-1308 - DELETE dari `manage_quotation_item_specifications`
- ✅ `replaceSpecifications()` - Baris 1310-1314 - Menggunakan `deleteSpecificationsByQuotationId()` dan `createSpecifications()`

**Constants:**
- ✅ `ACCESSORIES_TABLE_NAME` - Baris 1051 - Constant untuk nama tabel
- ✅ `SPECIFICATIONS_TABLE_NAME` - Baris 1052 - Constant untuk nama tabel

**Rekomendasi:**
- ⚠️ **DISABLE atau HAPUS** semua fungsi yang menggunakan tabel lama
- ⚠️ **UPDATE** handler untuk tidak lagi memanggil fungsi-fungsi ini
- ⚠️ **PASTIKAN** semua data sudah tersimpan di `specification_properties` dan `accesories_properties`

#### 1.2. Module `manage_quotation` - Handler (MEDIUM IMPACT - Sudah Ada Fallback)
**Lokasi**: `src/modules/manage_quotation/handler.js`

**Status**: ✅ **SUDAH MEMILIKI FALLBACK** ke properties columns

**Fungsi yang menggunakan fallback:**
- ✅ `getById()` - Baris 500-761
  - Baris 572-610: Menggunakan `accesories_properties` sebagai prioritas pertama
  - Baris 612-620: Fallback ke relational logic (akan error setelah tabel dihapus)
  - Baris 622-662: Menggunakan `specification_properties` sebagai prioritas pertama
  - Baris 654-662: Fallback ke relational logic (akan error setelah tabel dihapus)

- ✅ `getPdfById()` - Baris 766-964
  - Baris 850-888: Menggunakan `accesories_properties` sebagai prioritas pertama
  - Baris 890-898: Fallback ke relational logic (akan error setelah tabel dihapus)
  - Baris 900-940: Menggunakan `specification_properties` sebagai prioritas pertama
  - Baris 932-940: Fallback ke relational logic (akan error setelah tabel dihapus)

**Masalah:**
- ⚠️ Fallback ke relational logic masih memanggil `getAccessoriesByQuotationId()` dan `getSpecificationsByQuotationId()` yang akan error
- ⚠️ Perlu **HAPUS** fallback logic atau **UPDATE** untuk hanya menggunakan properties columns

**Rekomendasi:**
- ⚠️ **HAPUS** fallback logic yang memanggil fungsi repository untuk tabel lama
- ⚠️ **PASTIKAN** semua data sudah tersimpan di properties columns sebelum migrasi

#### 1.3. Module `manage_quotation` - Create/Update Handler (HIGH IMPACT)
**Lokasi**: `src/modules/manage_quotation/handler.js`

**Fungsi yang terpengaruh:**

**Create Handler:**
- ✅ `create()` - Baris 1249-1258: Validasi `manage_quotation_item_accessories`
- ✅ `create()` - Baris 1258-1266: Validasi `manage_quotation_item_specifications`
- ⚠️ **PERLU CEK**: Apakah create handler masih memanggil `createAccessories()` dan `createSpecifications()`?

**Update Handler:**
- ✅ `update()` - Baris 1497-1506: Validasi `manage_quotation_item_accessories`
- ✅ `update()` - Baris 1506-1514: Validasi `manage_quotation_item_specifications`
- ✅ `update()` - Baris 1515-1516: Check apakah accessories/specifications provided
- ⚠️ **PERLU CEK**: Apakah update handler masih memanggil `replaceAccessories()` dan `replaceSpecifications()`?

**Rekomendasi:**
- ⚠️ **VERIFIKASI** apakah create/update handler masih menggunakan fungsi repository untuk tabel lama
- ⚠️ **UPDATE** handler untuk hanya menyimpan ke properties columns
- ⚠️ **HAPUS** validasi yang tidak diperlukan jika sudah menggunakan properties columns

#### 1.4. Validation (LOW IMPACT - Masih Valid)
**Lokasi**: `src/modules/manage_quotation/validation.js`

**Status**: ✅ **MASIH VALID** - Validasi untuk input masih diperlukan

**Validasi yang ada:**
- Baris 309-359: Validasi `manage_quotation_item_accessories` (nested dalam items)
- Baris 363-380: Validasi `manage_quotation_item_specifications` (nested dalam items)
- Baris 381-397: Validasi `manage_quotation_item_accessories` (root level)
- Baris 712-797: Validasi untuk update (sama seperti create)

**Rekomendasi:**
- ✅ **TIDAK PERLU DIUBAH** - Validasi masih diperlukan untuk input validation
- ✅ Validasi memastikan format data yang benar sebelum disimpan ke properties columns

#### 1.5. Schema Swagger (LOW IMPACT - Dokumentasi)
**Lokasi**: `src/static/schema/manage_quotation.js`

**Status**: ✅ **MASIH VALID** - Schema untuk dokumentasi masih diperlukan

**Schema yang ada:**
- Baris 804-960: `ManageQuotationItemAccessory` schema
- Baris 962-1040: `ManageQuotationItemSpecification` schema

**Rekomendasi:**
- ✅ **TIDAK PERLU DIUBAH** - Schema masih valid untuk dokumentasi API
- ✅ Response format masih menggunakan struktur yang sama (dari properties columns)

### 2. Module yang TIDAK TERPENGARUH

#### 2.1. Tabel `manage_quotation_items` (NO IMPACT - Sudah Migrated)
**Status:**
- ✅ **SUDAH MIGRATED** - Menggunakan kolom `specification_properties` dan `accesories_properties` (JSONB)
- ✅ Handler sudah menggunakan properties columns sebagai prioritas pertama
- ✅ Data sudah tersimpan di properties columns

**Kesimpulan:** Tabel ini **TIDAK PERLU DIUBAH**, sudah menggunakan format baru.

## Checklist Tindakan yang Diperlukan

### Sebelum Menjalankan Migrasi:
- [ ] **BACKUP DATABASE** - Backup semua data dari kedua tabel
- [ ] **MIGRATE DATA** - Pastikan semua data dari tabel lama sudah di-migrate ke properties columns
- [ ] **VERIFIKASI DATA** - Pastikan tidak ada data yang hilang setelah migrasi
- [ ] **TEST HANDLER** - Test bahwa handler sudah menggunakan properties columns dengan benar

### Setelah Migrasi:
- [ ] **DISABLE/HAPUS** fungsi repository yang menggunakan tabel lama:
  - `createAccessories()`
  - `getAccessoriesByQuotationId()`
  - `deleteAccessoriesByQuotationId()`
  - `replaceAccessories()`
  - `createSpecifications()`
  - `getSpecificationsByQuotationId()`
  - `deleteSpecificationsByQuotationId()`
  - `replaceSpecifications()`
- [ ] **HAPUS** fallback logic di handler yang memanggil fungsi repository untuk tabel lama
- [ ] **UPDATE** handler untuk hanya menggunakan properties columns
- [ ] **HAPUS** constants `ACCESSORIES_TABLE_NAME` dan `SPECIFICATIONS_TABLE_NAME`
- [ ] **TEST** semua endpoint `manage_quotation` untuk memastikan tidak ada regresi

## Struktur Data Baru

**Sebelum (Tabel Terpisah):**

```sql
manage_quotation_item_accessories:
  - manage_quotation_item_accessory_id (UUID)
  - manage_quotation_id (FK)
  - accessory_id (FK)
  - componen_product_id (FK)
  - quantity
  - description
  - accessory_part_number, accessory_part_name, etc.

manage_quotation_item_specifications:
  - manage_quotation_item_specification_id (UUID)
  - manage_quotation_id (FK)
  - componen_product_id (FK)
  - manage_quotation_item_specification_label
  - manage_quotation_item_specification_value
```

**Sesudah (JSONB Columns):**

```sql
manage_quotation_items.accesories_properties (JSONB):
[
  {
    "accessory_id": "...",
    "componen_product_id": "...",
    "quantity": 1,
    "description": "...",
    "accessory_part_number": "...",
    "accessory_part_name": "...",
    "accessory_specification": "...",
    "accessory_brand": "...",
    "accessory_remark": "...",
    "accessory_region": "...",
    "accessory_description": "..."
  }
]

manage_quotation_items.specification_properties (JSONB):
[
  {
    "componen_product_id": "...",
    "manage_quotation_item_specification_label": "...",
    "manage_quotation_item_specification_value": "..."
  }
]
```

## Catatan Penting

1. **Data Migration**: **PENTING** - Pastikan semua data dari tabel lama sudah di-migrate ke properties columns sebelum menjalankan migration drop table.

2. **Handler Strategy**: Handler sudah menggunakan properties columns sebagai prioritas pertama, tapi masih ada fallback ke relational logic yang akan error. Perlu dihapus.

3. **Repository Functions**: Semua fungsi repository yang menggunakan tabel lama perlu di-disable atau dihapus.

4. **Testing**: Setelah migrasi, pastikan:
   - Create quotation dengan accessories dan specifications berfungsi
   - Update quotation dengan accessories dan specifications berfungsi
   - Get quotation menampilkan accessories dan specifications dengan benar
   - PDF generation masih berfungsi

## Kesimpulan

✅ **Migrasi sudah dibuat**: `20260113000001_drop_manage_quotation_item_tables.js`

⚠️ **Action Required**: 
1. **DISABLE/HAPUS** semua fungsi repository yang menggunakan tabel lama
2. **HAPUS** fallback logic di handler yang memanggil fungsi repository untuk tabel lama
3. **PASTIKAN** semua data sudah tersimpan di properties columns sebelum migrasi
4. **TEST** semua endpoint untuk memastikan tidak ada regresi

✅ **Handler sudah siap** - sudah menggunakan properties columns sebagai prioritas pertama, hanya perlu hapus fallback logic.

