/**
 * Seeder: mst_specifications data
 */

exports.seed = async function(knex) {
  // Delete all existing entries using TRUNCATE CASCADE to handle foreign keys
  await knex.raw('TRUNCATE TABLE mst_specifications CASCADE');
  
  // Insert seed data
  await knex('mst_specifications').insert([
    {
      specification_id: 'b74f818f-6bc7-4210-9d7d-39bdc4fd76ba',
      specification_name: 'archived-2025052843908-Model/Series',
      description: null,
      created_at: '2025-05-28 16:35:32.194337+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-05-28 16:35:32.192+07',
      updated_by: null,
      deleted_at: '2025-05-28 16:39:08.101+07',
      deleted_by: '73d05c65-1567-433b-83bb-4f5c4d692335'
    },
    {
      specification_id: 'bf6eda69-2418-454a-8d61-bf2a082ad686',
      specification_name: 'archived-2025052843920-Engine/Mesin',
      description: null,
      created_at: '2025-05-28 16:35:51.922551+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-05-28 16:35:51.921+07',
      updated_by: null,
      deleted_at: '2025-05-28 16:39:20.234+07',
      deleted_by: '73d05c65-1567-433b-83bb-4f5c4d692335'
    },
    {
      specification_id: 'eb6f2901-e027-4a44-8ca8-17cb04755e73',
      specification_name: 'archived-2025052843922-Transmission/Transmisi ',
      description: null,
      created_at: '2025-05-28 16:36:21.408749+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-05-28 16:36:21.408+07',
      updated_by: null,
      deleted_at: '2025-05-28 16:39:22.484+07',
      deleted_by: '73d05c65-1567-433b-83bb-4f5c4d692335'
    },
    {
      specification_id: 'a4c6a8f1-1fbe-4f43-86ca-54dd6054a2ae',
      specification_name: 'archived-2025052843924-Clutch/Kopling',
      description: null,
      created_at: '2025-05-28 16:36:47.357523+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-05-28 16:36:47.356+07',
      updated_by: null,
      deleted_at: '2025-05-28 16:39:24.497+07',
      deleted_by: '73d05c65-1567-433b-83bb-4f5c4d692335'
    },
    {
      specification_id: '32805505-c62a-4b04-9e12-042a963cc637',
      specification_name: 'archived-2025052843927-Steering/Kemudi ',
      description: null,
      created_at: '2025-05-28 16:37:25.929162+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-05-28 16:37:25.928+07',
      updated_by: null,
      deleted_at: '2025-05-28 16:39:27.074+07',
      deleted_by: '73d05c65-1567-433b-83bb-4f5c4d692335'
    },
    {
      specification_id: '3c87ddfb-2e35-470e-b589-176a97d314f6',
      specification_name: 'archived-2025052843929-Axle/Sumbu',
      description: null,
      created_at: '2025-05-28 16:37:58.529501+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-05-28 16:37:58.528+07',
      updated_by: null,
      deleted_at: '2025-05-28 16:39:29.081+07',
      deleted_by: '73d05c65-1567-433b-83bb-4f5c4d692335'
    },
    {
      specification_id: '602f5e40-522f-448b-847c-007b064b629f',
      specification_name: 'archived-2025052843930-Tires/Ban',
      description: null,
      created_at: '2025-05-28 16:38:29.173616+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-05-28 16:38:29.172+07',
      updated_by: null,
      deleted_at: '2025-05-28 16:39:30.839+07',
      deleted_by: '73d05c65-1567-433b-83bb-4f5c4d692335'
    },
    {
      specification_id: '56e34afe-0094-4516-af54-79801842a4c7',
      specification_name: 'Engine',
      description: null,
      created_at: '2025-05-28 16:39:42.77471+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-05-28 16:39:42.773+07',
      updated_by: null,
      deleted_at: null,
      deleted_by: null
    },
    {
      specification_id: 'd9579c31-72a4-4d74-a0fd-65dde8b395ba',
      specification_name: 'Chassis',
      description: null,
      created_at: '2025-05-28 16:39:48.419779+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-05-28 16:39:48.419+07',
      updated_by: null,
      deleted_at: null,
      deleted_by: null
    },
    {
      specification_id: 'f025a81b-f6b3-443a-9ed0-76d276b2003d',
      specification_name: 'Safety & Security',
      description: null,
      created_at: '2025-05-28 16:39:55.166944+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-05-28 16:39:55.166+07',
      updated_by: null,
      deleted_at: null,
      deleted_by: null
    },
    {
      specification_id: '0811b02c-1804-4dfb-8ce8-d4ecdd15c7a0',
      specification_name: 'archived-20250530100634-Dimension',
      description: null,
      created_at: '2025-05-28 16:39:35.26713+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-05-28 16:39:35.266+07',
      updated_by: null,
      deleted_at: '2025-05-30 10:06:34.189+07',
      deleted_by: '73d05c65-1567-433b-83bb-4f5c4d692335'
    },
    {
      specification_id: 'd0ba5188-3152-4e3f-b37e-15a2a700d8e7',
      specification_name: 'Dimension',
      description: null,
      created_at: '2025-05-30 10:06:44.463365+07',
      created_by: '73d05c65-1567-433b-83bb-4f5c4d692335',
      updated_at: '2025-05-30 10:06:44.462+07',
      updated_by: null,
      deleted_at: null,
      deleted_by: null
    }
  ]);
};

