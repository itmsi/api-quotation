# Bank Account Module

Module untuk mengelola data bank account yang terhubung melalui dblink ke database gate_sso.

## 📁 Struktur File

```
src/modules/bank_account/
├── handler.js              # Request handlers / Controllers
├── postgre_repository.js   # Database operations dengan dblink
├── validation.js           # Input validation rules
├── index.js               # Route definitions
└── README.md              # Dokumentasi module (ini)
```

## 🎯 Fitur

Module ini menyediakan:
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Soft delete dengan restore functionality
- ✅ Pagination untuk list data
- ✅ Search functionality
- ✅ Sorting dengan berbagai kolom
- ✅ Input validation dengan express-validator
- ✅ Error handling yang konsisten
- ✅ Response format yang standar
- ✅ Database operations dengan dblink ke gate_sso
- ✅ Swagger/OpenAPI documentation
- ✅ Token-based authentication
- ✅ Auto-fill created_by, updated_by, deleted_by dari token

## 📊 Database Schema

Tabel `bank_accounts` di database gate_sso:

| Column | Type | Description |
|--------|------|-------------|
| bank_account_id | UUID | Primary key |
| bank_account_name | VARCHAR(255) | Nama bank account (nullable) |
| bank_account_number | VARCHAR(255) | Nomor rekening (nullable) |
| bank_account_type | VARCHAR(255) | Tipe rekening (nullable) |
| bank_account_balance | DECIMAL(10,2) | Saldo rekening (nullable) |
| created_by | UUID | User ID yang membuat (nullable) |
| created_at | TIMESTAMP | Waktu pembuatan |
| updated_by | UUID | User ID yang mengupdate (nullable) |
| updated_at | TIMESTAMP | Waktu update terakhir |
| deleted_by | UUID | User ID yang menghapus (nullable) |
| deleted_at | TIMESTAMP | Waktu soft delete (nullable) |
| is_delete | BOOLEAN | Flag soft delete |

## 🔌 API Endpoints

### 1. Get All Bank Accounts (with pagination, search, sort)
```http
POST /api/quotation/bank-account/get
Authorization: Bearer {token}
Content-Type: application/json

{
  "page": 1,
  "limit": 10,
  "search": "",
  "sort_by": "created_at",
  "sort_order": "desc"
}
```

