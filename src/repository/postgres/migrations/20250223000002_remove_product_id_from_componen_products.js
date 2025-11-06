/**
 * Migration: Remove product_id column from componen_products table
 * Menghapus kolom product_id dari tabel componen_products
 */

exports.up = function(knex) {
  return knex.schema.table('componen_products', (table) => {
    // Drop index first
    table.dropIndex(['product_id'], 'idx_componen_products_product_id');
    // Drop column
    table.dropColumn('product_id');
  });
};

exports.down = function(knex) {
  return knex.schema.table('componen_products', (table) => {
    // Add column back
    table.uuid('product_id').nullable();
    // Add index back
    table.index(['product_id'], 'idx_componen_products_product_id');
  });
};

