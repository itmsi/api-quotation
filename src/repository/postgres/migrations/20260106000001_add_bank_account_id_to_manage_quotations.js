/**
 * Migration: Add bank_account_id column to manage_quotations table
 */

exports.up = async function (knex) {
  const tableExists = await knex.schema.hasTable('manage_quotations');
  if (!tableExists) {
    return;
  }

  const hasBankAccountId = await knex.schema.hasColumn('manage_quotations', 'bank_account_id');

  return knex.schema.alterTable('manage_quotations', (table) => {
    if (!hasBankAccountId) {
      table.uuid('bank_account_id').nullable();
    }
  });
};

exports.down = async function (knex) {
  const tableExists = await knex.schema.hasTable('manage_quotations');
  if (!tableExists) {
    return;
  }

  const hasBankAccountId = await knex.schema.hasColumn('manage_quotations', 'bank_account_id');

  if (hasBankAccountId) {
    return knex.schema.alterTable('manage_quotations', (table) => {
      table.dropColumn('bank_account_id');
    });
  }
};

