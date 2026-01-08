/**
 * Migration: Add properties fields to manage_quotations and manage_quotation_items tables
 * - Menambahkan field properties (jsonb nullable) di tabel manage_quotations
 * - Menambahkan field specification_properties (jsonb nullable) di tabel manage_quotation_items
 * - Menambahkan field accesories_properties (jsonb nullable) di tabel manage_quotation_items
 */

exports.up = function (knex) {
  return knex.schema.alterTable('manage_quotations', (table) => {
    // Add properties field (jsonb nullable)
    table.jsonb('properties').nullable();
  }).then(() => {
    return knex.schema.alterTable('manage_quotation_items', (table) => {
      // Add specification_properties field (jsonb nullable)
      table.jsonb('specification_properties').nullable();

      // Add accesories_properties field (jsonb nullable)
      table.jsonb('accesories_properties').nullable();
    });
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('manage_quotation_items', (table) => {
    // Remove added columns from manage_quotation_items
    table.dropColumn('accesories_properties');
    table.dropColumn('specification_properties');
  }).then(() => {
    return knex.schema.alterTable('manage_quotations', (table) => {
      // Remove properties column from manage_quotations
      table.dropColumn('properties');
    });
  });
};
