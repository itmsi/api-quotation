/**
 * Add bank_account_id to manage_quotations table
 */
exports.up = function (knex) {
  return knex.schema.alterTable('manage_quotations', function (table) {
    table.uuid('bank_account_id').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('manage_quotations', function (table) {
    table.dropColumn('bank_account_id');
  });
};
