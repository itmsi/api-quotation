# Term Content Module

Module ini menyediakan API CRUD untuk mengelola `term_contents` yang terhubung dengan `manage_quotations`.

## Endpoints

- `POST /api/quotation/term_content/get` — Mendapatkan daftar term content dengan paginasi, pencarian, dan sorting.
- `POST /api/quotation/term_content` — Membuat term content baru.
- `GET /api/quotation/term_content/:id` — Mengambil detail term content berdasarkan ID.
- `PUT /api/quotation/term_content/:id` — Memperbarui term content.
- `DELETE /api/quotation/term_content/:id` — Menghapus (soft delete) term content.

Seluruh endpoint menggunakan `verifyToken` untuk proteksi dan memanfaatkan middleware validasi bawaan project.


