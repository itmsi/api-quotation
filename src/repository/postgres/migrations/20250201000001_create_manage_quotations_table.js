/**
 * Migration: Create manage_quotations table
 * Table untuk menyimpan data quotation
 */

exports.up = function(knex) {
  return knex.schema.createTable('manage_quotations', (table) => {
    // Primary Key with UUID
    table.uuid('manage_quotation_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    
    // Data fields
    table.string('manage_quotation_no', 100).nullable();
    table.uuid('customer_id').nullable();
    table.uuid('employee_id').nullable();
    table.date('manage_quotation_date').nullable();
    table.date('manage_quotation_valid_date').nullable();
    table.string('manage_quotation_grand_total', 100).nullable();
    table.string('manage_quotation_ppn', 100).nullable();
    table.string('manage_quotation_delivery_fee', 100).nullable();
    table.string('manage_quotation_other', 100).nullable();
    table.string('manage_quotation_payment_presentase', 100).nullable();
    table.string('manage_quotation_payment_nominal', 100).nullable();
    table.text('manage_quotation_description').nullable();
    
    // Audit fields
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at').nullable();
    table.uuid('deleted_by').nullable();
    table.boolean('is_delete').defaultTo(false);
    
    // Indexes for better query performance
    table.index(['deleted_at'], 'idx_manage_quotations_deleted_at');
    table.index(['is_delete'], 'idx_manage_quotations_is_delete');
    table.index(['customer_id'], 'idx_manage_quotations_customer_id');
    table.index(['employee_id'], 'idx_manage_quotations_employee_id');
    table.index(['created_at'], 'idx_manage_quotations_created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('manage_quotations');
};

