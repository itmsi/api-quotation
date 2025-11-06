/**
 * Migration: Create mst_specification_labels table
 */

exports.up = function(knex) {
  return knex.schema.createTable('mst_specification_labels', (table) => {
    table.uuid('specification_label_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('specification_id').nullable();
    table.text('specification_label_name').nullable();
    table.text('description').nullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at', { useTz: true }).nullable();
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at', { useTz: true }).nullable();
    table.uuid('deleted_by').nullable();
    
    // Foreign Keys
    table.foreign('specification_id').references('specification_id').inTable('mst_specifications');
    
    // Indexes
    table.index(['deleted_at'], 'idx_mst_specification_labels_deleted_at');
    table.index(['created_at'], 'idx_mst_specification_labels_created_at');
    table.index(['specification_id'], 'idx_mst_specification_labels_specification_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('mst_specification_labels');
};

