/**
 * Migration: Alter quotes table columns to integer type
 * Mengubah tipe data kolom-kolom monthly menjadi integer
 * Kolom: depreciation_monthly, interest_monthly, overhead_monthly, 
 * salary_operator_monthly, sparepart_expense_monthly, tyre_expense_monthly
 */

exports.up = async function(knex) {
  // Check if table exists
  const tableExists = await knex.schema.hasTable('quotes');
  if (!tableExists) {
    console.log('Table quotes does not exist, skipping migration');
    return;
  }

  // Array of columns to alter
  const columns = [
    'depreciation_monthly',
    'interest_monthly',
    'overhead_monthly',
    'salary_operator_monthly',
    'sparepart_expense_monthly',
    'tyre_expense_monthly'
  ];

  // Alter each column type to integer
  for (const column of columns) {
    const columnExists = await knex.schema.hasColumn('quotes', column);
    if (columnExists) {
      await knex.raw(`
        ALTER TABLE quotes 
        ALTER COLUMN ${column} TYPE integer 
        USING CASE 
          WHEN ${column} IS NULL THEN NULL
          WHEN ${column}::text ~ '^[0-9]+$' THEN ${column}::text::integer
          ELSE 0
        END
      `);
    } else {
      console.log(`Column ${column} does not exist in quotes table, skipping...`);
    }
  }
};

exports.down = async function(knex) {
  // Check if table exists
  const tableExists = await knex.schema.hasTable('quotes');
  if (!tableExists) {
    return;
  }

  // Revert columns back to numeric/decimal type (common type for monetary values)
  // You may need to adjust this based on the original type
  const columns = [
    'depreciation_monthly',
    'interest_monthly',
    'overhead_monthly',
    'salary_operator_monthly',
    'sparepart_expense_monthly',
    'tyre_expense_monthly'
  ];

  for (const column of columns) {
    const columnExists = await knex.schema.hasColumn('quotes', column);
    if (columnExists) {
      await knex.raw(`
        ALTER TABLE quotes 
        ALTER COLUMN ${column} TYPE numeric(15,2)
        USING ${column}::numeric
      `);
    }
  }
};

