/**
 * Seeder: mst_type_product data
 */

exports.seed = async function(knex) {
  // Delete all existing entries using TRUNCATE CASCADE to handle foreign keys
  await knex.raw('TRUNCATE TABLE mst_type_product CASCADE');
  
  // Insert seed data
  await knex('mst_type_product').insert([
    {
      type_product_id: 'a7f95cae-0984-48e4-ad23-1db255b714db',
      type_product_description: 'archived-2025062032850-null',
      created_at: '2025-06-20 15:12:16.331783+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-06-20 15:12:16.331+07',
      updated_by: null,
      deleted_at: '2025-06-20 15:28:50.549+07',
      deleted_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      type_product_name_id: 'archived-2025062032850-testing id',
      type_product_name_en: 'archived-2025062032850-testing en',
      type_product_name_cn: 'archived-2025062032850-testing cn',
      slug_type_product: null
    },
    {
      type_product_id: '112d78d6-c7fe-40f0-bc14-eaa6972e9e8b',
      type_product_description: null,
      created_at: '2025-05-21 09:20:59.622+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-06-20 15:28:53.266+07',
      updated_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      deleted_at: null,
      deleted_by: null,
      type_product_name_id: 'DUMP TRUCK',
      type_product_name_en: 'DUMP TRUCK',
      type_product_name_cn: 'DUMP TRUCK',
      slug_type_product: 'dump-truck'
    },
    {
      type_product_id: 'b49b58ab-d193-4de5-b383-ed78e8fb4155',
      type_product_description: null,
      created_at: '2025-05-21 09:21:09.06+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-06-20 15:28:55.505+07',
      updated_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      deleted_at: null,
      deleted_by: null,
      type_product_name_id: 'TRACTOR HEAD',
      type_product_name_en: 'TRACTOR HEAD',
      type_product_name_cn: 'TRACTOR HEAD',
      slug_type_product: 'tractor-head'
    },
    {
      type_product_id: '082b1a70-995d-4dc7-8092-3b3c2f496675',
      type_product_description: null,
      created_at: '2025-05-21 09:21:21.106+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-06-20 15:28:58.288+07',
      updated_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      deleted_at: null,
      deleted_by: null,
      type_product_name_id: 'LORRY TRUCK',
      type_product_name_en: 'LORRY TRUCK',
      type_product_name_cn: 'LORRY TRUCK',
      slug_type_product: 'lorry-truck'
    }
  ]);
};

