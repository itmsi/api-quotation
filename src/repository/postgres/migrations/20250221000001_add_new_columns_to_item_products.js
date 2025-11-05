/**
 * Migration: Add new columns to item_products table
 * Menambahkan kolom-kolom baru untuk spesifikasi produk yang lebih detail
 */

exports.up = function(knex) {
  return knex.schema.alterTable('item_products', (table) => {
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
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('item_products', (table) => {
    table.dropColumn('item_product_drive_type');
    table.dropColumn('item_product_gvw');
    table.dropColumn('item_product_wheel_base');
    table.dropColumn('item_product_engine_brand_model');
    table.dropColumn('item_product_power_output');
    table.dropColumn('item_product_max_torque');
    table.dropColumn('item_product_displacement');
    table.dropColumn('item_product_emission_standard');
    table.dropColumn('item_product_engine_guard');
    table.dropColumn('item_product_gearbox_transmission');
    table.dropColumn('item_product_fuel_tank_capacity');
    table.dropColumn('item_product_tire_size');
    table.dropColumn('item_product_cargobox_vessel');
  });
};

