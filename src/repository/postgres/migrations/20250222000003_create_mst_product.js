/**
 * Migration: Create mst_product table
 */

exports.up = function(knex) {
  return knex.schema.createTable('mst_product', (table) => {
    table.uuid('product_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('type_product_id').nullable();
    table.string('product_name_id', 200).nullable();
    table.string('product_name_en', 200).nullable();
    table.string('product_name_cn', 200).nullable();
    table.string('banner_product', 200).nullable();
    table.string('tagline_banner_product_id', 200).nullable();
    table.string('tagline_banner_product_en', 200).nullable();
    table.string('tagline_banner_product_cn', 200).nullable();
    table.string('image_product', 200).nullable();
    table.text('product_description_id').nullable();
    table.text('product_description_en').nullable();
    table.text('product_description_cn').nullable();
    table.string('slug_product', 200).nullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at', { useTz: true }).nullable();
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at', { useTz: true }).nullable();
    table.uuid('deleted_by').nullable();
    
    // Foreign Keys
    table.foreign('type_product_id').references('type_product_id').inTable('mst_type_product');
    
    // Indexes
    table.index(['deleted_at'], 'idx_mst_product_deleted_at');
    table.index(['created_at'], 'idx_mst_product_created_at');
    table.index(['type_product_id'], 'idx_mst_product_type_product_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('mst_product');
};