**Request Body:**
- `page` (optional): Halaman yang ingin ditampilkan (default: 1)
- `limit` (optional): Jumlah item per halaman (default: 10, max: 100)
- `search` (optional): Pencarian berdasarkan nama, nomor, atau tipe
- `sort_by` (optional): Kolom untuk sorting (default: created_at)
- `sort_order` (optional): Urutan sorting asc/desc (default: desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "bank_account_id": "uuid",
        "bank_account_name": "Bank Mandiri",
        "bank_account_number": "1234567890",
        "bank_account_type": "Savings",
        "bank_account_balance": 1000000.00,
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### 2. Get Bank Account by ID
```http
GET /api/quotation/bank-account/:id
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bank_account_id": "uuid",
    "bank_account_name": "Bank Mandiri",
    "bank_account_number": "1234567890",
    "bank_account_type": "Savings",
    "bank_account_balance": 1000000.00,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
}
```

### 3. Create Bank Account
```http
POST /api/quotation/bank-account
Authorization: Bearer {token}
Content-Type: application/json

{
  "bank_account_name": "Bank Mandiri",
  "bank_account_number": "1234567890",
  "bank_account_type": "Savings",
  "bank_account_balance": 1000000.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bank_account_id": "uuid",
    "bank_account_name": "Bank Mandiri",
    "bank_account_number": "1234567890",
    "bank_account_type": "Savings",
    "bank_account_balance": 1000000.00,
    "created_by": "user-uuid",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Data bank account berhasil dibuat"
}
```

### 4. Update Bank Account
```http
PUT /api/quotation/bank-account/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "bank_account_name": "Bank Mandiri Updated",
  "bank_account_balance": 2000000.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bank_account_id": "uuid",
    "bank_account_name": "Bank Mandiri Updated",
    "bank_account_number": "1234567890",
    "bank_account_type": "Savings",
    "bank_account_balance": 2000000.00,
    "updated_by": "user-uuid",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T10:00:00.000Z"
  },
  "message": "Data bank account berhasil diupdate"
}
```

### 5. Delete Bank Account (Soft Delete)
```http
DELETE /api/quotation/bank-account/:id
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Data bank account berhasil dihapus"
}
```

### 6. Restore Deleted Bank Account
```http
POST /api/quotation/bank-account/:id/restore
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bank_account_id": "uuid",
    "bank_account_name": "Bank Mandiri",
    "bank_account_number": "1234567890",
    "bank_account_type": "Savings",
    "bank_account_balance": 1000000.00,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T10:00:00.000Z",
    "deleted_at": null,
    "is_delete": false
  },
  "message": "Data bank account berhasil direstore"
}
```

## 📝 Validation Rules

### Create Validation
- `bank_account_name`: Optional, max 255 karakter
- `bank_account_number`: Optional, max 255 karakter
- `bank_account_type`: Optional, max 255 karakter
- `bank_account_balance`: Optional, harus berupa angka positif

### Update Validation
- `id`: Required, must be valid UUID
- `bank_account_name`: Optional, max 255 karakter
- `bank_account_number`: Optional, max 255 karakter
- `bank_account_type`: Optional, max 255 karakter
- `bank_account_balance`: Optional, harus berupa angka positif

### List Validation
- `page`: Optional, harus berupa angka positif
- `limit`: Optional, harus antara 1-100
- `search`: Optional, max 100 karakter
- `sort_by`: Optional, harus salah satu dari: created_at, bank_account_name, bank_account_number, bank_account_type
- `sort_order`: Optional, harus asc atau desc

## 🔐 Authentication

Semua endpoint memerlukan authentication token:
- Token harus dikirim di header Authorization dengan format: `Bearer {token}`
- Token akan di-decode untuk mendapatkan user_id/employee_id
- created_by, updated_by, deleted_by otomatis diisi dari token

## 🔗 Database Connection

Module ini menggunakan dblink untuk terhubung ke database gate_sso:
- Connection string dibuat dari environment variables
- Connection name: `gate_sso_dblink`
- Table name: `bank_accounts`

Environment variables yang diperlukan:
- `DB_GATE_SSO_NAME`
- `DB_GATE_SSO_USER`
- `DB_GATE_SSO_PASSWORD`
- `DB_GATE_SSO_HOST`
- `DB_GATE_SSO_PORT`

## 🧪 Testing

Test endpoints dengan curl atau Postman:

```bash
# Get All
curl -X POST http://localhost:3000/api/quotation/bank-account/get \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"page":1,"limit":10,"search":"","sort_by":"created_at","sort_order":"desc"}'

# Get by ID
curl -X GET http://localhost:3000/api/quotation/bank-account/{id} \
  -H "Authorization: Bearer {token}"

# Create
curl -X POST http://localhost:3000/api/quotation/bank-account \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"bank_account_name":"Bank Mandiri","bank_account_number":"1234567890","bank_account_type":"Savings","bank_account_balance":1000000.00}'

# Update
curl -X PUT http://localhost:3000/api/quotation/bank-account/{id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"bank_account_name":"Bank Mandiri Updated"}'

# Delete
curl -X DELETE http://localhost:3000/api/quotation/bank-account/{id} \
  -H "Authorization: Bearer {token}"

# Restore
curl -X POST http://localhost:3000/api/quotation/bank-account/{id}/restore \
  -H "Authorization: Bearer {token}"
```

## 📚 Best Practices

1. **Repository Pattern**: Semua database logic ada di `postgre_repository.js`
2. **Dblink Connection**: Connection ke database gate_sso menggunakan dblink
3. **Error Handling**: Selalu gunakan try-catch dan return consistent response
4. **Validation**: Validasi input sebelum masuk ke handler
5. **Soft Delete**: Gunakan `is_delete` flag untuk soft delete
6. **Pagination**: Implement pagination untuk list endpoints
7. **Search**: Search mencari di semua kolom relevant
8. **Sorting**: Sorting di berbagai kolom
9. **Authentication**: Token di-decode untuk mendapatkan user info
10. **Documentation**: Swagger documentation tersedia

## 🎯 Tips

- Semua field nullable sesuai dengan struktur tabel
- created_by, updated_by, deleted_by otomatis diisi dari token
- Gunakan search untuk mencari berdasarkan nama, nomor, atau tipe
- Sorting bisa dilakukan berdasarkan berbagai kolom
- Soft delete menggunakan flag is_delete = true
- Pastikan environment variables untuk dblink sudah di-set

---

Module ini menggunakan dblink untuk terhubung ke database gate_sso. Pastikan koneksi dblink sudah terkonfigurasi dengan benar! 🚀

