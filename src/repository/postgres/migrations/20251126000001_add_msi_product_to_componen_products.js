/**
 * Migration: Add msi_product column to componen_products table
 * Menambahkan kolom msi_product (varchar, nullable) ke tabel componen_products
 */

exports.up = async function (knex) {
  const tableExists = await knex.schema.hasTable('componen_products');
  if (!tableExists) {
    return;
  }

  const hasMsiProduct = await knex.schema.hasColumn('componen_products', 'msi_product');

  return knex.schema.alterTable('componen_products', (table) => {
    if (!hasMsiProduct) {
      table.string('msi_product', 255).nullable();
    }
  });
};

exports.down = async function (knex) {
  const tableExists = await knex.schema.hasTable('componen_products');
  if (!tableExists) {
    return;
  }

  return knex.schema.alterTable('componen_products', (table) => {
    table.dropColumn('msi_product');
  });
};

