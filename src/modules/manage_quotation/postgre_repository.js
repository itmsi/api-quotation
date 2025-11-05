const db = require('../../config/database');

const TABLE_NAME = 'manage_quotations';

/**
 * Find all manage quotations with pagination, search, and sort
 */
const findAll = async (params) => {
  const { page, limit, offset, search, sortBy, sortOrder } = params;
  
  // Query data - use parameterized query with knex
  let query = db(TABLE_NAME)
    .select(
      'manage_quotation_id',
      'manage_quotation_no',
      'customer_id',
      'employee_id',
      'manage_quotation_date',
      'manage_quotation_valid_date',
      'manage_quotation_grand_total',
      'manage_quotation_ppn',
      'manage_quotation_delivery_fee',
      'manage_quotation_other',
      'manage_quotation_payment_presentase',
      'manage_quotation_payment_nominal',
      'manage_quotation_description',
      'created_by',
      'updated_by',
      'deleted_by',
      'created_at',
      'updated_at',
      'deleted_at',
      'is_delete'
    )
    .where('is_delete', false);
  
  // Add search condition
  if (search && search.trim() !== '') {
    const searchLower = `%${search.toLowerCase()}%`;
    query = query.where(function() {
      this.where('manage_quotation_no', 'ILIKE', searchLower)
        .orWhere(db.raw('LOWER(CAST(customer_id AS TEXT))'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(CAST(employee_id AS TEXT))'), 'LIKE', searchLower);
    });
  }
  
  // Add sorting
  const sortBySafe = ['created_at', 'manage_quotation_no', 'manage_quotation_date', 'manage_quotation_valid_date'].includes(sortBy) 
    ? sortBy 
    : 'created_at';
  const sortOrderSafe = ['asc', 'desc'].includes(sortOrder?.toLowerCase()) ? sortOrder : 'desc';
  
  query = query.orderBy(sortBySafe, sortOrderSafe).limit(parseInt(limit)).offset(parseInt(offset));
  
  const data = await query;
  
  // Query total count
  let countQuery = db(TABLE_NAME).count('* as count').where('is_delete', false);
  
  if (search && search.trim() !== '') {
    const searchLower = `%${search.toLowerCase()}%`;
    countQuery = countQuery.where(function() {
      this.where('manage_quotation_no', 'ILIKE', searchLower)
        .orWhere(db.raw('LOWER(CAST(customer_id AS TEXT))'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(CAST(employee_id AS TEXT))'), 'LIKE', searchLower);
    });
  }
  
  const totalResult = await countQuery;
  const total = totalResult[0]?.count || 0;
  
  return {
    items: data || [],
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(total),
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Find single manage quotation by ID
 */
const findById = async (id) => {
  const query = `
    SELECT 
      manage_quotation_id,
      manage_quotation_no,
      customer_id,
      employee_id,
      manage_quotation_date,
      manage_quotation_valid_date,
      manage_quotation_grand_total,
      manage_quotation_ppn,
      manage_quotation_delivery_fee,
      manage_quotation_other,
      manage_quotation_payment_presentase,
      manage_quotation_payment_nominal,
      manage_quotation_description,
      created_by,
      updated_by,
      deleted_by,
      created_at,
      updated_at,
      deleted_at,
      is_delete
    FROM ${TABLE_NAME}
    WHERE manage_quotation_id = $1 AND is_delete = false
  `;
  
  const result = await db.raw(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find by custom condition
 */
const findOne = async (conditions) => {
  const whereClause = Object.keys(conditions)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(' AND ');
  
  const query = `
    SELECT * FROM ${TABLE_NAME}
    WHERE ${whereClause} AND is_delete = false
    LIMIT 1
  `;
  
  const result = await db.raw(query, Object.values(conditions));
  return result.rows[0] || null;
};

/**
 * Create new manage quotation
 */
const create = async (data) => {
  // Build fields object - include all expected fields
  const fields = {
    manage_quotation_no: data.manage_quotation_no || null,
    customer_id: data.customer_id || null,
    employee_id: data.employee_id || null,
    manage_quotation_date: data.manage_quotation_date || null,
    manage_quotation_valid_date: data.manage_quotation_valid_date || null,
    manage_quotation_grand_total: data.manage_quotation_grand_total || null,
    manage_quotation_ppn: data.manage_quotation_ppn || null,
    manage_quotation_delivery_fee: data.manage_quotation_delivery_fee || null,
    manage_quotation_other: data.manage_quotation_other || null,
    manage_quotation_payment_presentase: data.manage_quotation_payment_presentase || null,
    manage_quotation_payment_nominal: data.manage_quotation_payment_nominal || null,
    manage_quotation_description: data.manage_quotation_description || null,
    created_by: data.created_by || null
  };
  
  const result = await db(TABLE_NAME)
    .insert(fields)
    .returning('*');
  
  return result[0] || null;
};

/**
 * Update existing manage quotation
 */
const update = async (id, data) => {
  const updateFields = {};
  if (data.manage_quotation_no !== undefined) updateFields.manage_quotation_no = data.manage_quotation_no;
  if (data.customer_id !== undefined) updateFields.customer_id = data.customer_id;
  if (data.employee_id !== undefined) updateFields.employee_id = data.employee_id;
  if (data.manage_quotation_date !== undefined) updateFields.manage_quotation_date = data.manage_quotation_date;
  if (data.manage_quotation_valid_date !== undefined) updateFields.manage_quotation_valid_date = data.manage_quotation_valid_date;
  if (data.manage_quotation_grand_total !== undefined) updateFields.manage_quotation_grand_total = data.manage_quotation_grand_total;
  if (data.manage_quotation_ppn !== undefined) updateFields.manage_quotation_ppn = data.manage_quotation_ppn;
  if (data.manage_quotation_delivery_fee !== undefined) updateFields.manage_quotation_delivery_fee = data.manage_quotation_delivery_fee;
  if (data.manage_quotation_other !== undefined) updateFields.manage_quotation_other = data.manage_quotation_other;
  if (data.manage_quotation_payment_presentase !== undefined) updateFields.manage_quotation_payment_presentase = data.manage_quotation_payment_presentase;
  if (data.manage_quotation_payment_nominal !== undefined) updateFields.manage_quotation_payment_nominal = data.manage_quotation_payment_nominal;
  if (data.manage_quotation_description !== undefined) updateFields.manage_quotation_description = data.manage_quotation_description;
  if (data.updated_by !== undefined) updateFields.updated_by = data.updated_by;
  if (data.deleted_by !== undefined) updateFields.deleted_by = data.deleted_by;
  
  if (Object.keys(updateFields).length === 0) {
    return null;
  }
  
  const setClause = Object.keys(updateFields).map((key, index) => `${key} = $${index + 2}`).join(', ');
  
  const values = [id, ...Object.values(updateFields)];
  
  const query = `
    UPDATE ${TABLE_NAME}
    SET ${setClause}, updated_at = NOW()
    WHERE manage_quotation_id = $1 AND is_delete = false
    RETURNING *
  `;
  
  const result = await db.raw(query, values);
  return result.rows[0] || null;
};

/**
 * Soft delete manage quotation
 */
const remove = async (id) => {
  const query = `
    UPDATE ${TABLE_NAME}
    SET is_delete = true, deleted_at = NOW()
    WHERE manage_quotation_id = $1 AND is_delete = false
    RETURNING *
  `;
  
  const result = await db.raw(query, [id]);
  return result.rows[0] || null;
};

/**
 * Restore soft deleted manage quotation
 */
const restore = async (id) => {
  const query = `
    UPDATE ${TABLE_NAME}
    SET is_delete = false, deleted_at = NULL, updated_at = NOW()
    WHERE manage_quotation_id = $1 AND is_delete = true
    RETURNING *
  `;
  
  const result = await db.raw(query, [id]);
  return result.rows[0] || null;
};

/**
 * Hard delete manage quotation (permanent)
 */
const hardDelete = async (id) => {
  const query = `
    DELETE FROM ${TABLE_NAME}
    WHERE manage_quotation_id = $1
  `;
  
  const result = await db.raw(query, [id]);
  return result.rowCount > 0;
};

/**
 * ITEM FUNCTIONS
 */

const ITEMS_TABLE_NAME = 'manage_quotation_items';

/**
 * Create quotation items
 */
const createItems = async (manage_quotation_id, items, created_by) => {
  if (!items || items.length === 0) {
    return [];
  }
  
  const results = [];
  
  for (const item of items) {
    const fields = {
      manage_quotation_id: manage_quotation_id || null,
      item_product_id: item.item_product_id || null,
      unit_code: item.unit_code || null,
      unit_model: item.unit_model || null,
      segment: item.segment || null,
      msi_model: item.msi_model || null,
      wheel_no: item.wheel_no || null,
      engine: item.engine || null,
      horse_power: item.horse_power || null,
      quantity: item.quantity || 1,
      price: item.price || null,
      total: item.total || null,
      description: item.description || null,
      created_by: created_by || null
    };
    
    const result = await db(ITEMS_TABLE_NAME)
      .insert(fields)
      .returning('*');
    
    results.push(result[0]);
  }
  
  return results;
};

/**
 * Get items by quotation ID
 */
const getItemsByQuotationId = async (manage_quotation_id) => {
  const query = `
    SELECT * FROM ${ITEMS_TABLE_NAME}
    WHERE manage_quotation_id = $1 AND is_delete = false
    ORDER BY created_at ASC
  `;
  
  const result = await db.raw(query, [manage_quotation_id]);
  return result.rows || [];
};

/**
 * Delete items by quotation ID
 */
const deleteItemsByQuotationId = async (manage_quotation_id) => {
  const query = `
    UPDATE ${ITEMS_TABLE_NAME}
    SET is_delete = true, deleted_at = NOW()
    WHERE manage_quotation_id = $1 AND is_delete = false
  `;
  
  const result = await db.raw(query, [manage_quotation_id]);
  return result.rowCount > 0;
};

/**
 * Delete all items and recreate for quotation
 */
const replaceItems = async (manage_quotation_id, items, updated_by) => {
  // Soft delete all existing items
  await deleteItemsByQuotationId(manage_quotation_id);
  
  // Create new items
  const newItems = await createItems(manage_quotation_id, items, updated_by);
  
  return newItems;
};

module.exports = {
  findAll,
  findById,
  findOne,
  create,
  update,
  remove,
  restore,
  hardDelete,
  createItems,
  getItemsByQuotationId,
  deleteItemsByQuotationId,
  replaceItems
};

