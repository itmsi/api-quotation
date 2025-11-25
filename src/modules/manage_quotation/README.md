# Manage Quotation Module

Module untuk mengelola data quotation/penawaran.

## Endpoints

### 1. Get All Quotations (with pagination, search, and sort)
- **Method**: POST
- **URL**: `/api/quotation/manage-quotation/get`
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body**:
```json
{
  "page": 1,
  "limit": 10,
  "search": "",
  "sort_by": "created_at",
  "sort_order": "desc",
  "status": ""
}
```

### 2. Get Quotation by ID
- **Method**: GET
- **URL**: `/api/quotation/manage-quotation/:id`
- **Headers**: `Authorization: Bearer <token>`

### 3. Create Quotation
- **Method**: POST
- **URL**: `/api/quotation/manage-quotation`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "manage_quotation_no": "QUO-2025-001",
  "customer_id": "uuid",
  "employee_id": "uuid",
  "island_id": "uuid",
  "manage_quotation_date": "2025-01-15",
  "manage_quotation_valid_date": "2025-01-30",
  "manage_quotation_grand_total": "1000000",
  "manage_quotation_ppn": "110000",
  "manage_quotation_delivery_fee": "50000",
  "manage_quotation_other": "20000",
  "manage_quotation_payment_presentase": "50",
  "manage_quotation_payment_nominal": "500000",
  "manage_quotation_description": "Description here"
}
```

### 4. Update Quotation
- **Method**: PUT
- **URL**: `/api/quotation/manage-quotation/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: (same as create)

### 5. Delete Quotation (soft delete)
- **Method**: DELETE
- **URL**: `/api/quotation/manage-quotation/:id`
- **Headers**: `Authorization: Bearer <token>`

### 6. Restore Quotation
- **Method**: POST
- **URL**: `/api/quotation/manage-quotation/:id/restore`
- **Headers**: `Authorization: Bearer <token>`

## Database Schema

Table: `manage_quotations`

| Column | Type | Description |
|--------|------|-------------|
| manage_quotation_id | uuid (PK) | Primary key |
| manage_quotation_no | string | Nomor quotation |
| customer_id | uuid | ID customer |
| employee_id | uuid | ID employee |
| island_id | uuid (nullable) | ID island |
| manage_quotation_date | date | Tanggal quotation |
| manage_quotation_valid_date | date | Tanggal berlaku quotation |
| manage_quotation_grand_total | string | Total keseluruhan |
| manage_quotation_ppn | string | PPN |
| manage_quotation_delivery_fee | string | Biaya pengiriman |
| manage_quotation_other | string | Biaya lain-lain |
| manage_quotation_payment_presentase | string | Presentase pembayaran |
| manage_quotation_payment_nominal | string | Nominal pembayaran |
| manage_quotation_description | text | Deskripsi |
| created_at | timestamp | Waktu dibuat |
| created_by | uuid | Dibuat oleh |
| updated_at | timestamp | Waktu diubah |
| updated_by | uuid | Diubah oleh |
| deleted_at | timestamp | Waktu dihapus (nullable) |
| deleted_by | uuid | Dihapus oleh |
| is_delete | boolean | Flag soft delete |

## Features

- ✅ Pagination dengan page dan limit
- ✅ Search by quotation number, customer_id, atau employee_id
- ✅ Sort by multiple columns
- ✅ Soft delete dengan is_delete flag
- ✅ Restore functionality
- ✅ Auto-populate created_by, updated_by, deleted_by dari token JWT
- ✅ Input validation
- ✅ Swagger documentation

## Authentication

Semua endpoint memerlukan autentikasi menggunakan Bearer Token (JWT).

Token akan di-decode untuk mendapatkan user ID yang digunakan untuk:
- `created_by` pada saat create
- `updated_by` pada saat update
- `deleted_by` pada saat delete

