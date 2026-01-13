# Checklist Testing: Endpoint Componen Product

Setelah migrasi menghapus tabel `componen_product_specifications` dan menggunakan `specification_properties` (JSONB), pastikan semua endpoint `componen_product` berfungsi dengan baik.

## Endpoint yang Perlu Ditest

### 1. GET All Componen Products
**Endpoint**: `POST /api/quotation/componen_product/get`

**Request Body**:
```json
{
  "page": 1,
  "limit": 10,
  "search": "",
  "sort_by": "created_at",
  "sort_order": "desc"
}
```

**Expected Result**:
- ✅ Status 200
- ✅ Response berisi array `items` dengan data componen products
- ✅ Response berisi `pagination` object
- ✅ Setiap item memiliki field `componen_product_specifications` (array dari `specification_properties`)

**Test Cases**:
- [ ] Test dengan pagination (page, limit)
- [ ] Test dengan search
- [ ] Test dengan sort_by dan sort_order
- [ ] Test tanpa parameter (default values)

---

### 2. GET Componen Product by ID
**Endpoint**: `GET /api/quotation/componen_product/:id`

**Expected Result**:
- ✅ Status 200 jika data ditemukan
- ✅ Status 404 jika data tidak ditemukan
- ✅ Response berisi data lengkap componen product
- ✅ Field `componen_product_specifications` berisi array dari `specification_properties`
- ✅ Field `product_type` terisi dengan benar (mapping dari `componen_type`)

**Test Cases**:
- [ ] Test dengan ID yang valid
- [ ] Test dengan ID yang tidak ada
- [ ] Test dengan ID yang format tidak valid (UUID)
- [ ] Verifikasi `componen_product_specifications` ter-parse dengan benar dari JSONB

---

### 3. CREATE Componen Product
**Endpoint**: `POST /api/quotation/componen_product`

**Request Body** (dengan specifications):
```json
{
  "componen_type": 1,
  "code_unique": "TEST-001",
  "segment": "Test Segment",
  "msi_model": "Test Model",
  "msi_product": "Test Product",
  "wheel_no": "4x2",
  "engine": "Test Engine",
  "horse_power": "200 HP",
  "volume": "10",
  "componen_product_unit_model": "Unit Model",
  "market_price": "10000000",
  "selling_price_star_1": "9500000",
  "selling_price_star_2": "9000000",
  "selling_price_star_3": "8500000",
  "selling_price_star_4": "8000000",
  "selling_price_star_5": "7500000",
  "componen_product_description": "Test Description",
  "componen_product_specifications": "[{\"componen_product_specification_label\":\"Horse Power\",\"componen_product_specification_value\":\"200 HP\",\"componen_product_specification_description\":\"Test\"}]"
}
```

**Expected Result**:
- ✅ Status 201
- ✅ Data berhasil dibuat
- ✅ `specification_properties` tersimpan sebagai JSONB di database
- ✅ Response berisi `componen_product_specifications` yang sudah di-normalize
- ✅ `componen_product_name` ter-generate otomatis jika tidak disediakan

**Test Cases**:
- [ ] Test create dengan specifications (JSON string)
- [ ] Test create dengan specifications (array object)
- [ ] Test create tanpa specifications
- [ ] Test create dengan specifications kosong
- [ ] Test create dengan image upload
- [ ] Test validasi duplicate `code_unique`
- [ ] Test validasi `componen_type` (1, 2, 3)
- [ ] Verifikasi data tersimpan di kolom `specification_properties` (JSONB)

---

### 4. UPDATE Componen Product
**Endpoint**: `PUT /api/quotation/componen_product/:id`

**Request Body** (update specifications):
```json
{
  "componen_product_name": "Updated Name",
  "componen_product_specifications": "[{\"componen_product_specification_label\":\"Updated Label\",\"componen_product_specification_value\":\"Updated Value\"}]"
}
```

**Expected Result**:
- ✅ Status 200
- ✅ Data berhasil diupdate
- ✅ `specification_properties` ter-update di database
- ✅ Response berisi data terbaru dengan `componen_product_specifications` yang sudah di-normalize

**Test Cases**:
- [ ] Test update dengan specifications baru (JSON string)
- [ ] Test update dengan specifications baru (array object)
- [ ] Test update tanpa specifications (tidak mengubah yang ada)
- [ ] Test update dengan specifications kosong (menghapus semua)
- [ ] Test update dengan image baru
- [ ] Test update dengan ID yang tidak ada (404)
- [ ] Test update `code_unique` dengan value yang sudah digunakan (400)
- [ ] Verifikasi `componen_product_name` ter-generate ulang jika field terkait diupdate

