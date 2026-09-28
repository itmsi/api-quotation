/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("componen_products", function (table) {
    table.text("componen_product_custom").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("componen_products", function (table) {
    table.dropColumn("componen_product_custom");
  });
};
