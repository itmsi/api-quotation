# Item Product Module

Module untuk mengelola data produk item dengan fitur CRUD lengkap.

## Endpoints

### 1. Get All Item Products
**POST** `/api/quotation/item_product/get`

Mengambil daftar item products dengan pagination, search, dan sort.

**Request Body:**
```json
{
  "page": 1,
  "limit": 10,
  "search": "",
  "sort_by": "created_at",
  "sort_order": "desc"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data item product berhasil diambil",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### 2. Get Item Product by ID
**GET** `/api/quotation/item_product/:id`

Mengambil detail item product berdasarkan ID.

**Response:**
```json
{
  "success": true,
  "message": "Data item product berhasil diambil",
  "data": {
    "item_product_id": "uuid",
    "item_product_code": "...",
    ...
  }
}
```

### 3. Create Item Product
**POST** `/api/quotation/item_product`

Membuat item product baru. Body menggunakan form-data untuk mendukung upload gambar.

**Request (Form Data):**
- `item_product_code` (optional)
- `item_product_model` (optional)
- `item_product_segment` (optional)
- `item_product_msi_model` (optional)
- `item_product_wheel_no` (optional)
- `item_product_engine` (optional)
- `item_product_horse_power` (optional)
- `item_product_market_price` (optional)
- `item_product_selling_price_star_1` (optional)
- `item_product_selling_price_star_2` (optional)
- `item_product_selling_price_star_3` (optional)
- `item_product_selling_price_star_4` (optional)
- `item_product_selling_price_star_5` (optional)
- `item_product_description` (optional)
- `item_product_image` (file, optional) - Format: jpg, jpeg, png, gif, webp, maksimal 5MB

**Response:**
```json
{
  "success": true,
  "message": "Data item product berhasil dibuat",
  "data": {...}
}
```

### 4. Update Item Product
**PUT** `/api/quotation/item_product/:id`

Mengupdate item product. Body menggunakan form-data untuk mendukung upload gambar.

**Request (Form Data):**
- Semua field sama seperti create (semua optional)

**Response:**
```json
{
  "success": true,
  "message": "Data item product berhasil diupdate",
  "data": {...}
}
```

### 5. Delete Item Product
**DELETE** `/api/quotation/item_product/:id`

Soft delete item product (sets is_delete to true).

**Response:**
```json
{
  "success": true,
  "message": "Data item product berhasil dihapus"
}
```

## Authentication

Semua endpoint memerlukan authentication token. Tambahkan header:

```
Authorization: Bearer <your-token>
```

Token akan digunakan untuk mengisi:
- `created_by` saat create
- `updated_by` saat update
- `deleted_by` saat delete

## Database Schema

Tabel: `item_products`

Kolom:
- `item_product_id` (uuid, primary key)
- `item_product_code` (varchar(255), nullable)
- `item_product_model` (varchar(255), nullable)
- `item_product_segment` (varchar(255), nullable)
- `item_product_msi_model` (varchar(255), nullable)
- `item_product_wheel_no` (varchar(255), nullable)
- `item_product_engine` (varchar(255), nullable)
- `item_product_horse_power` (varchar(255), nullable)
- `item_product_market_price` (varchar(255), nullable)
- `item_product_selling_price_star_1` (varchar(255), nullable)
- `item_product_selling_price_star_2` (varchar(255), nullable)
- `item_product_selling_price_star_3` (varchar(255), nullable)
- `item_product_selling_price_star_4` (varchar(255), nullable)
- `item_product_selling_price_star_5` (varchar(255), nullable)
- `item_product_description` (text, nullable)
- `item_product_image` (text, nullable) - URL gambar
- `created_at` (timestamp)
- `created_by` (uuid, nullable)
- `updated_at` (timestamp)
- `updated_by` (uuid, nullable)
- `deleted_at` (timestamp, nullable)
- `deleted_by` (uuid, nullable)
- `is_delete` (boolean, default: false)

## File Upload

Module ini mendukung upload gambar untuk field `item_product_image`:
- Format yang didukung: jpg, jpeg, png, gif, webp
- Maksimal ukuran: 5MB
- Gambar akan diupload ke MinIO/S3 dan URL akan disimpan di database

## Search & Filter

Endpoint `GET /get` mendukung pencarian pada kolom:
- `item_product_code`
- `item_product_model`
- `item_product_segment`
- `item_product_msi_model`
- `item_product_description`

## Sorting

Endpoint `GET /get` mendukung sorting berdasarkan:
- `created_at` (default)
- `item_product_code`
- `item_product_model`
- `item_product_segment`

Order: `asc` atau `desc` (default: `desc`)

