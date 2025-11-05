/**
 * Migration: Add item_product_id column to manage_quotation_items table
 * Menambahkan kolom item_product_id dengan foreign key ke tabel item_products
 */

exports.up = function(knex) {
  return knex.schema.table('manage_quotation_items', (table) => {
    // Add item_product_id column (nullable UUID)
    table.uuid('item_product_id').nullable();
    
    // Add foreign key constraint
    table.foreign('item_product_id')
      .references('item_product_id')
      .inTable('item_products')
      .onDelete('SET NULL');
    
    // Add index for better query performance
    table.index(['item_product_id'], 'idx_manage_quotation_items_item_product_id');
  });
};

exports.down = function(knex) {
  return knex.schema.table('manage_quotation_items', (table) => {
    // Drop foreign key constraint first
    table.dropForeign('item_product_id');
    
    // Drop index
    table.dropIndex(['item_product_id'], 'idx_manage_quotation_items_item_product_id');
    
    // Drop column
    table.dropColumn('item_product_id');
  });
};

