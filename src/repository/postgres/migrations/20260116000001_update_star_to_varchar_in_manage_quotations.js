/**
 * Migration: Update star column from integer to varchar with default '0' and nullable
 * Mengubah kolom star dari integer menjadi varchar dengan default '0' dan nullable
 */

exports.up = async function (knex) {
  const tableExists = await knex.schema.hasTable('manage_quotations');
  if (!tableExists) {
    return;
  }

  const hasStar = await knex.schema.hasColumn('manage_quotations', 'star');
  if (!hasStar) {
    // If column doesn't exist, create it
    return knex.schema.alterTable('manage_quotations', (table) => {
      table.string('star', 255).nullable().defaultTo('0');
      table.index(['star'], 'idx_manage_quotations_star');
    });
  }

  // Convert existing integer values to string, set null to '0'
  return knex.raw(`
    ALTER TABLE manage_quotations 
    ALTER COLUMN star 
    TYPE VARCHAR(255) 
    USING CASE 
      WHEN star IS NULL THEN '0'
      ELSE CAST(star AS VARCHAR(255))
    END;
  `).then(() => {
    // Set default value to '0'
    return knex.raw(`
      ALTER TABLE manage_quotations 
      ALTER COLUMN star 
      SET DEFAULT '0';
    `);
  });
};

exports.down = async function (knex) {
  const tableExists = await knex.schema.hasTable('manage_quotations');
  if (!tableExists) {
    return;
  }

  const hasStar = await knex.schema.hasColumn('manage_quotations', 'star');
  if (!hasStar) {
    return;
  }

  // Convert back to integer, handling string values
  return knex.raw(`
    ALTER TABLE manage_quotations 
    ALTER COLUMN star 
    TYPE INTEGER 
    USING CASE 
      WHEN star IS NULL OR star = '' THEN NULL
      WHEN star ~ '^[0-9]+$' THEN CAST(star AS INTEGER)
      ELSE NULL
    END;
  `).then(() => {
    // Remove default
    return knex.raw(`
      ALTER TABLE manage_quotations 
      ALTER COLUMN star 
      DROP DEFAULT;
    `);
  });
};

