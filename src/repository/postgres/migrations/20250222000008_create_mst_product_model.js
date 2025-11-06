/**
 * Migration: Create mst_product_model table
 */

exports.up = function(knex) {
  return knex.schema.createTable('mst_product_model', (table) => {
    table.uuid('product_model_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('product_id').nullable();
    table.string('product_model_name', 200).nullable();
    table.string('product_model_description', 200).nullable();
    table.string('product_model_foto', 220).nullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at', { useTz: true }).nullable();
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at', { useTz: true }).nullable();
    table.uuid('deleted_by').nullable();
    
    // Foreign Keys
    table.foreign('product_id').references('product_id').inTable('mst_product');
    
    // Indexes
    table.index(['deleted_at'], 'idx_mst_product_model_deleted_at');
    table.index(['created_at'], 'idx_mst_product_model_created_at');
    table.index(['product_id'], 'idx_mst_product_model_product_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('mst_product_model');
};

