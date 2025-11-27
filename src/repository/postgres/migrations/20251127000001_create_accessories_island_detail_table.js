/**
 * Migration: Create accessories_island_detail table
 * Table untuk menyimpan detail accessories per island
 */

exports.up = function(knex) {
  return knex.schema.createTable('accessories_island_detail', (table) => {
    // Primary Key with UUID
    table.uuid('accessories_island_detail_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    
    // Foreign Key
    table.uuid('island_id').nullable();
    table.uuid('accessories_id')
      .references('accessory_id')
      .inTable('accessories')
      .onDelete('CASCADE');
    
    // Data fields
    table.integer('accessories_island_detail_quantity').defaultTo(0);
    table.text('accessories_island_detail_description').nullable();
    
    // Audit fields
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.uuid('updated_by').nullable();
    
    // Indexes for better query performance
    table.index(['island_id'], 'idx_accessories_island_detail_island_id');
    table.index(['accessories_id'], 'idx_accessories_island_detail_accessories_id');
    table.index(['created_at'], 'idx_accessories_island_detail_created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('accessories_island_detail');
};

