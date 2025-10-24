/**
 * Create dblink extension for accessing remote databases
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Create dblink extension
  await knex.raw('CREATE EXTENSION IF NOT EXISTS dblink');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.raw('DROP EXTENSION IF EXISTS dblink');
};

