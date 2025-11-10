/**
 * Migration: Add include_aftersales_page and include_msf_page to manage_quotations table
 */

exports.up = function (knex) {
  return knex.schema.table('manage_quotations', (table) => {
    table.boolean('include_aftersales_page').defaultTo(false);
    table.boolean('include_msf_page').defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.table('manage_quotations', (table) => {
    table.dropColumn('include_aftersales_page');
    table.dropColumn('include_msf_page');
  });
};


