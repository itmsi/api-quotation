/**
 * Migration: Add order_number column to manage_quotation_items table
 * Menambahkan kolom order_number (int default 0) untuk urutan item dalam quotation
 */

exports.up = function(knex) {
  return knex.schema.table('manage_quotation_items', (table) => {
    table.integer('order_number').defaultTo(0).notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('manage_quotation_items', (table) => {
    table.dropColumn('order_number');
  });
};

