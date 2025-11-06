/**
 * Migration: Create componen_products table
 * Menyimpan data component product
 */

exports.up = function(knex) {
  return knex.schema.createTable('componen_products', (table) => {
    // Primary Key
    table.uuid('componen_product_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    
    // Foreign Keys
    table.uuid('product_id').nullable();
    table.uuid('product_dimensi_id').nullable();
    
    // Data fields
    table.string('code_unique', 255).nullable();
    table.string('segment', 255).nullable();
    table.string('msi_model', 255).nullable();
    table.string('wheel_no', 255).nullable();
    table.string('engine', 255).nullable();
    table.string('horse_power', 255).nullable();
    table.string('market_price', 255).nullable();
    table.string('selling_price_star_1', 255).nullable();
    table.string('selling_price_star_2', 255).nullable();
    table.string('selling_price_star_3', 255).nullable();
    table.string('selling_price_star_4', 255).nullable();
    table.string('selling_price_star_5', 255).nullable();
    table.text('image').nullable();
    table.text('componen_product_description').nullable();
    
    // Timestamps and audit fields
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at').nullable();
    table.uuid('deleted_by').nullable();
    table.boolean('is_delete').defaultTo(false);

    // Indexes for better query performance
    table.index(['product_id'], 'idx_componen_products_product_id');
    table.index(['product_dimensi_id'], 'idx_componen_products_product_dimensi_id');
    table.index(['code_unique'], 'idx_componen_products_code_unique');
    table.index(['created_at'], 'idx_componen_products_created_at');
    table.index(['is_delete'], 'idx_componen_products_is_delete');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('componen_products');
};

