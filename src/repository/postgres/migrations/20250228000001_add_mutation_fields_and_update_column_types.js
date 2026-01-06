/**
 * Migration: Add mutation fields and update column types in manage_quotations table
 * - Menambahkan field manage_quotation_mutation_type (enum: plus, minus)
 * - Menambahkan field manage_quotation_grand_total_before (double precision 15,2)
 * - Mengubah tipe manage_quotation_grand_total dari string ke double (precision: 15, scale: 2)
 * - Mengubah tipe manage_quotation_payment_nominal dari string ke double (precision: 15, scale: 2)
 */

exports.up = function(knex) {
  return knex.schema.alterTable('manage_quotations', (table) => {
    // Add enum field for mutation type
    table.enum('manage_quotation_mutation_type', ['plus', 'minus']).nullable();
    
    // Add grand total before field (decimal with precision 15, scale 2)
    table.decimal('manage_quotation_grand_total_before', 15, 2).nullable();
  }).then(() => {
    // Convert manage_quotation_grand_total from string to decimal
    // First, update existing data: convert string to decimal, handling null and empty strings
    return knex.raw(`
      ALTER TABLE manage_quotations 
      ALTER COLUMN manage_quotation_grand_total 
      TYPE DECIMAL(15,2) 
      USING CASE 
        WHEN manage_quotation_grand_total IS NULL OR manage_quotation_grand_total = '' THEN NULL
        ELSE CAST(manage_quotation_grand_total AS DECIMAL(15,2))
      END
    `);
  }).then(() => {
    // Convert manage_quotation_payment_nominal from string to decimal
    return knex.raw(`
      ALTER TABLE manage_quotations 
      ALTER COLUMN manage_quotation_payment_nominal 
      TYPE DECIMAL(15,2) 
      USING CASE 
        WHEN manage_quotation_payment_nominal IS NULL OR manage_quotation_payment_nominal = '' THEN NULL
        ELSE CAST(manage_quotation_payment_nominal AS DECIMAL(15,2))
      END
    `);
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('manage_quotations', (table) => {
    // Revert manage_quotation_payment_nominal back to string
    table.string('manage_quotation_payment_nominal', 100).nullable().alter();
  }).then(() => {
    // Revert manage_quotation_grand_total back to string
    return knex.raw(`
      ALTER TABLE manage_quotations 
      ALTER COLUMN manage_quotation_grand_total 
      TYPE VARCHAR(100) 
      USING CASE 
        WHEN manage_quotation_grand_total IS NULL THEN NULL
        ELSE CAST(manage_quotation_grand_total AS VARCHAR(100))
      END
    `);
  }).then(() => {
    // Remove added columns
    return knex.schema.alterTable('manage_quotations', (table) => {
      table.dropColumn('manage_quotation_grand_total_before');
      table.dropColumn('manage_quotation_mutation_type');
    });
  });
};

