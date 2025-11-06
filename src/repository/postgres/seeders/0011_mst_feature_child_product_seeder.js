/**
 * Seeder: mst_feature_child_product data
 * Note: This seeder uses raw SQL for large data set
 */

const fs = require('fs');
const path = require('path');

exports.seed = async function(knex) {
  // Delete all existing entries
  await knex.raw('TRUNCATE TABLE mst_feature_child_product CASCADE');
  
  // Read SQL file and execute raw SQL
  // Try multiple possible paths - prioritize sql_product folder in project root
  const projectRoot = path.join(__dirname, '../../../..');
  const possiblePaths = [
    path.join(projectRoot, 'sql_product/mst_feature_child_product_202511061229.sql'),
    path.join(__dirname, '../../../../Downloads/mst_feature_child_product_202511061229.sql'),
    path.join(process.env.HOME || process.env.USERPROFILE || '', 'Downloads/mst_feature_child_product_202511061229.sql'),
    '/Users/falaqmsi/Downloads/mst_feature_child_product_202511061229.sql'
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
    console.warn(`SQL file not found at ${sqlFile}, using fallback data`);
    await knex('mst_feature_child_product').insert([
      {
        feature_child_product_id: 'a1992280-7e7f-4df3-84bc-6fa47422d07a',
        feature_product_id: '9f60b5d1-6f1d-4cd8-ac7c-425db558b062',
        feature_child_product_title_id: 'Advanced Axle',
        feature_child_product_title_en: 'Advanced Axle',
        feature_child_product_title_cn: 'Advanced Axle',
        feature_child_product_description_id: 'The MS600 is equipped with an advanced axle system...',
        feature_child_product_description_en: 'The MS600 is equipped with an advanced axle system...',
        feature_child_product_description_cn: 'The MS600 is equipped with an advanced axle system...',
        feature_child_product_image: 'feature-child-product/1747797916_advanced-axle.jpg',
        created_at: '2025-05-21 10:25:16.032+07',
        created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
        updated_at: '2025-05-23 15:17:41.675+07',
        updated_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
        deleted_at: null,
        deleted_by: null
      }
      // Add more rows as needed
    ]);
  }
};

