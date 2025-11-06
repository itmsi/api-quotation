/**
 * Migration: Add term_content_directory to manage_quotations table
 * Menambahkan field untuk menyimpan path file JSON term content
 */

exports.up = function(knex) {
  return knex.schema.table('manage_quotations', (table) => {
    table.text('term_content_directory').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('manage_quotations', (table) => {
    table.dropColumn('term_content_directory');
  });
};

