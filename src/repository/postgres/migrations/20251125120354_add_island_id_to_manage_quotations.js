/**
 * Migration: Add island_id column to manage_quotations table
 * Menambahkan kolom island_id (uuid, nullable) untuk referensi ke island
 */

exports.up = async function (knex) {
  const tableExists = await knex.schema.hasTable('manage_quotations');
  if (!tableExists) {
    return;
  }

  const hasIslandId = await knex.schema.hasColumn('manage_quotations', 'island_id');

  return knex.schema.alterTable('manage_quotations', (table) => {
    if (!hasIslandId) {
      table.uuid('island_id').nullable();
      table.index(['island_id'], 'idx_manage_quotations_island_id');
    }
  });
};

exports.down = async function (knex) {
  const tableExists = await knex.schema.hasTable('manage_quotations');
  if (!tableExists) {
    return;
  }

  return knex.schema.alterTable('manage_quotations', (table) => {
    table.dropIndex('idx_manage_quotations_island_id');
    table.dropColumn('island_id');
  });
};

