/**
 * Migration: Create accessories table
 * Menyimpan data accessory
 */

exports.up = function(knex) {
  return knex.schema.createTable('accessories', (table) => {
    // Primary Key
    table.uuid('accessory_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    
    // Data fields
    table.string('accessory_part_number', 255).nullable();
    table.string('accessory_part_name', 255).nullable();
    table.string('accessory_specification', 255).nullable();
    table.string('accessory_brand', 255).nullable();
    table.string('accessory_remark', 255).nullable();
    table.string('accessory_region', 255).nullable();
    table.text('accessory_description').nullable();
    
    // Timestamps and audit fields
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at').nullable();
    table.uuid('deleted_by').nullable();
    table.boolean('is_delete').defaultTo(false);

    // Indexes for better query performance
    table.index(['accessory_part_number'], 'idx_accessories_part_number');
    table.index(['accessory_part_name'], 'idx_accessories_part_name');
    table.index(['created_at'], 'idx_accessories_created_at');
    table.index(['is_delete'], 'idx_accessories_is_delete');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('accessories');
};

