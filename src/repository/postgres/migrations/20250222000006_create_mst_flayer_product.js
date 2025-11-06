/**
 * Migration: Create mst_flayer_product table
 */

exports.up = function(knex) {
  return knex.schema.createTable('mst_flayer_product', (table) => {
    table.uuid('flayer_product_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('product_id').nullable();
    table.string('flayer_product_name_id', 200).nullable();
    table.string('flayer_product_name_en', 200).nullable();
    table.string('flayer_product_name_cn', 200).nullable();
    table.string('flayer_product_description', 220).nullable();
    table.string('flayer_product_file', 200).nullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at', { useTz: true }).nullable();
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at', { useTz: true }).nullable();
    table.uuid('deleted_by').nullable();
    
    // Foreign Keys
    table.foreign('product_id').references('product_id').inTable('mst_product');
    
    // Indexes
    table.index(['deleted_at'], 'idx_mst_flayer_product_deleted_at');
    table.index(['created_at'], 'idx_mst_flayer_product_created_at');
    table.index(['product_id'], 'idx_mst_flayer_product_product_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('mst_flayer_product');
};

