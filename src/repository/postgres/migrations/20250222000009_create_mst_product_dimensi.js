/**
 * Migration: Create mst_product_dimensi table
 */

exports.up = function(knex) {
  return knex.schema.createTable('mst_product_dimensi', (table) => {
    table.uuid('product_dimensi_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('product_model_id').nullable();
    table.string('product_dimensi_value', 200).nullable();
    table.string('product_dimensi_description', 200).nullable();
    table.string('product_flayer').nullable();
    table.text('product_dimensi_foto').nullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at', { useTz: true }).nullable();
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at', { useTz: true }).nullable();
    table.uuid('deleted_by').nullable();
    
    // Foreign Keys
    table.foreign('product_model_id').references('product_model_id').inTable('mst_product_model');
    
    // Indexes
    table.index(['deleted_at'], 'idx_mst_product_dimensi_deleted_at');
    table.index(['created_at'], 'idx_mst_product_dimensi_created_at');
    table.index(['product_model_id'], 'idx_mst_product_dimensi_product_model_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('mst_product_dimensi');
};

