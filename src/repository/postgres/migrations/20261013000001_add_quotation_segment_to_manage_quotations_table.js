/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("manage_quotations", function (table) {
    table.string("quotation_segment", 255).nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("manage_quotations", function (table) {
    table.dropColumn("quotation_segment");
  });
};
