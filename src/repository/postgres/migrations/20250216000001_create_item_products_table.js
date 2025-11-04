/**
 * Migration: Create item_products table
 * Menyimpan data produk item
 */

exports.up = function(knex) {
  return knex.schema.createTable('item_products', (table) => {
    // Primary Key
    table.uuid('item_product_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    
    // Data fields
    table.string('item_product_code', 255).nullable();
    table.string('item_product_model', 255).nullable();
    table.string('item_product_segment', 255).nullable();
    table.string('item_product_msi_model', 255).nullable();
    table.string('item_product_wheel_no', 255).nullable();
    table.string('item_product_engine', 255).nullable();
    table.string('item_product_horse_power', 255).nullable();
    table.string('item_product_market_price', 255).nullable();
    table.string('item_product_selling_price_star_1', 255).nullable();
    table.string('item_product_selling_price_star_2', 255).nullable();
    table.string('item_product_selling_price_star_3', 255).nullable();
    table.string('item_product_selling_price_star_4', 255).nullable();
    table.string('item_product_selling_price_star_5', 255).nullable();
    table.text('item_product_description').nullable();
    table.text('item_product_image').nullable();
    
    // Timestamps and audit fields
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at').nullable();
    table.uuid('deleted_by').nullable();
    table.boolean('is_delete').defaultTo(false);

    // Indexes for better query performance
    table.index(['item_product_code'], 'idx_item_products_code');
    table.index(['item_product_model'], 'idx_item_products_model');
    table.index(['created_at'], 'idx_item_products_created_at');
    table.index(['is_delete'], 'idx_item_products_is_delete');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('item_products');
};

