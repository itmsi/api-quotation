const db = require('../../config/database');

const TABLE_NAME = 'item_products';

/**
 * Build where clause for search
 */
const buildSearchWhere = (search) => {
  if (!search || search.trim() === '') return null;
  
  const searchPattern = `%${search.trim().toLowerCase()}%`;
  
  return function() {
    this.where(function() {
      this.whereRaw('LOWER(item_product_code) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(item_product_model) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(item_product_segment) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(item_product_msi_model) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(item_product_description) LIKE ?', [searchPattern]);
    });
  };
};

/**
 * Find all item products with pagination, search, and sort
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
  
  // Count total
  let countQuery = db(TABLE_NAME)
    .where('is_delete', false);
  
  if (search && search.trim() !== '') {
    const searchWhere = buildSearchWhere(search);
    countQuery = countQuery.where(searchWhere);
  }
  
  const totalResult = await countQuery.count('item_product_id as count').first();
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
 * Find single item product by ID
 */
const findById = async (id) => {
  const result = await db(TABLE_NAME)
    .where({ item_product_id: id, is_delete: false })
    .first();
  
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
 * Create new item product
 */
const create = async (data) => {
  const insertData = {
    item_product_code: data.item_product_code || null,
    item_product_model: data.item_product_model || null,
    item_product_segment: data.item_product_segment || null,
    item_product_msi_model: data.item_product_msi_model || null,
    item_product_wheel_no: data.item_product_wheel_no || null,
    item_product_engine: data.item_product_engine || null,
    item_product_horse_power: data.item_product_horse_power || null,
    item_product_market_price: data.item_product_market_price || null,
    item_product_selling_price_star_1: data.item_product_selling_price_star_1 || null,
    item_product_selling_price_star_2: data.item_product_selling_price_star_2 || null,
    item_product_selling_price_star_3: data.item_product_selling_price_star_3 || null,
    item_product_selling_price_star_4: data.item_product_selling_price_star_4 || null,
    item_product_selling_price_star_5: data.item_product_selling_price_star_5 || null,
    item_product_description: data.item_product_description || null,
    item_product_image: data.item_product_image || null,
    created_by: data.created_by || null
  };
  
  const [result] = await db(TABLE_NAME)
    .insert(insertData)
    .returning('*');
  
  return result;
};

/**
 * Update existing item product
 */
const update = async (id, data) => {
  const updateFields = {};
  
  if (data.item_product_code !== undefined) updateFields.item_product_code = data.item_product_code;
  if (data.item_product_model !== undefined) updateFields.item_product_model = data.item_product_model;
  if (data.item_product_segment !== undefined) updateFields.item_product_segment = data.item_product_segment;
  if (data.item_product_msi_model !== undefined) updateFields.item_product_msi_model = data.item_product_msi_model;
  if (data.item_product_wheel_no !== undefined) updateFields.item_product_wheel_no = data.item_product_wheel_no;
  if (data.item_product_engine !== undefined) updateFields.item_product_engine = data.item_product_engine;
  if (data.item_product_horse_power !== undefined) updateFields.item_product_horse_power = data.item_product_horse_power;
  if (data.item_product_market_price !== undefined) updateFields.item_product_market_price = data.item_product_market_price;
  if (data.item_product_selling_price_star_1 !== undefined) updateFields.item_product_selling_price_star_1 = data.item_product_selling_price_star_1;
  if (data.item_product_selling_price_star_2 !== undefined) updateFields.item_product_selling_price_star_2 = data.item_product_selling_price_star_2;
  if (data.item_product_selling_price_star_3 !== undefined) updateFields.item_product_selling_price_star_3 = data.item_product_selling_price_star_3;
  if (data.item_product_selling_price_star_4 !== undefined) updateFields.item_product_selling_price_star_4 = data.item_product_selling_price_star_4;
  if (data.item_product_selling_price_star_5 !== undefined) updateFields.item_product_selling_price_star_5 = data.item_product_selling_price_star_5;
  if (data.item_product_description !== undefined) updateFields.item_product_description = data.item_product_description;
  if (data.item_product_image !== undefined) updateFields.item_product_image = data.item_product_image;
  if (data.updated_by !== undefined) updateFields.updated_by = data.updated_by;
  
  if (Object.keys(updateFields).length === 0) {
    return null;
  }
  
  const [result] = await db(TABLE_NAME)
    .where({ item_product_id: id, is_delete: false })
    .update({
      ...updateFields,
      updated_at: db.fn.now()
    })
    .returning('*');
  
  return result || null;
};

/**
 * Soft delete item product
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
    .where({ item_product_id: id, is_delete: false })
    .update(deleteFields)
    .returning('*');
  
  return result || null;
};

/**
 * Restore soft deleted item product
 */
const restore = async (id) => {
  const [result] = await db(TABLE_NAME)
    .where({ item_product_id: id, is_delete: true })
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
 * Hard delete item product (permanent)
 */
const hardDelete = async (id) => {
  return await db(TABLE_NAME)
    .where({ item_product_id: id })
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

