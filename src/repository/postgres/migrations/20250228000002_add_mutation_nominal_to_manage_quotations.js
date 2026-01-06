/**
 * Migration: Add manage_quotation_mutation_nominal to manage_quotations table
 * Menambahkan field manage_quotation_mutation_nominal (decimal precision: 15, scale: 2)
 */

exports.up = function(knex) {
  return knex.schema.alterTable('manage_quotations', (table) => {
    // Add mutation nominal field (decimal with precision 15, scale 2)
    table.decimal('manage_quotation_mutation_nominal', 15, 2).nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('manage_quotations', (table) => {
    // Remove mutation nominal column
    table.dropColumn('manage_quotation_mutation_nominal');
  });
};

