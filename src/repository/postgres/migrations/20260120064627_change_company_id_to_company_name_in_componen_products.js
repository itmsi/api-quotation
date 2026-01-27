/**
 * Migration: Change company_id to company_name in componen_products table
 * Mengganti kolom company_id (uuid) menjadi company_name (varchar) di tabel componen_products
 * 
 * CATATAN PENTING:
 * - Kolom company_id (UUID) akan dihapus
 * - Kolom company_name (VARCHAR 255) akan ditambahkan
 * - Data company_id yang ada akan hilang (pastikan backup jika diperlukan)
 */

exports.up = async function (knex) {
  const tableExists = await knex.schema.hasTable('componen_products');
  if (!tableExists) {
    return;
  }

  const hasCompanyId = await knex.schema.hasColumn('componen_products', 'company_id');
  const hasCompanyName = await knex.schema.hasColumn('componen_products', 'company_name');

  return knex.schema.alterTable('componen_products', (table) => {
    // Drop company_id dan indexnya jika ada
    if (hasCompanyId) {
      // Drop index terlebih dahulu jika ada
      try {
        table.dropIndex(['company_id'], 'idx_componen_products_company_id');
      } catch (error) {
        // Index mungkin tidak ada, abaikan error
      }
      table.dropColumn('company_id');
    }

    // Tambah company_name jika belum ada
    if (!hasCompanyName) {
      table.string('company_name', 255).nullable();
      table.index(['company_name'], 'idx_componen_products_company_name');
    }
  });
};

exports.down = async function (knex) {
  const tableExists = await knex.schema.hasTable('componen_products');
  if (!tableExists) {
    return;
  }

  const hasCompanyName = await knex.schema.hasColumn('componen_products', 'company_name');
  const hasCompanyId = await knex.schema.hasColumn('componen_products', 'company_id');

  return knex.schema.alterTable('componen_products', (table) => {
    // Drop company_name dan indexnya jika ada
    if (hasCompanyName) {
      try {
        table.dropIndex(['company_name'], 'idx_componen_products_company_name');
      } catch (error) {
        // Index mungkin tidak ada, abaikan error
      }
      table.dropColumn('company_name');
    }

    // Kembalikan company_id jika belum ada
    if (!hasCompanyId) {
      table.uuid('company_id').nullable();
      table.index(['company_id'], 'idx_componen_products_company_id');
    }
  });
};
