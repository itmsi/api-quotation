/**
 * Migration: Add additional columns to manage_quotation_items and manage_quotation_item_accessories
 */

exports.up = function(knex) {
  return knex.schema
    .table('manage_quotation_items', (table) => {
      table.string('code_unique', 255).nullable();
      table.string('segment', 255).nullable();
      table.string('msi_model', 255).nullable();
      table.string('wheel_no', 255).nullable();
      table.string('engine', 255).nullable();
      table.string('volume', 255).nullable();
      table.string('horse_power', 255).nullable();
      table.string('market_price', 255).nullable();
      table.string('componen_product_name', 255).nullable();
    })
    .table('manage_quotation_item_accessories', (table) => {
      table.string('accessory_part_number', 255).nullable();
      table.string('accessory_part_name', 255).nullable();
      table.string('accessory_specification', 255).nullable();
      table.string('accessory_brand', 255).nullable();
      table.string('accessory_remark', 255).nullable();
      table.string('accessory_region', 255).nullable();
      table.string('accessory_description', 255).nullable();
    });
};

exports.down = function(knex) {
  return knex.schema
    .table('manage_quotation_item_accessories', (table) => {
      table.dropColumn('accessory_description');
      table.dropColumn('accessory_region');
      table.dropColumn('accessory_remark');
      table.dropColumn('accessory_brand');
      table.dropColumn('accessory_specification');
      table.dropColumn('accessory_part_name');
      table.dropColumn('accessory_part_number');
    })
    .table('manage_quotation_items', (table) => {
      table.dropColumn('componen_product_name');
      table.dropColumn('market_price');
      table.dropColumn('horse_power');
      table.dropColumn('volume');
      table.dropColumn('engine');
      table.dropColumn('wheel_no');
      table.dropColumn('msi_model');
      table.dropColumn('segment');
      table.dropColumn('code_unique');
    });
};


