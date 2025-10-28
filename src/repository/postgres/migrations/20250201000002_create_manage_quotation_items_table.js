/**
 * Migration: Create manage_quotation_items table
 * Table untuk menyimpan data item quotation
 */

exports.up = function(knex) {
  return knex.schema.createTable('manage_quotation_items', (table) => {
    // Primary Key with UUID
    table.uuid('manage_quotation_item_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    
    // Foreign Key
    table.uuid('manage_quotation_id').notNullable();
    
    // Data fields
    table.string('unit_code', 100).nullable();
    table.string('unit_model', 100).nullable();
    table.string('segment', 100).nullable();
    table.text('msi_model').nullable();
    table.string('wheel_no', 100).nullable();
    table.string('engine', 100).nullable();
    table.string('horse_power', 100).nullable();
    table.integer('quantity').notNullable();
    table.string('price', 100).notNullable();
    table.string('total', 100).notNullable();
    table.text('description').nullable();
    
    // Audit fields
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at').nullable();
    table.uuid('deleted_by').nullable();
    table.boolean('is_delete').defaultTo(false);
    
    // Foreign key constraint
    table.foreign('manage_quotation_id')
      .references('manage_quotation_id')
      .inTable('manage_quotations')
      .onDelete('CASCADE');
    
    // Indexes for better query performance
    table.index(['manage_quotation_id'], 'idx_manage_quotation_items_quotation_id');
    table.index(['deleted_at'], 'idx_manage_quotation_items_deleted_at');
    table.index(['is_delete'], 'idx_manage_quotation_items_is_delete');
    table.index(['created_at'], 'idx_manage_quotation_items_created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('manage_quotation_items');
};

