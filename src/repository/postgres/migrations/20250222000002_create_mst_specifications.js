/**
 * Migration: Create mst_specifications table
 */

exports.up = function(knex) {
  return knex.schema.createTable('mst_specifications', (table) => {
    table.uuid('specification_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.text('specification_name').nullable();
    table.text('description').nullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at', { useTz: true }).nullable();
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at', { useTz: true }).nullable();
    table.uuid('deleted_by').nullable();
    
    // Indexes
    table.index(['deleted_at'], 'idx_mst_specifications_deleted_at');
    table.index(['created_at'], 'idx_mst_specifications_created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('mst_specifications');
};

