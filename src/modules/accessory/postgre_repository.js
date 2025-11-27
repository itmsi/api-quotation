const db = require('../../config/database');
const accessoriesIslandDetailRepository = require('./accessories_island_detail_repository');

const TABLE_NAME = 'accessories';

/**
 * Build where clause for search
 */
const buildSearchWhere = (search) => {
  if (!search || search.trim() === '') return null;
  
  const searchPattern = `%${search.trim().toLowerCase()}%`;
  
  return function() {
    this.where(function() {
      this.whereRaw('LOWER(accessory_part_number) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(accessory_part_name) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(accessory_specification) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(accessory_brand) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(accessory_remark) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(accessory_region) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(accessory_description) LIKE ?', [searchPattern]);
    });
  };
};

/**
 * Find all accessories with pagination, search, and sort
 */
const findAll = async (params) => {
  const { page, limit, offset, search, sortBy, sortOrder } = params;
  
  const sortOrderSafe = ['asc', 'desc'].includes((sortOrder || '').toLowerCase())
    ? sortOrder.toLowerCase()
    : 'desc';
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);
  const offsetNumber = Math.max(parseInt(offset, 10) || 0, 0);
  
  let query = db(TABLE_NAME)
    .where('is_delete', false);
  
  // Apply search
  if (search && search.trim() !== '') {
    const searchWhere = buildSearchWhere(search);
    query = query.where(searchWhere);
  }
  
  // Apply sorting
  query = query.orderBy(sortBy || 'created_at', sortOrderSafe);
  
  // Apply pagination
  query = query
    .limit(limitNumber)
    .offset(offsetNumber);
  
  const data = await query;
  
  // Get accessories_island_detail for each accessory
  if (data && data.length > 0) {
    for (const item of data) {
      const islandDetails = await accessoriesIslandDetailRepository.findByAccessoriesId(item.accessory_id);
      item.accessories_island_detail = islandDetails;
    }
  }
  
  // Count total
  let countQuery = db(TABLE_NAME)
    .where('is_delete', false);
  
  if (search && search.trim() !== '') {
    const searchWhere = buildSearchWhere(search);
    countQuery = countQuery.where(searchWhere);
  }
  
  const totalResult = await countQuery.count('accessory_id as count').first();
  const total = parseInt(totalResult?.count || 0, 10);
  
  return {
    items: data || [],
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber)
    }
  };
};

/**
 * Find single accessory by ID
 */
const findById = async (id) => {
  const result = await db(TABLE_NAME)
    .where({ accessory_id: id, is_delete: false })
    .first();
  
  if (result) {
    // Get accessories_island_detail
    const islandDetails = await accessoriesIslandDetailRepository.findByAccessoriesId(id);
    result.accessories_island_detail = islandDetails;
  }
  
  return result || null;
};

/**
 * Find by custom condition
 */
const findOne = async (conditions) => {
  return await db(TABLE_NAME)
    .where({ ...conditions, is_delete: false })
    .first();
};

/**
 * Create new accessory
 */
const create = async (data) => {
  const insertData = {
    accessory_part_number: data.accessory_part_number || null,
    accessory_part_name: data.accessory_part_name || null,
    accessory_specification: data.accessory_specification || null,
    accessory_brand: data.accessory_brand || null,
    accessory_remark: data.accessory_remark || null,
    accessory_region: data.accessory_region || null,
    accessory_description: data.accessory_description || null,
    created_by: data.created_by || null
  };
  
  const [result] = await db(TABLE_NAME)
    .insert(insertData)
    .returning('*');
  
  return result;
};

/**
 * Update existing accessory
 */
const update = async (id, data) => {
  const updateFields = {};
  
  if (data.accessory_part_number !== undefined) updateFields.accessory_part_number = data.accessory_part_number;
  if (data.accessory_part_name !== undefined) updateFields.accessory_part_name = data.accessory_part_name;
  if (data.accessory_specification !== undefined) updateFields.accessory_specification = data.accessory_specification;
  if (data.accessory_brand !== undefined) updateFields.accessory_brand = data.accessory_brand;
  if (data.accessory_remark !== undefined) updateFields.accessory_remark = data.accessory_remark;
  if (data.accessory_region !== undefined) updateFields.accessory_region = data.accessory_region;
  if (data.accessory_description !== undefined) updateFields.accessory_description = data.accessory_description;
  if (data.updated_by !== undefined) updateFields.updated_by = data.updated_by;
  
  if (Object.keys(updateFields).length === 0) {
    return null;
  }
  
  const [result] = await db(TABLE_NAME)
    .where({ accessory_id: id, is_delete: false })
    .update({
      ...updateFields,
      updated_at: db.fn.now()
    })
    .returning('*');
  
  return result || null;
};

/**
 * Soft delete accessory
 */
const remove = async (id, data = {}) => {
  const deleteFields = {
    is_delete: true,
    deleted_at: db.fn.now()
  };
  
  if (data.deleted_by !== undefined) {
    deleteFields.deleted_by = data.deleted_by;
  }
  
  const [result] = await db(TABLE_NAME)
    .where({ accessory_id: id, is_delete: false })
    .update(deleteFields)
    .returning('*');
  
  return result || null;
};

/**
 * Restore soft deleted accessory
 */
const restore = async (id) => {
  const [result] = await db(TABLE_NAME)
    .where({ accessory_id: id, is_delete: true })
    .update({
      is_delete: false,
      deleted_at: null,
      deleted_by: null,
      updated_at: db.fn.now()
    })
    .returning('*');
  
  return result || null;
};

/**
 * Hard delete accessory (permanent)
 */
const hardDelete = async (id) => {
  return await db(TABLE_NAME)
    .where({ accessory_id: id })
    .del();
};

module.exports = {
  findAll,
  findById,
  findOne,
  create,
  update,
  remove,
  restore,
  hardDelete
};

