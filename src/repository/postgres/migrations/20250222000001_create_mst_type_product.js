/**
 * Migration: Create mst_type_product table
 */

exports.up = function(knex) {
  return knex.schema.createTable('mst_type_product', (table) => {
    table.uuid('type_product_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('type_product_name_id', 200).nullable();
    table.string('type_product_name_en', 200).nullable();
    table.string('type_product_name_cn', 200).nullable();
    table.string('type_product_description', 220).nullable();
    table.string('slug_type_product', 200).nullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at', { useTz: true }).nullable();
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at', { useTz: true }).nullable();
    table.uuid('deleted_by').nullable();
    
    // Indexes
    table.index(['deleted_at'], 'idx_mst_type_product_deleted_at');
    table.index(['created_at'], 'idx_mst_type_product_created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('mst_type_product');
};

