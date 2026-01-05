/**
 * Migration: Alter quotes columns to integer
 * Migration file untuk menjaga konsistensi history migration
 * File ini dibuat untuk mengatasi error migration yang hilang
 */

exports.up = function(knex) {
  // Migration sudah pernah dijalankan sebelumnya
  // Tidak perlu melakukan perubahan apapun
  return Promise.resolve();
};

exports.down = function(knex) {
  // Rollback tidak diperlukan
  return Promise.resolve();
};

