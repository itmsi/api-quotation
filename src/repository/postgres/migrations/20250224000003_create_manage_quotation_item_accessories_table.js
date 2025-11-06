/**
 * Migration: Create manage_quotation_item_accessories table
 * Table untuk menyimpan data accessory quotation items
 */

exports.up = function(knex) {
  return knex.schema.createTable('manage_quotation_item_accessories', (table) => {
    // Primary Key with UUID
    table.uuid('manage_quotation_item_accessory_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    
    // Foreign Key
    table.uuid('manage_quotation_id').notNullable();
    
    // Foreign Key to accessories
    table.uuid('accessory_id').nullable();
    
    // Data fields
    table.integer('quantity').notNullable();
    table.text('description').nullable();
    
    // Audit fields
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at').nullable();
    table.uuid('deleted_by').nullable();
    table.boolean('is_delete').defaultTo(false);
    
    // Foreign key constraints
    table.foreign('manage_quotation_id')
      .references('manage_quotation_id')
      .inTable('manage_quotations')
      .onDelete('CASCADE');
    
    table.foreign('accessory_id')
      .references('accessory_id')
      .inTable('accessories')
      .onDelete('SET NULL');
    
    // Indexes for better query performance
    table.index(['manage_quotation_id'], 'idx_manage_quotation_item_accessories_quotation_id');
    table.index(['accessory_id'], 'idx_manage_quotation_item_accessories_accessory_id');
    table.index(['deleted_at'], 'idx_manage_quotation_item_accessories_deleted_at');
    table.index(['is_delete'], 'idx_manage_quotation_item_accessories_is_delete');
    table.index(['created_at'], 'idx_manage_quotation_item_accessories_created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('manage_quotation_item_accessories');
};