---

### 5. DELETE Componen Product (Soft Delete)
**Endpoint**: `DELETE /api/quotation/componen_product/:id`

**Expected Result**:
- ✅ Status 200
- ✅ Data ter-soft delete (`is_delete = true`)
- ✅ Data tidak muncul di GET all (kecuali dengan filter khusus)

**Test Cases**:
- [ ] Test delete dengan ID yang valid
- [ ] Test delete dengan ID yang tidak ada (404)
- [ ] Verifikasi data tidak muncul di GET all setelah delete
- [ ] Verifikasi `deleted_at` dan `deleted_by` terisi

---

### 6. IMPORT CSV
**Endpoint**: `POST /api/quotation/componen_product/import-csv`

**Expected Result**:
- ✅ Status 201
- ✅ Data dari CSV berhasil di-import
- ✅ Specifications dari CSV tersimpan di `specification_properties`
- ✅ Response berisi summary (success, failed, total)

**Test Cases**:
- [ ] Test import CSV dengan format yang benar
- [ ] Test import CSV dengan data yang menghasilkan specifications
- [ ] Verifikasi specifications tersimpan di `specification_properties`
- [ ] Test dengan CSV yang memiliki error (partial success)

---

## Format Specifications

### Input Format (Request)
Specifications dapat dikirim dalam 2 format:

1. **JSON String**:
```json
{
  "componen_product_specifications": "[{\"componen_product_specification_label\":\"Horse Power\",\"componen_product_specification_value\":\"200 HP\"}]"
}
```

2. **Array Object** (akan di-convert ke JSON string):
```json
{
  "componen_product_specifications": [
    {
      "componen_product_specification_label": "Horse Power",
      "componen_product_specification_value": "200 HP",
      "componen_product_specification_description": "Optional description"
    }
  ]
}
```

### Output Format (Response)
Response selalu mengembalikan array object yang sudah di-normalize:
```json
{
  "componen_product_specifications": [
    {
      "componen_product_id": "...",
      "componen_product_specification_label": "Horse Power",
      "componen_product_specification_value": "200 HP",
      "componen_product_specification_description": "Optional description",
      "specification_label_name": "Horse Power",
      "specification_value_name": "200 HP"
    }
  ]
}
```

## Database Verification

Setelah testing, verifikasi langsung di database:

```sql
-- Cek struktur kolom specification_properties
SELECT 
  componen_product_id,
  componen_product_name,
  specification_properties,
  pg_typeof(specification_properties) as column_type
FROM componen_products
WHERE specification_properties IS NOT NULL
LIMIT 5;

-- Cek data specifications tersimpan dengan benar
SELECT 
  componen_product_id,
  jsonb_array_length(specification_properties) as spec_count,
  specification_properties
FROM componen_products
WHERE specification_properties IS NOT NULL
  AND jsonb_array_length(specification_properties) > 0;
```

## Regression Testing

Pastikan tidak ada regresi pada fitur yang sudah ada:

- [ ] Semua endpoint `componen_product` masih berfungsi
- [ ] Tidak ada error di console/logs
- [ ] Response time masih acceptable
- [ ] Validasi masih berfungsi dengan baik
- [ ] Image upload masih berfungsi
- [ ] CSV import masih berfungsi
- [ ] Search dan filter masih berfungsi
- [ ] Pagination masih berfungsi

## Endpoint yang Sudah Dinonaktifkan

Endpoint berikut sudah **TIDAK BERFUNGSI** (sudah dinonaktifkan):

- ❌ `POST /api/quotation/componen_product/specification/get`
- ❌ `GET /api/quotation/componen_product/specification/:id`
- ❌ `POST /api/quotation/componen_product/specification/create`
- ❌ `PUT /api/quotation/componen_product/specification/:id`
- ❌ `DELETE /api/quotation/componen_product/specification/:id`

**Catatan**: Endpoint-endpoint di atas akan mengembalikan router kosong (tidak error, tapi juga tidak berfungsi).

## Checklist Final

- [ ] Semua endpoint `componen_product` berfungsi dengan baik
- [ ] Specifications tersimpan dan ter-retrieve dengan benar dari `specification_properties`
- [ ] Tidak ada error di logs
- [ ] Database structure sesuai (kolom `specification_properties` ada dan berisi data JSONB)
- [ ] Dokumentasi API (Swagger) tidak menampilkan endpoint yang sudah dinonaktifkan
- [ ] Tidak ada dependency yang masih menggunakan tabel `componen_product_specifications`

