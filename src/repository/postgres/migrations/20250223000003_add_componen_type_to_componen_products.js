/**
 * Migration: Add componen_type column to componen_products table
 * Menambahkan kolom componen_type dengan enum (1,2,3)
 * 1: OFF ROAD REGULAR
 * 2: ON ROAD REGULAR
 * 3: OFF ROAD IRREGULAR
 * 4: OFF ROAD REGULAR EV
 * 5: ON ROAD REGULAR EV
 */

exports.up = function (knex) {
  return knex.schema.alterTable('componen_products', (table) => {
    table.integer('componen_type').nullable();
    table.index(['componen_type'], 'idx_componen_products_componen_type');
  }).then(() => {
    // Add check constraint using raw SQL
    return knex.raw(`
      ALTER TABLE componen_products 
      ADD CONSTRAINT componen_type_check 
      CHECK (componen_type IS NULL OR componen_type IN (1, 2, 3, 4, 5))
    `);
  });
};

exports.down = function (knex) {
  return knex.raw('ALTER TABLE componen_products DROP CONSTRAINT IF EXISTS componen_type_check')
    .then(() => {
      return knex.schema.alterTable('componen_products', (table) => {
        table.dropIndex(['componen_type'], 'idx_componen_products_componen_type');
        table.dropColumn('componen_type');
      });
    });
};

