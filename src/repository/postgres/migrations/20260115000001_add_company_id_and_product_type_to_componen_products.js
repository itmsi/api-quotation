/**
 * Migration: Add company_id and product_type columns to componen_products table
 * Menambahkan kolom company_id (uuid nullable) dan product_type (varchar nullable) ke tabel componen_products
 */

exports.up = async function (knex) {
  const tableExists = await knex.schema.hasTable('componen_products');
  if (!tableExists) {
    return;
  }

  const hasCompanyId = await knex.schema.hasColumn('componen_products', 'company_id');
  const hasProductType = await knex.schema.hasColumn('componen_products', 'product_type');

  return knex.schema.alterTable('componen_products', (table) => {
    if (!hasCompanyId) {
      table.uuid('company_id').nullable();
      table.index(['company_id'], 'idx_componen_products_company_id');
    }
    if (!hasProductType) {
      table.string('product_type', 255).nullable();
      table.index(['product_type'], 'idx_componen_products_product_type');
    }
  });
};

exports.down = async function (knex) {
  const tableExists = await knex.schema.hasTable('componen_products');
  if (!tableExists) {
    return;
  }

  return knex.schema.alterTable('componen_products', (table) => {
    table.dropIndex(['company_id'], 'idx_componen_products_company_id');
    table.dropColumn('company_id');
    table.dropIndex(['product_type'], 'idx_componen_products_product_type');
    table.dropColumn('product_type');
  });
};

