/**
 * Migration: Add volume column to componen_products table
 */

exports.up = function (knex) {
  return knex.schema.table('componen_products', (table) => {
    table.string('volume', 255).nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.table('componen_products', (table) => {
    table.dropColumn('volume');
  });
};


