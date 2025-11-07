const db = require('../../config/database');

const TABLE_NAME = 'componen_products';

/**
 * Build where clause for search
 */
const buildSearchWhere = (search) => {
  if (!search || search.trim() === '') return null;
  
  const searchPattern = `%${search.trim().toLowerCase()}%`;
  
  return function() {
    this.where(function() {
      this.whereRaw('LOWER(code_unique) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(componen_product_name) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(segment) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(msi_model) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(wheel_no) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(engine) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(horse_power) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(componen_product_description) LIKE ?', [searchPattern]);
    });
  };
};

/**
 * Find all componen products with pagination, search, and sort
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
  
  const totalResult = await countQuery.count('componen_product_id as count').first();
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
 * Find single componen product by ID
 */
const findById = async (id) => {
  const result = await db(TABLE_NAME)
    .where({ componen_product_id: id, is_delete: false })
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
 * Create new componen product
 */
const create = async (data) => {
  const insertData = {
    product_dimensi_id: data.product_dimensi_id || null,
    componen_product_name: data.componen_product_name || null,
    componen_type: data.componen_type || null,
    code_unique: data.code_unique || null,
    segment: data.segment || null,
    msi_model: data.msi_model || null,
    wheel_no: data.wheel_no || null,
    engine: data.engine || null,
    horse_power: data.horse_power || null,
    market_price: data.market_price || null,
    selling_price_star_1: data.selling_price_star_1 || null,
    selling_price_star_2: data.selling_price_star_2 || null,
    selling_price_star_3: data.selling_price_star_3 || null,
    selling_price_star_4: data.selling_price_star_4 || null,
    selling_price_star_5: data.selling_price_star_5 || null,
    image: data.image || null,
    componen_product_description: data.componen_product_description || null,
    created_by: data.created_by || null
  };
  
  const [result] = await db(TABLE_NAME)
    .insert(insertData)
    .returning('*');
  
  return result;
};

/**
 * Update existing componen product
 */
const update = async (id, data) => {
  const updateFields = {};
  
  if (data.product_dimensi_id !== undefined) updateFields.product_dimensi_id = data.product_dimensi_id;
  if (data.componen_product_name !== undefined) updateFields.componen_product_name = data.componen_product_name;
  if (data.componen_type !== undefined) updateFields.componen_type = data.componen_type;
  if (data.code_unique !== undefined) updateFields.code_unique = data.code_unique;
  if (data.segment !== undefined) updateFields.segment = data.segment;
  if (data.msi_model !== undefined) updateFields.msi_model = data.msi_model;
  if (data.wheel_no !== undefined) updateFields.wheel_no = data.wheel_no;
  if (data.engine !== undefined) updateFields.engine = data.engine;
  if (data.horse_power !== undefined) updateFields.horse_power = data.horse_power;
  if (data.market_price !== undefined) updateFields.market_price = data.market_price;
  if (data.selling_price_star_1 !== undefined) updateFields.selling_price_star_1 = data.selling_price_star_1;
  if (data.selling_price_star_2 !== undefined) updateFields.selling_price_star_2 = data.selling_price_star_2;
  if (data.selling_price_star_3 !== undefined) updateFields.selling_price_star_3 = data.selling_price_star_3;
  if (data.selling_price_star_4 !== undefined) updateFields.selling_price_star_4 = data.selling_price_star_4;
  if (data.selling_price_star_5 !== undefined) updateFields.selling_price_star_5 = data.selling_price_star_5;
  if (data.image !== undefined) updateFields.image = data.image;
  if (data.componen_product_description !== undefined) updateFields.componen_product_description = data.componen_product_description;
  if (data.updated_by !== undefined) updateFields.updated_by = data.updated_by;
  
  if (Object.keys(updateFields).length === 0) {
    return null;
  }
  
  const [result] = await db(TABLE_NAME)
    .where({ componen_product_id: id, is_delete: false })
    .update({
      ...updateFields,
      updated_at: db.fn.now()
    })
    .returning('*');
  
  return result || null;
};

/**
 * Soft delete componen product
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
    .where({ componen_product_id: id, is_delete: false })
    .update(deleteFields)
    .returning('*');
  
  return result || null;
};

/**
 * Restore soft deleted componen product
 */
const restore = async (id) => {
  const [result] = await db(TABLE_NAME)
    .where({ componen_product_id: id, is_delete: true })
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
 * Hard delete componen product (permanent)
 */
const hardDelete = async (id) => {
  return await db(TABLE_NAME)
    .where({ componen_product_id: id })
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

