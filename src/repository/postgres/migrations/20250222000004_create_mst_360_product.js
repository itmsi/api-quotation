/**
 * Migration: Create mst_360_product table
 */

exports.up = function(knex) {
  return knex.schema.createTable('mst_360_product', (table) => {
    table.uuid('product_360_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('product_id').nullable();
    table.string('product_360_alt', 200).nullable();
    table.string('product_360_image', 220).nullable();
    table.string('product_360_description', 220).nullable();
    table.string('product_360_type', 220).nullable();
    table.string('sub_type_name', 220).nullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at', { useTz: true }).nullable();
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at', { useTz: true }).nullable();
    table.uuid('deleted_by').nullable();
    
    // Foreign Keys
    table.foreign('product_id').references('product_id').inTable('mst_product');
    
    // Indexes
    table.index(['deleted_at'], 'idx_mst_360_product_deleted_at');
    table.index(['created_at'], 'idx_mst_360_product_created_at');
    table.index(['product_id'], 'idx_mst_360_product_product_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('mst_360_product');
};

