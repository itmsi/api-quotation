/**
 * Seeder: mst_specification_values data
 * Note: This seeder uses raw SQL for very large data set (626 rows)
 */

const fs = require('fs');
const path = require('path');

exports.seed = async function(knex) {
  // Delete all existing entries
  await knex.raw('TRUNCATE TABLE mst_specification_values CASCADE');
  
  // Read SQL file and execute raw SQL
  // Try multiple possible paths
  const possiblePaths = [
    path.join(__dirname, '../../../../Downloads/mst_specification_values_202511061229.sql'),
    path.join(process.env.HOME || process.env.USERPROFILE || '', 'Downloads/mst_specification_values_202511061229.sql'),
    '/Users/falaqmsi/Downloads/mst_specification_values_202511061229.sql'
  ];
  
  let sqlFile = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      sqlFile = possiblePath;
      break;
    }
  }
  
  if (sqlFile) {
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute raw SQL - PostgreSQL handles this efficiently
    // Split by INSERT statements and execute each separately to avoid issues
    const statements = sqlContent
      .split('INSERT INTO')
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => 'INSERT INTO ' + stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await knex.raw(statement);
        } catch (error) {
          console.error('Error executing statement:', error.message);
          throw error;
        }
      }
    }
  } else {
    // Fallback: If SQL file not found, throw error
    throw new Error(`SQL file not found. Tried paths: ${possiblePaths.join(', ')}. Please ensure the file exists.`);
  }
};

