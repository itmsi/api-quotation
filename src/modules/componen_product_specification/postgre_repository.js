const db = require('../../config/database');

const TABLE_NAME = 'componen_product_specifications';

/**
 * Build where clause for search
 */
const buildSearchWhere = (search) => {
  if (!search || search.trim() === '') {
    return null;
  }

  const searchPattern = `%${search.trim().toLowerCase()}%`;

  return function () {
    this.where(function () {
      this.whereRaw('LOWER(componen_product_specification_label) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(componen_product_specification_value) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(COALESCE(componen_product_specification_description, \'\')) LIKE ?', [searchPattern]);
    });
  };
};

/**
 * Find all componen product specifications with pagination, search, and sort
 */
const findAll = async (params) => {
  const { page, limit, offset, search, sortBy, sortOrder, componen_product_id } = params;

  const sortOrderSafe = ['asc', 'desc'].includes((sortOrder || '').toLowerCase())
    ? sortOrder.toLowerCase()
    : 'desc';

  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);
  const offsetNumber = Math.max(parseInt(offset, 10) || 0, 0);

  let query = db(TABLE_NAME)
    .where('is_delete', false);

  if (componen_product_id) {
    query = query.where('componen_product_id', componen_product_id);
  }

  if (search && search.trim() !== '') {
    const searchWhere = buildSearchWhere(search);
    query = query.where(searchWhere);
  }

  query = query
    .orderBy(sortBy || 'created_at', sortOrderSafe)
    .limit(limitNumber)
    .offset(offsetNumber);

  const data = await query;

  let countQuery = db(TABLE_NAME)
    .where('is_delete', false);

  if (componen_product_id) {
    countQuery = countQuery.where('componen_product_id', componen_product_id);
  }

  if (search && search.trim() !== '') {
    const searchWhere = buildSearchWhere(search);
    countQuery = countQuery.where(searchWhere);
  }

  const totalResult = await countQuery.count('componen_product_specification_id as count').first();
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
 * Find single componen product specification by ID
 */
const findById = async (id) => {
  const result = await db(TABLE_NAME)
    .where({
      componen_product_specification_id: id,
      is_delete: false
    })
    .first();

  return result || null;
};

/**
 * Create new componen product specification
 */
const create = async (data) => {
  const insertData = {
    componen_product_id: data.componen_product_id || null,
    componen_product_specification_label: data.componen_product_specification_label || null,
    componen_product_specification_value: data.componen_product_specification_value || null,
    componen_product_specification_description: data.componen_product_specification_description || null,
    created_by: data.created_by || null
  };

  const [result] = await db(TABLE_NAME)
    .insert(insertData)
    .returning('*');

  return result;
};

/**
 * Update existing componen product specification
 */
const update = async (id, data) => {
  const updateFields = {};

  if (data.componen_product_id !== undefined) {
    updateFields.componen_product_id = data.componen_product_id;
  }
  if (data.componen_product_specification_label !== undefined) {
    updateFields.componen_product_specification_label = data.componen_product_specification_label;
  }
  if (data.componen_product_specification_value !== undefined) {
    updateFields.componen_product_specification_value = data.componen_product_specification_value;
  }
  if (data.componen_product_specification_description !== undefined) {
    updateFields.componen_product_specification_description = data.componen_product_specification_description;
  }
  if (data.updated_by !== undefined) {
    updateFields.updated_by = data.updated_by;
  }

  if (Object.keys(updateFields).length === 0) {
    return null;
  }

  const [result] = await db(TABLE_NAME)
    .where({
      componen_product_specification_id: id,
      is_delete: false
    })
    .update({
      ...updateFields,
      updated_at: db.fn.now()
    })
    .returning('*');

  return result || null;
};

/**
 * Soft delete componen product specification
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
    .where({
      componen_product_specification_id: id,
      is_delete: false
    })
    .update(deleteFields)
    .returning('*');

  return result || null;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};


