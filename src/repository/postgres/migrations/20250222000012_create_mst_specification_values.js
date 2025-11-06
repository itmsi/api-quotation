/**
 * Migration: Create mst_specification_values table
 */

exports.up = function(knex) {
  return knex.schema.createTable('mst_specification_values', (table) => {
    table.uuid('specification_value_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('specification_label_id').nullable();
    table.uuid('product_id').nullable();
    table.uuid('product_dimensi_id').nullable();
    table.text('specification_value_name').nullable();
    table.text('description').nullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at', { useTz: true }).nullable();
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at', { useTz: true }).nullable();
    table.uuid('deleted_by').nullable();
    
    // Foreign Keys
    table.foreign('specification_label_id').references('specification_label_id').inTable('mst_specification_labels');
    table.foreign('product_id').references('product_id').inTable('mst_product');
    table.foreign('product_dimensi_id').references('product_dimensi_id').inTable('mst_product_dimensi');
    
    // Indexes
    table.index(['deleted_at'], 'idx_mst_specification_values_deleted_at');
    table.index(['created_at'], 'idx_mst_specification_values_created_at');
    table.index(['specification_label_id'], 'idx_mst_specification_values_specification_label_id');
    table.index(['product_id'], 'idx_mst_specification_values_product_id');
    table.index(['product_dimensi_id'], 'idx_mst_specification_values_product_dimensi_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('mst_specification_values');
};

