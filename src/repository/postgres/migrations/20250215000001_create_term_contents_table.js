/**
 * Migration: Create term_contents table
 * Menyimpan konten term quotation
 */

exports.up = function(knex) {
  return knex.schema.createTable('term_contents', (table) => {
    table.uuid('term_content_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('manage_quotation_id').notNullable();
    table.text('term_content_directory').nullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at').nullable();
    table.uuid('deleted_by').nullable();
    table.boolean('is_delete').defaultTo(false);

    table.foreign('manage_quotation_id').references('manage_quotation_id').inTable('manage_quotations');

    table.index(['manage_quotation_id'], 'idx_term_contents_manage_quotation_id');
    table.index(['created_at'], 'idx_term_contents_created_at');
    table.index(['is_delete'], 'idx_term_contents_is_delete');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('term_contents');
};


