/**
 * Migration: Add company, project_id, quotation_for, and star columns to manage_quotations table
 * Menambahkan kolom company (varchar nullable), project_id (varchar nullable), quotation_for (varchar nullable), dan star (integer nullable) ke tabel manage_quotations
 */

exports.up = async function (knex) {
  const tableExists = await knex.schema.hasTable('manage_quotations');
  if (!tableExists) {
    return;
  }

  const hasCompany = await knex.schema.hasColumn('manage_quotations', 'company');
  const hasProjectId = await knex.schema.hasColumn('manage_quotations', 'project_id');
  const hasQuotationFor = await knex.schema.hasColumn('manage_quotations', 'quotation_for');
  const hasStar = await knex.schema.hasColumn('manage_quotations', 'star');

  return knex.schema.alterTable('manage_quotations', (table) => {
    if (!hasCompany) {
      table.string('company', 255).nullable();
      table.index(['company'], 'idx_manage_quotations_company');
    }
    if (!hasProjectId) {
      table.string('project_id', 255).nullable();
      table.index(['project_id'], 'idx_manage_quotations_project_id');
    }
    if (!hasQuotationFor) {
      table.string('quotation_for', 255).nullable();
      table.index(['quotation_for'], 'idx_manage_quotations_quotation_for');
    }
    if (!hasStar) {
      table.integer('star').nullable();
      table.index(['star'], 'idx_manage_quotations_star');
    }
  });
};

exports.down = async function (knex) {
  const tableExists = await knex.schema.hasTable('manage_quotations');
  if (!tableExists) {
    return;
  }

  return knex.schema.alterTable('manage_quotations', (table) => {
    table.dropIndex(['company'], 'idx_manage_quotations_company');
    table.dropColumn('company');
    table.dropIndex(['project_id'], 'idx_manage_quotations_project_id');
    table.dropColumn('project_id');
    table.dropIndex(['quotation_for'], 'idx_manage_quotations_quotation_for');
    table.dropColumn('quotation_for');
    table.dropIndex(['star'], 'idx_manage_quotations_star');
    table.dropColumn('star');
  });
};

