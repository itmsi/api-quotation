/**
 * Migration: Remove columns from manage_quotation_items table
 * Menghapus kolom unit_code, unit_model, segment, msi_model, wheel_no, engine, horse_power
 * karena data akan diambil dari tabel item_products melalui JOIN
 */

exports.up = function(knex) {
  return knex.schema.table('manage_quotation_items', (table) => {
    // Drop columns
    table.dropColumn('unit_code');
    table.dropColumn('unit_model');
    table.dropColumn('segment');
    table.dropColumn('msi_model');
    table.dropColumn('wheel_no');
    table.dropColumn('engine');
    table.dropColumn('horse_power');
  });
};

exports.down = function(knex) {
  return knex.schema.table('manage_quotation_items', (table) => {
    // Restore columns if needed to rollback
    table.string('unit_code', 100).nullable();
    table.string('unit_model', 100).nullable();
    table.string('segment', 100).nullable();
    table.text('msi_model').nullable();
    table.string('wheel_no', 100).nullable();
    table.string('engine', 100).nullable();
    table.string('horse_power', 100).nullable();
  });
};

