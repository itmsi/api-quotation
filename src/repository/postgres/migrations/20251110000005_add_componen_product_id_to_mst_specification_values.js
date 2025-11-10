/**
 * Migration: Add componen_product_id column to mst_specification_values table
 */

exports.up = function (knex) {
  return knex.schema.table('mst_specification_values', (table) => {
    table.uuid('componen_product_id').nullable();

    table
      .foreign('componen_product_id')
      .references('componen_product_id')
      .inTable('componen_products')
      .onDelete('SET NULL');

    table.index(
      ['componen_product_id'],
      'idx_mst_specification_values_componen_product_id'
    );
  });
};

exports.down = function (knex) {
  return knex.schema.table('mst_specification_values', (table) => {
    table.dropIndex(
      ['componen_product_id'],
      'idx_mst_specification_values_componen_product_id'
    );
    table.dropForeign('componen_product_id');
    table.dropColumn('componen_product_id');
  });
};


