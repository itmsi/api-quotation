/**
 * Migration: Add componen_product_id column to manage_quotation_item_accessories table
 */

exports.up = function (knex) {
  return knex.schema.table('manage_quotation_item_accessories', (table) => {
    table.uuid('componen_product_id').nullable();

    table
      .foreign('componen_product_id')
      .references('componen_product_id')
      .inTable('componen_products')
      .onDelete('SET NULL');

    table.index(['componen_product_id'], 'idx_mq_item_accessories_componen_product_id');
  });
};

exports.down = function (knex) {
  return knex.schema.table('manage_quotation_item_accessories', (table) => {
    table.dropIndex([], 'idx_mq_item_accessories_componen_product_id');
    table.dropForeign('componen_product_id');
    table.dropColumn('componen_product_id');
  });
};


