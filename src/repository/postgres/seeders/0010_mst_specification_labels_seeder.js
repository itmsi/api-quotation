/**
 * Seeder: mst_specification_labels data
 * Note: This seeder uses raw SQL for large data set
 */

const fs = require('fs');
const path = require('path');

exports.seed = async function(knex) {
  // Delete all existing entries
  await knex.raw('TRUNCATE TABLE mst_specification_labels CASCADE');
  
  // Read SQL file and execute raw SQL
  // Try multiple possible paths
  const possiblePaths = [
    path.join(__dirname, '../../../../Downloads/mst_specification_labels_202511061228.sql'),
    path.join(process.env.HOME || process.env.USERPROFILE || '', 'Downloads/mst_specification_labels_202511061228.sql'),
    '/Users/falaqmsi/Downloads/mst_specification_labels_202511061228.sql'
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
    // Execute raw SQL directly
    await knex.raw(sqlContent);
  } else {
    // Fallback: Insert data manually if SQL file not found
    // This is a simplified version - you may need to add all 97 rows
    console.warn(`SQL file not found at ${sqlFile}, using fallback data`);
    await knex('mst_specification_labels').insert([
      {
        specification_label_id: '42b896ba-e0b7-40a7-837d-603cfa96a4c6',
        specification_id: 'd9579c31-72a4-4d74-a0fd-65dde8b395ba',
        specification_label_name: 'Driven Type/Tipe Roda Penggerak',
        description: null,
        created_at: '2025-05-28 16:40:29.3143+07',
        created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
        updated_at: '2025-05-28 16:41:27.89+07',
        updated_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
        deleted_at: null,
        deleted_by: null
      }
      // Add more rows as needed
    ]);
  }
};

