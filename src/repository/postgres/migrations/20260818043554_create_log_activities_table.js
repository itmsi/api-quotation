/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("log_activities", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("url").nullable();
    table.string("method").nullable();
    table.jsonb("payload").nullable();
    table.string("status_code").nullable();
    table.string("status").nullable();
    table.jsonb("response").nullable();
    table.text("curl").nullable();

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.string("created_by").nullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.string("updated_by").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("log_activities");
};
