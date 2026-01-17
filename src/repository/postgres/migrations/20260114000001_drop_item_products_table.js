/**
 * Migration: Drop item_products table
 * 
 * Tabel ini dihapus karena sudah digantikan dengan tabel componen_products.
 * Migration 20250224000002 sudah mengubah item_product_id menjadi componen_product_id
 * di tabel manage_quotation_items dengan foreign key ke componen_products.
 * 
 * Migration ini akan menghapus:
 * - Tabel item_products
 * - Index yang terkait
 * 
 * Catatan: Pastikan tidak ada foreign key constraint yang masih mengacu ke tabel ini.
 */

exports.up = function (knex) {
  return knex.schema.dropTableIfExists('item_products');
};

exports.down = function (knex) {
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
    
    // Additional columns from migration 20250221000001
    table.string('item_product_drive_type', 255).nullable();
    table.string('item_product_gvw', 255).nullable();
    table.string('item_product_wheel_base', 255).nullable();
    table.string('item_product_engine_brand_model', 255).nullable();
    table.string('item_product_power_output', 255).nullable();
    table.string('item_product_max_torque', 255).nullable();
    table.string('item_product_displacement', 255).nullable();
    table.string('item_product_emission_standard', 255).nullable();
    table.string('item_product_engine_guard', 255).nullable();
    table.string('item_product_gearbox_transmission', 255).nullable();
    table.string('item_product_fuel_tank_capacity', 255).nullable();
    table.string('item_product_tire_size', 255).nullable();
    table.string('item_product_cargobox_vessel', 255).nullable();
    
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

