/**
 * Migration: Add customer_datas, employee_datas, and island_datas columns to manage_quotations table
 * Kolom jsonb untuk menyimpan snapshot data customer, employee, dan island
 */

exports.up = function(knex) {
  return knex.schema.table('manage_quotations', (table) => {
    table.jsonb('customer_datas').nullable();
    table.jsonb('employee_datas').nullable();
    table.jsonb('island_datas').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('manage_quotations', (table) => {
    table.dropColumn('customer_datas');
    table.dropColumn('employee_datas');
    table.dropColumn('island_datas');
  });
};

