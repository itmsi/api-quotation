/**
 * Migration: Remove product_dimensi_id column from componen_products table
 */

exports.up = async function (knex) {
  const hasColumn = await knex.schema.hasColumn('componen_products', 'product_dimensi_id');

  if (!hasColumn) {
    return;
  }

  await knex.raw('DROP INDEX IF EXISTS idx_componen_products_product_dimensi_id');

  return knex.schema.alterTable('componen_products', (table) => {
    table.dropColumn('product_dimensi_id');
  });
};

exports.down = async function (knex) {
  const hasColumn = await knex.schema.hasColumn('componen_products', 'product_dimensi_id');

  if (hasColumn) {
    return;
  }

  await knex.schema.alterTable('componen_products', (table) => {
    table.uuid('product_dimensi_id').nullable();
  });

  return knex.raw('CREATE INDEX IF NOT EXISTS idx_componen_products_product_dimensi_id ON componen_products (product_dimensi_id)');
};


