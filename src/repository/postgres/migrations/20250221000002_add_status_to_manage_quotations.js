/**
 * Migration: Add status column to manage_quotations table
 * Menambahkan kolom status dengan enum ('draft', 'submit') dengan default 'submit'
 */

exports.up = function(knex) {
  return knex.schema.alterTable('manage_quotations', (table) => {
    table.enum('status', ['draft', 'submit']).defaultTo('submit').notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('manage_quotations', (table) => {
    table.dropColumn('status');
  });
};

