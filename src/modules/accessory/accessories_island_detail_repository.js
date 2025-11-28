const db = require('../../config/database');
const customerRepository = require('../cutomer/postgre_repository');

const TABLE_NAME = 'accessories_island_detail';
const DBLINK_NAME = 'gate_sso_dblink';

/**
 * Get islands by IDs from gate_sso using dblink
 */
const getIslandsByIds = async (ids = []) => {
  if (!ids || ids.length === 0) {
    return [];
  }

  try {
    await customerRepository.ensureConnection();

    const uniqueIds = [...new Set(ids.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return [];
    }

    // Escape IDs using PostgreSQL quote_literal
    const escapedIds = [];
    for (const id of uniqueIds) {
      const escapedIdResult = await db.raw(`SELECT quote_literal(?) as escaped`, [id]);
      const escapedId = escapedIdResult.rows[0]?.escaped;
      escapedIds.push(escapedId);
    }

    const idsList = escapedIds.join(', ');
    const innerQuery = `SELECT island_id, island_name FROM islands WHERE island_id IN (${idsList})`;

    // Escape the entire inner query
    const escapedQueryResult = await db.raw(`SELECT quote_literal(?) as escaped`, [innerQuery]);
    const escapedInnerQuery = escapedQueryResult.rows[0]?.escaped;

    const query = `
      SELECT * FROM dblink('${DBLINK_NAME}', 
        ${escapedInnerQuery}
      ) AS islands (
        island_id uuid,
        island_name varchar
      )
    `;

    const result = await db.raw(query);
    return result.rows || [];
  } catch (error) {
    console.error('[accessories_island_detail:getIslandsByIds] gagal memuat islands', {
      island_ids: ids,
      message: error?.message
    });
    return [];
  }
};

/**
 * Find all accessories_island_detail by accessories_id
 */
const findByAccessoriesId = async (accessoriesId) => {
  const results = await db(TABLE_NAME)
    .where({ accessories_id: accessoriesId })
    .orderBy('created_at', 'asc');
  
  if (!results || results.length === 0) {
    return [];
  }

  // Get all unique island_ids
  const islandIds = results
    .map(item => item.island_id)
    .filter(Boolean);
  
  // Get island names from gate_sso
  const islands = await getIslandsByIds(islandIds);
  
  // Create a map for quick lookup
  const islandMap = new Map();
  islands.forEach(island => {
    islandMap.set(island.island_id, island.island_name);
  });
  
  // Add island_name to each result
  const resultsWithIslandName = results.map(item => ({
    ...item,
    island_name: islandMap.get(item.island_id) || null
  }));
  
  return resultsWithIslandName;
};

/**
 * Create new accessories_island_detail
 */
const create = async (data) => {
  const insertData = {
    island_id: data.island_id || null,
    accessories_id: data.accessories_id || null,
    accessories_island_detail_quantity: data.accessories_island_detail_quantity || 0,
    accessories_island_detail_description: data.accessories_island_detail_description || null,
    created_by: data.created_by || null
  };
  
  const [result] = await db(TABLE_NAME)
    .insert(insertData)
    .returning('*');
  
  return result;
};

/**
 * Create multiple accessories_island_detail
 */
const createMultiple = async (items, accessoriesId, createdBy) => {
  if (!items || items.length === 0) {
    return [];
  }
  
  const insertData = items.map(item => ({
    island_id: item.island_id || null,
    accessories_id: accessoriesId,
    accessories_island_detail_quantity: item.accessories_island_detail_quantity || 0,
    accessories_island_detail_description: item.accessories_island_detail_description || null,
    created_by: createdBy || null
  }));
  
  const results = await db(TABLE_NAME)
    .insert(insertData)
    .returning('*');
  
  return results || [];
};

/**
 * Hard delete all accessories_island_detail by accessories_id
 */
const deleteByAccessoriesId = async (accessoriesId) => {
  await db(TABLE_NAME)
    .where({ accessories_id: accessoriesId })
    .del();
  
  return true;
};

/**
 * Update accessories_island_detail (delete old and create new)
 */
const updateByAccessoriesId = async (items, accessoriesId, updatedBy) => {
  // Hard delete existing records
  await deleteByAccessoriesId(accessoriesId);
  
  // Create new records
  if (items && items.length > 0) {
    return await createMultiple(items, accessoriesId, updatedBy);
  }
  
  return [];
};

module.exports = {
  findByAccessoriesId,
  create,
  createMultiple,
  deleteByAccessoriesId,
  updateByAccessoriesId
};

