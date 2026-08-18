/**
 * Migration: Add company_name to term_contents table
 */

exports.up = function (knex) {
  return knex.schema.table("componen_products", function (table) {
    table.text("notes", 255).nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.table("componen_products", function (table) {
    table.dropColumn("notes");
  });
};
