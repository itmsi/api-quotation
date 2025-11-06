/**
 * Migration: Create mst_feature_child_product table
 */

exports.up = function(knex) {
  return knex.schema.createTable('mst_feature_child_product', (table) => {
    table.uuid('feature_child_product_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('feature_product_id').nullable();
    table.string('feature_child_product_title_id', 200).nullable();
    table.string('feature_child_product_title_en', 200).nullable();
    table.string('feature_child_product_title_cn', 200).nullable();
    table.text('feature_child_product_description_id').nullable();
    table.text('feature_child_product_description_en').nullable();
    table.text('feature_child_product_description_cn').nullable();
    table.string('feature_child_product_image', 220).nullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at', { useTz: true }).nullable();
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at', { useTz: true }).nullable();
    table.uuid('deleted_by').nullable();
    
    // Foreign Keys
    table.foreign('feature_product_id').references('feature_product_id').inTable('mst_feature_product');
    
    // Indexes
    table.index(['deleted_at'], 'idx_mst_feature_child_product_deleted_at');
    table.index(['created_at'], 'idx_mst_feature_child_product_created_at');
    table.index(['feature_product_id'], 'idx_mst_feature_child_product_feature_product_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('mst_feature_child_product');
};

