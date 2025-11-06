/**
 * Seeder: mst_feature_product data
 */

exports.seed = async function(knex) {
  // Delete all existing entries
  await knex.raw('TRUNCATE TABLE mst_feature_product CASCADE');
  
  // Insert seed data
  await knex('mst_feature_product').insert([
    {
      feature_product_id: 'e7922c79-3b91-489a-845b-45f94c5ce03a',
      product_id: '0f2c0c3f-7934-4872-bbbe-5bea2dce0e27',
      feature_product_title_id: 'Easy to live in',
      feature_product_title_en: 'Easy to live in',
      feature_product_title_cn: 'Easy to live in',
      feature_product_description_id: 'With smart storage, intuitive controls, and a comfortable interior, the MS700 makes every journey feel effortless.',
      feature_product_description_en: 'With smart storage, intuitive controls, and a comfortable interior, the MS700 makes every journey feel effortless.',
      feature_product_description_cn: 'With smart storage, intuitive controls, and a comfortable interior, the MS700 makes every journey feel effortless.',
      no_order: '3',
      created_at: '2025-05-23 11:37:29.443+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-06-17 10:51:48.068+07',
      updated_by: 'ccdf2a53-b7b8-4d37-9d65-d30753564baa',
      deleted_at: null,
      deleted_by: null
    },
    {
      feature_product_id: '9f60b5d1-6f1d-4cd8-ac7c-425db558b062',
      product_id: 'c10d67b8-b699-494b-88a7-81977a202625',
      feature_product_title_id: 'Performance Capability',
      feature_product_title_en: 'Performance Capability',
      feature_product_title_cn: 'Performance Capability',
      feature_product_description_id: 'Power that performs-the MS600 delivers maximum output with lasting reliability.',
      feature_product_description_en: 'Power that performs-the MS600 delivers maximum output with lasting reliability.',
      feature_product_description_cn: 'Power that performs-the MS600 delivers maximum output with lasting reliability.',
      no_order: '2',
      created_at: '2025-05-21 10:09:20.616+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-06-17 10:45:32.811+07',
      updated_by: 'ccdf2a53-b7b8-4d37-9d65-d30753564baa',
      deleted_at: null,
      deleted_by: null
    },
    {
      feature_product_id: 'c3154a6e-da9b-4fc5-a656-1513258b97bb',
      product_id: 'c10d67b8-b699-494b-88a7-81977a202625',
      feature_product_title_id: 'Built For Any Situation',
      feature_product_title_en: 'Built For Any Situation',
      feature_product_title_cn: 'Built For Any Situation',
      feature_product_description_id: 'Versatile and powerful, the MS600 handles every challenge with confidence and control.',
      feature_product_description_en: 'Versatile and powerful, the MS600 handles every challenge with confidence and control.',
      feature_product_description_cn: 'Versatile and powerful, the MS600 handles every challenge with confidence and control.',
      no_order: '4',
      created_at: '2025-05-21 10:07:13.577+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-06-17 10:49:43.232+07',
      updated_by: 'ccdf2a53-b7b8-4d37-9d65-d30753564baa',
      deleted_at: null,
      deleted_by: null
    },
    {
      feature_product_id: 'b979c7c2-45f1-4f71-b5a2-361c98ab0e1d',
      product_id: 'c10d67b8-b699-494b-88a7-81977a202625',
      feature_product_title_id: 'MS Stands For Motor Sights',
      feature_product_title_en: 'MS Stands For Motor Sights',
      feature_product_title_cn: 'MS Stands For Motor Sights',
      feature_product_description_id: 'Discover the unmatched strength of the MS600 Motor Sights Dump Truck, expertly crafted to tackle the most toughest tasks. With superior performance, fortified durability, and impressive ground clearance, it\'s optimized for navigating the harshest terrains with confidence. Upgrade your fleet with a vehicle that embodies power, endurance, and steadfast reliability.',
      feature_product_description_en: 'Discover the unmatched strength of the MS600 Motor Sights Dump Truck, expertly crafted to tackle the most toughest tasks. With superior performance, fortified durability, and impressive ground clearance, it\'s optimized for navigating the harshest terrains with confidence. Upgrade your fleet with a vehicle that embodies power, endurance, and steadfast reliability.',
      feature_product_description_cn: 'Discover the unmatched strength of the MS600 Motor Sights Dump Truck, expertly crafted to tackle the most toughest tasks. With superior performance, fortified durability, and impressive ground clearance, it\'s optimized for navigating the harshest terrains with confidence. Upgrade your fleet with a vehicle that embodies power, endurance, and steadfast reliability.',
      no_order: '3',
      created_at: '2025-05-22 11:10:24.713+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-06-17 10:45:41.039+07',
      updated_by: 'ccdf2a53-b7b8-4d37-9d65-d30753564baa',
      deleted_at: null,
      deleted_by: null
    },
    {
      feature_product_id: '30b440e6-eb33-4c42-836c-52fc2fb5db35',
      product_id: '0f2c0c3f-7934-4872-bbbe-5bea2dce0e27',
      feature_product_title_id: 'Sub Components',
      feature_product_title_en: 'Sub Components',
      feature_product_title_cn: 'Sub Components',
      feature_product_description_id: 'Explore the key sub-components that make the MS700 a dependable and high-performing truck in every condition.',
      feature_product_description_en: 'Explore the key sub-components that make the MS700 a dependable and high-performing truck in every condition.',
      feature_product_description_cn: 'Explore the key sub-components that make the MS700 a dependable and high-performing truck in every condition.',
      no_order: '1',
      created_at: '2025-05-23 11:36:42.75+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-06-17 10:50:58.262+07',
      updated_by: 'ccdf2a53-b7b8-4d37-9d65-d30753564baa',
      deleted_at: null,
      deleted_by: null
    },
    {
      feature_product_id: 'dbaff032-1c67-4dc9-a210-7a15bebcf3c0',
      product_id: 'c10d67b8-b699-494b-88a7-81977a202625',
      feature_product_title_id: 'Tough as steel',
      feature_product_title_en: 'Tough as steel',
      feature_product_title_cn: 'Tough as steel',
      feature_product_description_id: 'Born to withstand, the MS600 delivers unwavering strength and durability—tough as steel in every terrain.',
      feature_product_description_en: 'Born to withstand, the MS600 delivers unwavering strength and durability—tough as steel in every terrain.',
      feature_product_description_cn: 'Born to withstand, the MS600 delivers unwavering strength and durability—tough as steel in every terrain.',
      no_order: '1',
      created_at: '2025-05-21 10:01:32.141+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-06-17 10:42:15.187+07',
      updated_by: 'ccdf2a53-b7b8-4d37-9d65-d30753564baa',
      deleted_at: null,
      deleted_by: null
    },
    {
      feature_product_id: 'e116e5f9-dc8c-4730-b268-05a74ddcffce',
      product_id: '0f2c0c3f-7934-4872-bbbe-5bea2dce0e27',
      feature_product_title_id: 'Core Components',
      feature_product_title_en: 'Core Components',
      feature_product_title_cn: 'Core Components',
      feature_product_description_id: 'The MS700 blends advanced technology with proven durability, built to handle even the harshest routes-powered by three core components.',
      feature_product_description_en: 'The MS700 blends advanced technology with proven durability, built to handle even the harshest routes-powered by three core components.',
      feature_product_description_cn: 'The MS700 blends advanced technology with proven durability, built to handle even the harshest routes-powered by three core components.',
      no_order: '2',
      created_at: '2025-05-23 11:36:05.601+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-06-17 10:51:43.517+07',
      updated_by: 'ccdf2a53-b7b8-4d37-9d65-d30753564baa',
      deleted_at: null,
      deleted_by: null
    }
  ]);
};

