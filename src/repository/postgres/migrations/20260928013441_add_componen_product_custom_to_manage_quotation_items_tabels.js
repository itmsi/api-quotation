/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("manage_quotation_items", function (table) {
    table.text("componen_product_custom").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("manage_quotation_items", function (table) {
    table.dropColumn("componen_product_custom");
  });
};
