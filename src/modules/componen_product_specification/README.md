# Componen Product Specification Module

Module ini menyediakan API CRUD untuk mengelola data `componen_product_specifications`, termasuk fitur pencarian, pemeringkatan, dan paginasi.

## Endpoint

- `POST /api/quotation/componen_product/specification/get`
- `POST /api/quotation/componen_product/specification/create`
- `GET /api/quotation/componen_product/specification/:id`
- `PUT /api/quotation/componen_product/specification/:id`
- `DELETE /api/quotation/componen_product/specification/:id`

Semua endpoint dilindungi menggunakan middleware `verifyToken`. Field audit (`created_by`, `updated_by`, `deleted_by`) diisi otomatis dari token yang dikirimkan.


