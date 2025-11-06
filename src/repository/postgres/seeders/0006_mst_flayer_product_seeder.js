/**
 * Seeder: mst_flayer_product data
 */

exports.seed = async function(knex) {
  // Delete all existing entries
  await knex.raw('TRUNCATE TABLE mst_flayer_product CASCADE');
  
  // Insert seed data
  await knex('mst_flayer_product').insert([
    {
      flayer_product_id: 'ad9bf446-3537-41ba-bb11-3a4cdc1f7631',
      product_id: 'c10d67b8-b699-494b-88a7-81977a202625',
      flayer_product_name_id: 'MS600 ( 6x4 )',
      flayer_product_name_en: 'MS600 ( 6x4 )',
      flayer_product_name_cn: 'MS600 ( 6x4 )',
      flayer_product_description: null,
      flayer_product_file: 'product/1747974198_MS600_6x4.pdf',
      created_at: '2025-05-23 11:23:18.628892+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-05-23 11:23:18.628+07',
      updated_by: null,
      deleted_at: null,
      deleted_by: null
    },
    {
      flayer_product_id: '73b08a8d-60e6-4fbf-8a65-25c1de1539f9',
      product_id: 'c10d67b8-b699-494b-88a7-81977a202625',
      flayer_product_name_id: 'MS600 (8x4)',
      flayer_product_name_en: 'MS600 (8x4)',
      flayer_product_name_cn: 'MS600 (8x4)',
      flayer_product_description: null,
      flayer_product_file: 'product/1747974214_MS600_8x4.pdf',
      created_at: '2025-05-23 11:23:34.290263+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-05-23 11:23:34.289+07',
      updated_by: null,
      deleted_at: null,
      deleted_by: null
    },
    {
      flayer_product_id: '6caf1418-da0c-4ef0-9637-0ed74cea1536',
      product_id: '0f2c0c3f-7934-4872-bbbe-5bea2dce0e27',
      flayer_product_name_id: 'MS700 ( 6x4 )',
      flayer_product_name_en: 'MS700 ( 6x4 )',
      flayer_product_name_cn: 'MS700 ( 6x4 )',
      flayer_product_description: null,
      flayer_product_file: 'product/1747974820_MS700_6x4.pdf',
      created_at: '2025-05-23 11:33:40.321945+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-05-23 11:33:40.297+07',
      updated_by: null,
      deleted_at: null,
      deleted_by: null
    },
    {
      flayer_product_id: '9949e959-b0ef-4342-b587-5a8fbba1ac4a',
      product_id: '0f2c0c3f-7934-4872-bbbe-5bea2dce0e27',
      flayer_product_name_id: 'MS700 ( 8x4 )',
      flayer_product_name_en: 'MS700 ( 8x4 )',
      flayer_product_name_cn: 'MS700 ( 8x4 )',
      flayer_product_description: null,
      flayer_product_file: 'product/1748312562_Brochure MS700 8x4.pdf',
      created_at: '2025-05-23 11:33:58.893+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-05-27 09:22:42.072+07',
      updated_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      deleted_at: null,
      deleted_by: null
    },
    {
      flayer_product_id: '35829ef7-2141-48e5-85e3-fe6b139061fe',
      product_id: 'e5effe32-5f28-4040-aa65-98492e89cde9',
      flayer_product_name_id: 'MS500 (6x2)',
      flayer_product_name_en: 'MS500 (6x2)',
      flayer_product_name_cn: 'MS500 (6x2)',
      flayer_product_description: null,
      flayer_product_file: 'product/1749117517_MS 500 LORRY.pdf',
      created_at: '2025-06-05 16:58:37.873+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-06-05 16:59:04.281+07',
      updated_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      deleted_at: null,
      deleted_by: null
    },
    {
      flayer_product_id: '487bc7b8-e5a0-4dd8-a592-54d78960a194',
      product_id: '65b6c1ea-f92b-4106-91d1-7b4116355fb5',
      flayer_product_name_id: 'MS500 (6x2)',
      flayer_product_name_en: 'MS500 (6x2)',
      flayer_product_name_cn: 'MS500 (6x2)',
      flayer_product_description: null,
      flayer_product_file: 'product/1750573744_MS 500 LORRY_6x2.pdf',
      created_at: '2025-06-22 13:29:04.373629+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-06-22 13:29:04.372+07',
      updated_by: null,
      deleted_at: null,
      deleted_by: null
    },
    {
      flayer_product_id: '7e35474c-4dc6-437e-bbcd-99b856ae0f24',
      product_id: '0986b898-193c-4b34-af11-55f161a67993',
      flayer_product_name_id: 'MS500S (6x4)',
      flayer_product_name_en: 'MS500S (6x4)',
      flayer_product_name_cn: 'MS500S (6x4)',
      flayer_product_description: null,
      flayer_product_file: 'product/1750573835_MS 500S LORRY.pdf',
      created_at: '2025-06-22 13:30:36.001994+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-06-22 13:30:36.001+07',
      updated_by: null,
      deleted_at: null,
      deleted_by: null
    },
    {
      flayer_product_id: 'bfe25f37-b87f-47da-b633-1df0273203c3',
      product_id: '00409de1-5f5e-4b26-83c5-f549b9f03077',
      flayer_product_name_id: 'MS500S (4x2)',
      flayer_product_name_en: 'MS500S (4x2)',
      flayer_product_name_cn: 'MS500S (4x2)',
      flayer_product_description: null,
      flayer_product_file: 'product/1750574059_MS 500S TRACTOR HEAD.pdf',
      created_at: '2025-06-22 13:34:19.218249+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-06-22 13:34:19.216+07',
      updated_by: null,
      deleted_at: null,
      deleted_by: null
    },
    {
      flayer_product_id: '41a97a75-a332-4193-ae21-fcfdbc94d595',
      product_id: 'e5effe32-5f28-4040-aa65-98492e89cde9',
      flayer_product_name_id: 'MS500 4x2',
      flayer_product_name_en: 'MS500 4x2',
      flayer_product_name_cn: 'MS500 4x2',
      flayer_product_description: null,
      flayer_product_file: 'product/1750574107_MS 500 TRACTOR HEAD_compressed.pdf',
      created_at: '2025-06-22 13:35:07.450032+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-06-22 13:35:07.449+07',
      updated_by: null,
      deleted_at: null,
      deleted_by: null
    },
    {
      flayer_product_id: 'eaafa639-9478-47d9-96db-c122b562d70f',
      product_id: '7581e4eb-befa-40d7-955e-2ca6ebceaae6',
      flayer_product_name_id: 'MS500S 6x4',
      flayer_product_name_en: 'MS500S 6x4',
      flayer_product_name_cn: '6x4MS500S 6x4',
      flayer_product_description: null,
      flayer_product_file: 'product/1750574352_MS 500S DUMP TRUCK_compressed.pdf',
      created_at: '2025-06-22 13:39:12.872516+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-06-22 13:39:12.871+07',
      updated_by: null,
      deleted_at: null,
      deleted_by: null
    }
  ]);
};

