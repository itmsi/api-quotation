# Analisis Impact: Penghapusan Tabel `item_products`

## Ringkasan
Tabel `item_products` akan dihapus karena sudah digantikan dengan tabel `componen_products`. Migration `20250224000002` sudah mengubah `item_product_id` menjadi `componen_product_id` di tabel `manage_quotation_items` dengan foreign key ke `componen_products`.

**Migrasi**: `20260114000001_drop_item_products_table.js`

## Status Migrasi Terkait
- ✅ **20250216000001**: Tabel `item_products` dibuat
- ✅ **20250221000001**: Kolom tambahan ditambahkan ke `item_products`
- ✅ **20250224000002**: `item_product_id` diubah menjadi `componen_product_id` di `manage_quotation_items` dengan foreign key ke `componen_products`
- ✅ **20260114000001**: Migrasi untuk menghapus tabel `item_products` (BARU)

## Impact Analysis

### 1. Module yang TERPENGARUH (Akan Error/Breaking)

#### 1.1. Module `itemProduct` (FULL IMPACT)
**Lokasi**: `src/modules/itemProduct/`

**File yang terpengaruh:**
- ✅ `postgre_repository.js` - Semua query ke tabel `item_products` akan error
- ✅ `handler.js` - Semua handler yang memanggil repository akan error
- ✅ `index.js` - Route definitions masih valid, tapi endpoint akan error
- ✅ `validation.js` - Validation masih valid, tapi tidak akan pernah berhasil karena tabel tidak ada

**Endpoint yang akan error:**
- `POST /api/quotation/item_product/get` - List item products
- `GET /api/quotation/item_product/:id` - Get by ID
- `POST /api/quotation/item_product` - Create item product
- `PUT /api/quotation/item_product/:id` - Update item product
- `DELETE /api/quotation/item_product/:id` - Delete item product

**Rekomendasi:**
- ⚠️ **HAPUS atau DEPRECATE** seluruh module `itemProduct`
- ⚠️ **HAPUS** route di `src/routes/V1/index.js` baris 42-43
- ⚠️ **HAPUS** atau **COMMENT** seluruh folder `src/modules/itemProduct/`

#### 1.2. Schema Swagger (MEDIUM IMPACT)
**Lokasi**: `src/static/schema/item_product.js` dan `src/static/path/item_product.js`

**Impact:**
- Schema masih valid untuk dokumentasi, tapi tidak relevan lagi karena endpoint tidak berfungsi

**Rekomendasi:**
- ⚠️ **HAPUS** atau **DEPRECATE** file schema dan path ini
- ⚠️ **UPDATE** `src/static/index.js` - Comment out referensi ke schema dan path item_product

### 2. Module yang TIDAK TERPENGARUH

#### 2.1. Tabel `manage_quotation_items` (NO IMPACT - Sudah Migrated)
**Status:**
- ✅ **SUDAH MIGRATED** - Kolom `item_product_id` sudah diubah menjadi `componen_product_id`
- ✅ Foreign key sudah diubah ke `componen_products`
- ✅ Tidak ada lagi dependency ke `item_products`

**Kesimpulan:** Tabel ini **TIDAK PERLU DIUBAH**, sudah menggunakan `componen_products`.

#### 2.2. Module `componen_product` (NO IMPACT)
**Status:**
- ✅ Module ini adalah pengganti dari `itemProduct`
- ✅ Semua fitur yang sebelumnya ada di `itemProduct` sudah tersedia di `componen_product`

**Kesimpulan:** Module ini **TIDAK PERLU DIUBAH**, sudah menjadi pengganti yang lengkap.

## Checklist Tindakan yang Diperlukan

### Sebelum Menjalankan Migrasi:
- [ ] **BACKUP DATABASE** - Backup semua data dari tabel `item_products` (jika ada data penting)
- [ ] **MIGRATE DATA** - Pastikan semua data dari `item_products` sudah di-migrate ke `componen_products` (jika diperlukan)
- [ ] **VERIFIKASI** - Pastikan tidak ada foreign key constraint yang masih mengacu ke `item_products`

### Setelah Migrasi:
- [ ] **HAPUS/DISABLE** module `itemProduct`
- [ ] **HAPUS** route di `src/routes/V1/index.js` baris 42-43
- [ ] **HAPUS/DISABLE** schema dan path di `src/static/`
- [ ] **UPDATE** `src/static/index.js` - Comment out referensi ke item_product
- [ ] **TEST** semua endpoint `componen_product` untuk memastikan tidak ada regresi

## Struktur Data Migration

**Sebelum (item_products):**
```sql
item_products:
  - item_product_id (UUID, PK)
  - item_product_code
  - item_product_model
  - item_product_segment
  - item_product_msi_model
  - item_product_wheel_no
  - item_product_engine
  - item_product_horse_power
  - item_product_market_price
  - item_product_selling_price_star_1-5
  - item_product_description
  - item_product_image
  - item_product_drive_type
  - item_product_gvw
  - item_product_wheel_base
  - item_product_engine_brand_model
  - item_product_power_output
  - item_product_max_torque
  - item_product_displacement
  - item_product_emission_standard
  - item_product_engine_guard
  - item_product_gearbox_transmission
  - item_product_fuel_tank_capacity
  - item_product_tire_size
  - item_product_cargobox_vessel
```

**Sesudah (componen_products):**
```sql
componen_products:
  - componen_product_id (UUID, PK)
  - code_unique
  - segment
  - msi_model
  - msi_product
  - wheel_no
  - engine
  - horse_power
  - volume
  - componen_product_unit_model
  - market_price
  - selling_price_star_1-5
  - componen_product_description
  - image
  - componen_type
  - componen_product_name
  - specification_properties (JSONB)
```

## Catatan Penting

1. **Data Migration**: Jika ada data di tabel `item_products` yang perlu dipindahkan ke `componen_products`, buat script migrasi data terlebih dahulu sebelum menjalankan migration drop table.

2. **Foreign Key**: Pastikan tidak ada foreign key constraint yang masih mengacu ke `item_products`. Migration `20250224000002` sudah mengubah semua referensi ke `componen_products`.

3. **Module Replacement**: Module `itemProduct` sudah digantikan sepenuhnya oleh module `componen_product`. Semua fitur yang ada di `itemProduct` sudah tersedia di `componen_product`.

4. **Testing**: Setelah migrasi, pastikan:
   - Semua endpoint `componen_product` masih berfungsi
   - Tidak ada error di logs terkait `item_products`
   - Tidak ada referensi lain ke tabel `item_products`

## Kesimpulan

✅ **Migrasi sudah dibuat**: `20260114000001_drop_item_products_table.js`

⚠️ **Action Required**: 
1. Hapus/deprecate module `itemProduct`
2. Hapus route terkait
3. Hapus/disable schema dan path terkait
4. Pastikan tidak ada dependency lain yang menggunakan tabel ini

✅ **Module `componen_product` sudah siap** - sudah menjadi pengganti lengkap untuk `itemProduct`.

