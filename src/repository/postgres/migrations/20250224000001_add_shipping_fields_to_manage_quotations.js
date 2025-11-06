/**
 * Migration: Add shipping_term, franco, lead_time columns to manage_quotations table
 * Menambahkan kolom shipping_term, franco, lead_time dengan varchar(255) nullable
 */

exports.up = function(knex) {
  return knex.schema.table('manage_quotations', (table) => {
    table.string('manage_quotation_shipping_term', 255).nullable();
    table.string('manage_quotation_franco', 255).nullable();
    table.string('manage_quotation_lead_time', 255).nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('manage_quotations', (table) => {
    table.dropColumn('manage_quotation_shipping_term');
    table.dropColumn('manage_quotation_franco');
    table.dropColumn('manage_quotation_lead_time');
  });
};

