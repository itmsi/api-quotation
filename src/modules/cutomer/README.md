# Module Cutomer

Module untuk mengelola data customer dari tabel `gate_sso.customers` (dblink database).

## Struktur File

- `handler.js` - Business logic dan request handlers
- `postgre_repository.js` - Database operations
- `validation.js` - Request validation rules
- `index.js` - Route definitions

## Endpoints

### 1. POST /api/quotation/customer/get
Mendapatkan daftar customer dengan pagination, search, dan sorting.

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
  "status": true,
  "message": "Data berhasil diambil",
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

### 2. GET /api/quotation/customer/:id
Mendapatkan detail customer berdasarkan ID.

**Response:**
```json
{
  "status": true,
  "message": "Data berhasil diambil",
  "data": {...}
}
```

### 3. POST /api/quotation/customer
Membuat customer baru.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+6281234567890"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Data berhasil dibuat",
  "data": {...}
}
```

### 4. PUT /api/quotation/customer/:id
Mengupdate data customer.

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "email": "john.doe.updated@example.com"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Data berhasil diupdate",
  "data": {...}
}
```

### 5. DELETE /api/quotation/customer/:id
Soft delete customer (mengisi deleted_at).

**Response:**
```json
{
  "status": true,
  "message": "Data berhasil dihapus",
  "data": {...}
}
```

### 6. POST /api/quotation/customer/:id/restore
Restore customer yang sudah dihapus.

**Response:**
```json
{
  "status": true,
  "message": "Data berhasil direstore",
  "data": {...}
}
```

## Authentication

Semua endpoint memerlukan authentication token di header:
```
Authorization: Bearer <token>
```

Token akan digunakan untuk mengisi otomatis field:
- `created_by` - untuk POST
- `updated_by` - untuk PUT
- `deleted_by` - untuk DELETE

## Database

Module ini menggunakan tabel `gate_sso.customers` yang merupakan dblink ke database gate_sso.

**Struktur tabel:**
- `id` (UUID) - Primary key
- `name` (String) - Nama customer
- `email` (String, nullable) - Email customer
- `phone` (String, nullable) - Nomor telepon customer
- `created_by` (UUID, nullable) - User ID yang membuat
- `updated_by` (UUID, nullable) - User ID yang mengupdate
- `deleted_by` (UUID, nullable) - User ID yang menghapus
- `created_at` (Timestamp) - Waktu dibuat
- `updated_at` (Timestamp) - Waktu diupdate
- `deleted_at` (Timestamp, nullable) - Waktu dihapus (soft delete)

## Validasi

- `name`: Wajib diisi, minimal 3 karakter, maksimal 100 karakter
- `email`: Opsional, harus format email yang valid
- `phone`: Opsional, maksimal 20 karakter
- `page`: Opsional, harus angka positif
- `limit`: Opsional, antara 1-100
- `search`: Opsional, maksimal 100 karakter
- `sort_by`: Opsional, salah satu dari: created_at, name, email, phone
- `sort_order`: Opsional, asc atau desc

## Swagger Documentation

Dokumentasi lengkap dapat dilihat di:
- Development: `http://localhost:3000/documentation`
- Production: `<production-url>/documentation`

Look for "Customer" tag di Swagger UI.

