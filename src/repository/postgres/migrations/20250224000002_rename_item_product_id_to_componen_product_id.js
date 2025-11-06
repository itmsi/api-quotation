/**
 * Migration: Rename item_product_id to componen_product_id in manage_quotation_items table
 * Mengubah kolom item_product_id menjadi componen_product_id dengan foreign key ke tabel componen_products
 */

exports.up = async function(knex) {
  // Check if column already renamed (in case migration failed halfway)
  const hasItemProductId = await knex.schema.hasColumn('manage_quotation_items', 'item_product_id');
  
  // Step 1: Drop existing foreign key constraint and index if item_product_id still exists
  if (hasItemProductId) {
    try {
      await knex.schema.table('manage_quotation_items', (table) => {
        table.dropForeign('item_product_id');
      });
    } catch (err) {
      // Foreign key might not exist, continue
      console.log('Foreign key item_product_id might not exist, continuing...');
    }
    
    try {
      await knex.schema.table('manage_quotation_items', (table) => {
        table.dropIndex(['item_product_id'], 'idx_manage_quotation_items_item_product_id');
      });
    } catch (err) {
      // Index might not exist, continue
      console.log('Index idx_manage_quotation_items_item_product_id might not exist, continuing...');
    }
    
    // Step 2: Rename column
    await knex.schema.table('manage_quotation_items', (table) => {
      table.renameColumn('item_product_id', 'componen_product_id');
    });
  }
  
  // Step 3: Clean up invalid data - set NULL for componen_product_id that doesn't exist in componen_products
  const validComponenProductIds = await knex('componen_products')
    .where('is_delete', false)
    .pluck('componen_product_id');
  
  if (validComponenProductIds.length > 0) {
    await knex('manage_quotation_items')
      .whereNotIn('componen_product_id', validComponenProductIds)
      .whereNotNull('componen_product_id')
      .update({ componen_product_id: null });
  } else {
    // If no valid componen_products exist, set all to NULL
    await knex('manage_quotation_items')
      .whereNotNull('componen_product_id')
      .update({ componen_product_id: null });
  }
  
  // Step 4: Check if foreign key already exists before adding
  const fkCheck = await knex.raw(`
    SELECT constraint_name 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'manage_quotation_items_componen_product_id_foreign'
    AND table_schema = 'public'
    AND table_name = 'manage_quotation_items'
  `);
  
  if (!fkCheck.rows || fkCheck.rows.length === 0) {
    // Add foreign key constraint to componen_products
    await knex.schema.table('manage_quotation_items', (table) => {
      table.foreign('componen_product_id')
        .references('componen_product_id')
        .inTable('componen_products')
        .onDelete('SET NULL');
    });
  }
  
  // Step 5: Add index if it doesn't exist
  const indexCheck = await knex.raw(`
    SELECT indexname 
    FROM pg_indexes 
    WHERE schemaname = 'public'
    AND tablename = 'manage_quotation_items'
    AND indexname = 'idx_manage_quotation_items_componen_product_id'
  `);
  
  if (!indexCheck.rows || indexCheck.rows.length === 0) {
    await knex.schema.table('manage_quotation_items', (table) => {
      table.index(['componen_product_id'], 'idx_manage_quotation_items_componen_product_id');
    });
  }
};

exports.down = function(knex) {
  return knex.schema.table('manage_quotation_items', (table) => {
    // Drop foreign key constraint and index
    table.dropForeign('componen_product_id');
    table.dropIndex(['componen_product_id'], 'idx_manage_quotation_items_componen_product_id');
    
    // Rename column back
    table.renameColumn('componen_product_id', 'item_product_id');
    
    // Add foreign key constraint back to item_products
    table.foreign('item_product_id')
      .references('item_product_id')
      .inTable('item_products')
      .onDelete('SET NULL');
    
    // Add index back
    table.index(['item_product_id'], 'idx_manage_quotation_items_item_product_id');
  });
};

