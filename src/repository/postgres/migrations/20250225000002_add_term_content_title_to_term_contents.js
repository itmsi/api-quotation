/**
 * Migration: Add term_content_title to term_contents table
 * Menambahkan kolom title untuk term content
 */

exports.up = function(knex) {
  return knex.schema.table('term_contents', (table) => {
    table.string('term_content_title', 255).nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('term_contents', (table) => {
    table.dropColumn('term_content_title');
  });
};

