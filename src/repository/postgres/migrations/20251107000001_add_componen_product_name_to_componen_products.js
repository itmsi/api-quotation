/**
 * Migration: Add componen_product_name column to componen_products table
 */

exports.up = function (knex) {
  return knex.schema.table('componen_products', (table) => {
    table.string('componen_product_name', 255).nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.table('componen_products', (table) => {
    table.dropColumn('componen_product_name');
  });
};


