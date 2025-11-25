/**
 * Migration: Add msi_product column to manage_quotation_items table
 * Menambahkan kolom msi_product (varchar, nullable) ke tabel manage_quotation_items
 */

exports.up = async function (knex) {
  const tableExists = await knex.schema.hasTable('manage_quotation_items');
  if (!tableExists) {
    return;
  }

  const hasMsiProduct = await knex.schema.hasColumn('manage_quotation_items', 'msi_product');

  return knex.schema.alterTable('manage_quotation_items', (table) => {
    if (!hasMsiProduct) {
      table.string('msi_product', 255).nullable();
    }
  });
};

exports.down = async function (knex) {
  const tableExists = await knex.schema.hasTable('manage_quotation_items');
  if (!tableExists) {
    return;
  }

  return knex.schema.alterTable('manage_quotation_items', (table) => {
    table.dropColumn('msi_product');
  });
};

