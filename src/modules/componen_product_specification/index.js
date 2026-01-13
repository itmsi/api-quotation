/**
 * MODULE DISABLED
 * 
 * Module ini telah dinonaktifkan karena tabel componen_product_specifications sudah dihapus.
 * Data specifications sekarang disimpan di kolom specification_properties (JSONB) 
 * di tabel componen_products.
 * 
 * Gunakan endpoint componen_product untuk mengelola specifications melalui field
 * componen_product_specifications (JSON string).
 */

const express = require('express');
const router = express.Router();

// Return router kosong - semua endpoint sudah dinonaktifkan
// Module ini tidak lagi digunakan karena tabel sudah dihapus

module.exports = router;


