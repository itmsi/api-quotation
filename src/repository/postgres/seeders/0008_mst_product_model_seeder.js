/**
 * Seeder: mst_product_model data
 */

exports.seed = async function(knex) {
  // Delete all existing entries
  await knex.raw('TRUNCATE TABLE mst_product_model CASCADE');
  
  // Insert seed data
  await knex('mst_product_model').insert([
    {
      product_model_id: '16576c54-37e5-470b-ae98-38e8036d59c7',
      product_id: '0f2c0c3f-7934-4872-bbbe-5bea2dce0e27',
      product_model_name: '-',
      product_model_description: 'archived-2025061294637-null',
      product_model_foto: 'product-model/image/1749456690_New_fortuner_2024_01.png',
      created_at: '2025-06-09 15:11:30.772+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-06-12 09:46:26.52+07',
      updated_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      deleted_at: '2025-06-12 09:46:37.343+07',
      deleted_by: '73d05c65-1567-433b-83bb-4f5c4d692335'
    },
    {
      product_model_id: 'dd9c0ae3-7bd2-43db-83e4-5abd01cae2d9',
      product_id: '0f2c0c3f-7934-4872-bbbe-5bea2dce0e27',
      product_model_name: 'Nickel',
      product_model_description: null,
      product_model_foto: 'product-model/image/1750489880_ms700.jpg',
      created_at: '2025-06-09 15:11:18.189+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-07-09 10:20:29.868+07',
      updated_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      deleted_at: null,
      deleted_by: null
    },
    {
      product_model_id: 'ef5c735c-d75a-4e53-9a25-3643e2f563c6',
      product_id: '7581e4eb-befa-40d7-955e-2ca6ebceaae6',
      product_model_name: 'SX3250MB384',
      product_model_description: null,
      product_model_foto: 'product-model/image/1750409749_ms500s.jpg',
      created_at: '2025-06-20 15:55:49.553+07',
      created_by: 'ccdf2a53-b7b8-4d37-9d65-d30753564baa',
      updated_at: '2025-09-14 22:29:48.215+07',
      updated_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      deleted_at: null,
      deleted_by: null
    },
    {
      product_model_id: '4c7422d3-7463-4ca4-a258-39c0cd5e5244',
      product_id: 'e5effe32-5f28-4040-aa65-98492e89cde9',
      product_model_name: 'SX4180MB1',
      product_model_description: null,
      product_model_foto: 'product-model/image/1757861346_4x2_MS500-TH.png',
      created_at: '2025-06-09 13:46:02.643+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-09-14 22:30:55.412+07',
      updated_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      deleted_at: null,
      deleted_by: null
    },
    {
      product_model_id: '35fd173e-27ac-4c04-95c1-504de388864a',
      product_id: '65b6c1ea-f92b-4106-91d1-7b4116355fb5',
      product_model_name: 'SX1250MA9',
      product_model_description: null,
      product_model_foto: 'product-model/image/1750392642_ms500.jpg',
      created_at: '2025-06-09 13:46:16.574+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-09-14 22:31:28.752+07',
      updated_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      deleted_at: null,
      deleted_by: null
    },
    {
      product_model_id: '9b30892e-eab9-4e25-8f89-852ecc3c508e',
      product_id: 'c10d67b8-b699-494b-88a7-81977a202625',
      product_model_name: 'Nickel SX3255DR384R',
      product_model_description: null,
      product_model_foto: 'product-model/image/1750394246_ms600.jpg',
      created_at: '2025-06-09 13:46:57.247+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-09-14 20:48:56.734+07',
      updated_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      deleted_at: null,
      deleted_by: null
    },
    {
      product_model_id: '9223e7a7-d727-456e-93e4-e553faa0caad',
      product_id: 'c10d67b8-b699-494b-88a7-81977a202625',
      product_model_name: 'Nickel SX3255DR384CR',
      product_model_description: null,
      product_model_foto: 'product-model/image/1750394239_ms600.jpg',
      created_at: '2025-06-09 13:46:47.994+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-09-14 20:50:08.573+07',
      updated_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      deleted_at: null,
      deleted_by: null
    },
    {
      product_model_id: '4a658899-4077-4cf3-bb65-dd6c59eceff0',
      product_id: 'c10d67b8-b699-494b-88a7-81977a202625',
      product_model_name: 'Nickel SX3315DV366CR',
      product_model_description: null,
      product_model_foto: 'product-model/image/1750394257_ms600.jpg',
      created_at: '2025-06-12 11:31:21.089+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-09-14 20:50:32.557+07',
      updated_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      deleted_at: null,
      deleted_by: null
    },
    {
      product_model_id: 'e5c58745-5747-47ac-9071-fc6318cafcfe',
      product_id: '0f2c0c3f-7934-4872-bbbe-5bea2dce0e27',
      product_model_name: 'Coal',
      product_model_description: null,
      product_model_foto: 'product-model/image/1750489870_ms700.jpg',
      created_at: '2025-06-12 10:24:48.262+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-09-14 22:45:10.823+07',
      updated_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      deleted_at: null,
      deleted_by: null
    },
    {
      product_model_id: '2dc9dbba-386c-44c2-963c-10b9ec1e770b',
      product_id: 'c10d67b8-b699-494b-88a7-81977a202625',
      product_model_name: 'Coal SX3255DU484R',
      product_model_description: null,
      product_model_foto: null,
      created_at: '2025-09-14 22:00:20.572247+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-09-14 22:00:20.571+07',
      updated_by: null,
      deleted_at: null,
      deleted_by: null
    },
    {
      product_model_id: 'ca8ca7b1-f90c-42a5-994a-f82cfb41f117',
      product_id: 'c10d67b8-b699-494b-88a7-81977a202625',
      product_model_name: 'Coal SX3315DV506R',
      product_model_description: null,
      product_model_foto: null,
      created_at: '2025-09-14 22:00:34.035657+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-09-14 22:00:34.035+07',
      updated_by: null,
      deleted_at: null,
      deleted_by: null
    },
    {
      product_model_id: '9f1274ad-12e8-4082-80f2-0499059389c7',
      product_id: '0f2c0c3f-7934-4872-bbbe-5bea2dce0e27',
      product_model_name: 'Coal SX32556R484CR',
      product_model_description: null,
      product_model_foto: null,
      created_at: '2025-09-14 22:00:52.335224+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-09-14 22:00:52.333+07',
      updated_by: null,
      deleted_at: null,
      deleted_by: null
    },
    {
      product_model_id: 'b43fc243-469f-4b44-b1c4-f7f415cba3cf',
      product_id: '0986b898-193c-4b34-af11-55f161a67993',
      product_model_name: 'SX1250MB564',
      product_model_description: null,
      product_model_foto: 'product-model/image/1750403034_ms500s.jpg',
      created_at: '2025-06-12 13:35:43.838+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-09-14 22:28:48.529+07',
      updated_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      deleted_at: null,
      deleted_by: null
    },
    {
      product_model_id: 'a0de552c-797a-4ea7-b9f0-60ab8fc679f2',
      product_id: '00409de1-5f5e-4b26-83c5-f549b9f03077',
      product_model_name: 'SX4250MB4',
      product_model_description: null,
      product_model_foto: 'product-model/image/1750403044_ms500s.jpg',
      created_at: '2025-06-12 13:39:01.562+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-09-14 22:29:24.585+07',
      updated_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      deleted_at: null,
      deleted_by: null
    }
  ]);
};

