const db = require('../../config/database');

const TABLE_NAME = 'accessories_island_detail';

/**
 * Find all accessories_island_detail by accessories_id
 */
const findByAccessoriesId = async (accessoriesId) => {
  const results = await db(TABLE_NAME)
    .where({ accessories_id: accessoriesId })
    .orderBy('created_at', 'asc');
  
  return results || [];
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

