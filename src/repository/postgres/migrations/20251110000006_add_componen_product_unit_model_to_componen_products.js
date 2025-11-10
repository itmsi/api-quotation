/**
 * Migration: Add componen_product_unit_model column to componen_products table
 */

exports.up = function (knex) {
  return knex.schema.table('componen_products', (table) => {
    table.string('componen_product_unit_model', 255).nullable();
    table.index(
      ['componen_product_unit_model'],
      'idx_componen_products_unit_model'
    );
  });
};

exports.down = function (knex) {
  return knex.schema.table('componen_products', (table) => {
    table.dropIndex(
      ['componen_product_unit_model'],
      'idx_componen_products_unit_model'
    );
    table.dropColumn('componen_product_unit_model');
  });
};


