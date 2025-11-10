/**
 * Migration: Add bank account fields to manage_quotations table
 */

exports.up = async function (knex) {
  const tableExists = await knex.schema.hasTable('manage_quotations');
  if (!tableExists) {
    return;
  }

  const hasName = await knex.schema.hasColumn('manage_quotations', 'bank_account_name');
  const hasNumber = await knex.schema.hasColumn('manage_quotations', 'bank_account_number');
  const hasBankName = await knex.schema.hasColumn('manage_quotations', 'bank_account_bank_name');

  return knex.schema.alterTable('manage_quotations', (table) => {
    if (!hasName) {
      table.string('bank_account_name', 255).nullable();
    }
    if (!hasNumber) {
      table.string('bank_account_number', 255).nullable();
    }
    if (!hasBankName) {
      table.string('bank_account_bank_name', 255).nullable();
    }
  });
};

exports.down = async function (knex) {
  const tableExists = await knex.schema.hasTable('manage_quotations');
  if (!tableExists) {
    return;
  }

  return knex.schema.alterTable('manage_quotations', (table) => {
    table.dropColumn('bank_account_bank_name');
    table.dropColumn('bank_account_number');
    table.dropColumn('bank_account_name');
  });
};


