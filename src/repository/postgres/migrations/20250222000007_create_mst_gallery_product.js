/**
 * Migration: Create mst_gallery_product table
 */

exports.up = function(knex) {
  return knex.schema.createTable('mst_gallery_product', (table) => {
    table.uuid('gallery_product_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('product_id').nullable();
    table.string('gallery_product_alt', 200).nullable();
    table.string('gallery_product_image', 220).nullable();
    table.string('gallery_product_description', 220).nullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at', { useTz: true }).nullable();
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at', { useTz: true }).nullable();
    table.uuid('deleted_by').nullable();
    
    // Foreign Keys
    table.foreign('product_id').references('product_id').inTable('mst_product');
    
    // Indexes
    table.index(['deleted_at'], 'idx_mst_gallery_product_deleted_at');
    table.index(['created_at'], 'idx_mst_gallery_product_created_at');
    table.index(['product_id'], 'idx_mst_gallery_product_product_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('mst_gallery_product');
};

