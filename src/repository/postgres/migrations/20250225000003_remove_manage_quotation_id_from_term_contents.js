/**
 * Migration: Remove manage_quotation_id from term_contents table
 * Menghapus kolom manage_quotation_id dan foreign key constraint
 */

exports.up = function(knex) {
  return knex.schema.table('term_contents', (table) => {
    // Drop foreign key constraint first
    table.dropForeign('manage_quotation_id');
    // Drop index
    table.dropIndex(['manage_quotation_id'], 'idx_term_contents_manage_quotation_id');
    // Drop column
    table.dropColumn('manage_quotation_id');
  });
};

exports.down = function(knex) {
  return knex.schema.table('term_contents', (table) => {
    // Re-add column
    table.uuid('manage_quotation_id').nullable();
    // Re-add foreign key
    table.foreign('manage_quotation_id').references('manage_quotation_id').inTable('manage_quotations');
    // Re-add index
    table.index(['manage_quotation_id'], 'idx_term_contents_manage_quotation_id');
  });
};

