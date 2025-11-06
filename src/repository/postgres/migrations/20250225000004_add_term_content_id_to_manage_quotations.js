/**
 * Migration: Add term_content_id to manage_quotations table
 * Menambahkan field untuk referensi ke term_contents (nullable)
 */

exports.up = function(knex) {
  return knex.schema.table('manage_quotations', (table) => {
    table.uuid('term_content_id').nullable();
    table.foreign('term_content_id').references('term_content_id').inTable('term_contents');
    table.index(['term_content_id'], 'idx_manage_quotations_term_content_id');
  });
};

exports.down = function(knex) {
  return knex.schema.table('manage_quotations', (table) => {
    table.dropForeign('term_content_id');
    table.dropIndex('idx_manage_quotations_term_content_id');
    table.dropColumn('term_content_id');
  });
};

