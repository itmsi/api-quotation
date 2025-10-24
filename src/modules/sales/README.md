# Sales Module

Module untuk mengelola data sales employee dari database gate_sso menggunakan dblink.

## Endpoints

### 1. Get All Sales Employees
- **Method**: POST
- **Endpoint**: `/api/quotation/sales/get`
- **Authentication**: Required (Bearer Token)
- **Description**: Mengambil daftar sales employees dengan pagination, search, dan sorting

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
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### 2. Get Sales Employee by ID
- **Method**: GET
- **Endpoint**: `/api/quotation/sales/:id`
- **Authentication**: Required (Bearer Token)
- **Description**: Mengambil detail sales employee berdasarkan ID

**Response:**
```json
{
  "success": true,
  "data": {
    "employee_id": "uuid",
    "employee_name": "John Doe",
    "employee_email": "john.doe@example.com",
    "employee_phone": "+6281234567890",
    "department_id": "uuid",
    "title_id": "uuid",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

## Database

Module ini menggunakan dblink untuk mengakses tabel `employees` di database `gate_sso`.

### Tabel yang Digunakan
- **Database**: gate_sso
- **Tabel**: employees
- **Columns**: 
  - employee_id (uuid)
  - employee_name (varchar)
  - employee_email (varchar)
  - employee_phone (varchar)
  - department_id (uuid)
  - title_id (uuid)
  - created_at (timestamp)

## Environment Variables

Pastikan environment variables berikut sudah diatur:
- `DB_GATE_SSO_NAME`
- `DB_GATE_SSO_USER`
- `DB_GATE_SSO_PASSWORD`
- `DB_GATE_SSO_HOST`
- `DB_GATE_SSO_PORT`

## Validasi

### List Validation
- `page`: Integer, minimal 1
- `limit`: Integer, antara 1-100
- `search`: String, maksimal 100 karakter
- `sort_by`: Enum ['created_at', 'employee_name', 'employee_email']
- `sort_order`: Enum ['asc', 'desc']

### Get by ID Validation
- `id`: UUID, wajib diisi

## Authentication

Semua endpoint memerlukan Bearer Token. Token akan di-decode untuk mendapatkan user_id/employee_id yang digunakan untuk:
- created_by
- updated_by
- deleted_by

## Files Structure

```
src/modules/sales/
├── index.js              # Routes definition
├── handler.js            # Request handlers
├── postgre_repository.js # Database operations
├── validation.js        # Input validation rules
└── README.md            # Documentation
```

## Usage Example

```javascript
// Get all sales employees
const response = await fetch('/api/quotation/sales/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    page: 1,
    limit: 10,
    search: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  })
});

// Get sales employee by ID
const response = await fetch('/api/quotation/sales/UUID_HERE', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
```

