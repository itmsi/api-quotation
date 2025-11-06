const db = require('../../config/database');
const moment = require('moment');
const componenProductRepository = require('../componen_product/postgre_repository');
const accessoryRepository = require('../accessory/postgre_repository');

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
      'manage_quotation_shipping_term',
      'manage_quotation_franco',
      'manage_quotation_lead_time',
      'term_content_id',
      'term_content_directory',
      'status',
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
  if (!id) {
    return null;
  }
  
  const result = await db(TABLE_NAME)
    .where({ manage_quotation_id: id, is_delete: false })
    .first();
  
  return result || null;
};

/**
 * Find by custom condition
 */
const findOne = async (conditions) => {
  if (!conditions || Object.keys(conditions).length === 0) {
    return null;
  }
  
  const result = await db(TABLE_NAME)
    .where({ ...conditions, is_delete: false })
    .first();
  
  return result || null;
};

/**
 * Generate quotation number with format: 001/IEC-MSI/2025
 * Format: {sequence}/IEC-MSI/{year}
 * Sequence increments per year, resets to 001 when year changes
 */
const generateQuotationNumber = async () => {
  const currentYear = moment().format('YYYY');
  const prefix = 'IEC-MSI';
  
  // Find the last quotation number for current year
  // Extract sequence number (first 3 digits before '/') and sort numerically
  const lastQuotation = await db(TABLE_NAME)
    .select('manage_quotation_no')
    .where('is_delete', false)
    .whereNotNull('manage_quotation_no')
    .whereRaw(`manage_quotation_no LIKE '%/${prefix}/${currentYear}'`)
    .orderByRaw(`CAST(SPLIT_PART(manage_quotation_no, '/', 1) AS INTEGER) DESC`)
    .first();
  
  let sequence = 1;
  
  if (lastQuotation && lastQuotation.manage_quotation_no) {
    // Extract sequence number from last quotation number
    // Format: 001/IEC-MSI/2025
    const parts = lastQuotation.manage_quotation_no.split('/');
    if (parts.length === 3 && parts[1] === prefix && parts[2] === currentYear) {
      const lastSequence = parseInt(parts[0], 10);
      if (!isNaN(lastSequence) && lastSequence > 0) {
        sequence = lastSequence + 1;
      }
    }
  }
  
  // Format sequence with leading zeros (001, 002, etc.)
  const sequenceStr = String(sequence).padStart(3, '0');
  
  return `${sequenceStr}/${prefix}/${currentYear}`;
};

/**
 * Create new manage quotation
 */
const create = async (data) => {
  // Generate quotation number if status is submit and no number provided
  let quotationNumber = data.manage_quotation_no || null;
  if (data.status === 'submit' && !quotationNumber) {
    quotationNumber = await generateQuotationNumber();
  }
  
  // Build fields object - include all expected fields
  const fields = {
    manage_quotation_no: quotationNumber,
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
    manage_quotation_shipping_term: data.manage_quotation_shipping_term || null,
    manage_quotation_franco: data.manage_quotation_franco || null,
    manage_quotation_lead_time: data.manage_quotation_lead_time || null,
    term_content_id: data.term_content_id || null,
    term_content_directory: data.term_content_directory || null,
    status: data.status || 'submit',
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
  // Check if status is changing to submit and quotation number is not set
  if (data.status === 'submit') {
    const existingQuotation = await findById(id);
    if (existingQuotation && !existingQuotation.manage_quotation_no) {
      // Generate quotation number if status is submit and no number exists
      data.manage_quotation_no = await generateQuotationNumber();
    }
  }
  
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
  if (data.manage_quotation_shipping_term !== undefined) updateFields.manage_quotation_shipping_term = data.manage_quotation_shipping_term;
  if (data.manage_quotation_franco !== undefined) updateFields.manage_quotation_franco = data.manage_quotation_franco;
  if (data.manage_quotation_lead_time !== undefined) updateFields.manage_quotation_lead_time = data.manage_quotation_lead_time;
  if (data.term_content_id !== undefined) updateFields.term_content_id = data.term_content_id;
  if (data.term_content_directory !== undefined) updateFields.term_content_directory = data.term_content_directory;
  if (data.status !== undefined) updateFields.status = data.status;
  if (data.updated_by !== undefined) updateFields.updated_by = data.updated_by;
  if (data.deleted_by !== undefined) updateFields.deleted_by = data.deleted_by;
  
  if (Object.keys(updateFields).length === 0) {
    return null;
  }
  
  // Use Knex query builder instead of raw query to avoid binding issues
  updateFields.updated_at = db.fn.now();
  
  const result = await db(TABLE_NAME)
    .where({ manage_quotation_id: id, is_delete: false })
    .update(updateFields)
    .returning('*');
  
  return result[0] || null;
};

/**
 * Soft delete manage quotation
 */
const remove = async (id) => {
  if (!id) {
    return null;
  }
  
  const result = await db(TABLE_NAME)
    .where({ manage_quotation_id: id, is_delete: false })
    .update({
      is_delete: true,
      deleted_at: db.fn.now()
    })
    .returning('*');
  
  return result[0] || null;
};

/**
 * Restore soft deleted manage quotation
 */
const restore = async (id) => {
  if (!id) {
    return null;
  }
  
  const result = await db(TABLE_NAME)
    .where({ manage_quotation_id: id, is_delete: true })
    .update({
      is_delete: false,
      deleted_at: null,
      deleted_by: null,
      updated_at: db.fn.now()
    })
    .returning('*');
  
  return result[0] || null;
};

/**
 * Hard delete manage quotation (permanent)
 */
const hardDelete = async (id) => {
  if (!id) {
    return false;
  }
  
  const result = await db(TABLE_NAME)
    .where({ manage_quotation_id: id })
    .del();
  
  return result > 0;
};

/**
 * ITEM FUNCTIONS
 */

const ITEMS_TABLE_NAME = 'manage_quotation_items';

/**
 * Validate componen_product_id exists
 */
const validateComponenProductIds = async (items) => {
  if (!items || items.length === 0) {
    return { isValid: true, invalidIds: [] };
  }
  
  const invalidIds = [];
  
  for (const item of items) {
    // Skip validation if componen_product_id is null or empty
    if (!item.componen_product_id) {
      continue;
    }
    
    // Check if componen_product_id exists
    const product = await componenProductRepository.findById(item.componen_product_id);
    if (!product) {
      invalidIds.push(item.componen_product_id);
    }
  }
  
  return {
    isValid: invalidIds.length === 0,
    invalidIds
  };
};

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
      componen_product_id: item.componen_product_id || null,
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
 * Get items by quotation ID with JOIN to componen_products
 */
const getItemsByQuotationId = async (manage_quotation_id) => {
  if (!manage_quotation_id) {
    return [];
  }
  
  const result = await db(`${ITEMS_TABLE_NAME} as mqi`)
    .select(
      'mqi.manage_quotation_item_id',
      'mqi.manage_quotation_id',
      'mqi.componen_product_id',
      'mqi.quantity',
      'mqi.price',
      'mqi.total',
      'mqi.description',
      'mqi.created_by',
      'mqi.updated_by',
      'mqi.deleted_by',
      'mqi.created_at',
      'mqi.updated_at',
      'mqi.deleted_at',
      'mqi.is_delete',
      // Data from componen_products - using db.raw for aliases
      db.raw('cp.code_unique as unit_code'),
      db.raw('cp.segment as segment'),
      db.raw('cp.msi_model as msi_model'),
      db.raw('cp.wheel_no as wheel_no'),
      db.raw('cp.engine as engine'),
      db.raw('cp.horse_power as horse_power'),
      'cp.market_price',
      'cp.image'
    )
    .leftJoin('componen_products as cp', function() {
      this.on('mqi.componen_product_id', '=', 'cp.componen_product_id')
          .andOn(db.raw('cp.is_delete = false'));
    })
    .where('mqi.manage_quotation_id', manage_quotation_id)
    .where('mqi.is_delete', false)
    .orderBy('mqi.created_at', 'asc');
  
  return result || [];
};

/**
 * Delete items by quotation ID
 */
const deleteItemsByQuotationId = async (manage_quotation_id) => {
  if (!manage_quotation_id) {
    return false;
  }
  
  const result = await db(ITEMS_TABLE_NAME)
    .where({ manage_quotation_id: manage_quotation_id, is_delete: false })
    .update({
      is_delete: true,
      deleted_at: db.fn.now()
    });
  
  return result > 0;
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

/**
 * ACCESSORY FUNCTIONS
 */

const ACCESSORIES_TABLE_NAME = 'manage_quotation_item_accessories';

/**
 * Validate accessory_id exists
 */
const validateAccessoryIds = async (accessories) => {
  if (!accessories || accessories.length === 0) {
    return { isValid: true, invalidIds: [] };
  }
  
  const invalidIds = [];
  
  for (const accessory of accessories) {
    // Skip validation if accessory_id is null or empty
    if (!accessory.accessory_id) {
      continue;
    }
    
    // Check if accessory_id exists
    const acc = await accessoryRepository.findById(accessory.accessory_id);
    if (!acc) {
      invalidIds.push(accessory.accessory_id);
    }
  }
  
  return {
    isValid: invalidIds.length === 0,
    invalidIds
  };
};

/**
 * Create quotation accessories
 */
const createAccessories = async (manage_quotation_id, accessories, created_by) => {
  if (!accessories || accessories.length === 0) {
    return [];
  }
  
  const results = [];
  
  for (const accessory of accessories) {
    const fields = {
      manage_quotation_id: manage_quotation_id || null,
      accessory_id: accessory.accessory_id || null,
      quantity: accessory.quantity || 1,
      description: accessory.description || null,
      created_by: created_by || null
    };
    
    const result = await db(ACCESSORIES_TABLE_NAME)
      .insert(fields)
      .returning('*');
    
    results.push(result[0]);
  }
  
  return results;
};

/**
 * Get accessories by quotation ID with JOIN to accessories
 */
const getAccessoriesByQuotationId = async (manage_quotation_id) => {
  if (!manage_quotation_id) {
    return [];
  }
  
  const result = await db(`${ACCESSORIES_TABLE_NAME} as mqia`)
    .select(
      'mqia.manage_quotation_item_accessory_id',
      'mqia.manage_quotation_id',
      'mqia.accessory_id',
      'mqia.quantity',
      'mqia.description',
      'mqia.created_by',
      'mqia.updated_by',
      'mqia.deleted_by',
      'mqia.created_at',
      'mqia.updated_at',
      'mqia.deleted_at',
      'mqia.is_delete',
      // Data from accessories
      'a.accessory_part_number',
      'a.accessory_part_name',
      'a.accessory_specification',
      'a.accessory_brand',
      'a.accessory_remark',
      'a.accessory_region',
      'a.accessory_description as accessory_full_description'
    )
    .leftJoin('accessories as a', function() {
      this.on('mqia.accessory_id', '=', 'a.accessory_id')
          .andOn(db.raw('a.is_delete = false'));
    })
    .where('mqia.manage_quotation_id', manage_quotation_id)
    .where('mqia.is_delete', false)
    .orderBy('mqia.created_at', 'asc');
  
  return result || [];
};

/**
 * Delete accessories by quotation ID
 */
const deleteAccessoriesByQuotationId = async (manage_quotation_id) => {
  if (!manage_quotation_id) {
    return false;
  }
  
  const result = await db(ACCESSORIES_TABLE_NAME)
    .where({ manage_quotation_id: manage_quotation_id, is_delete: false })
    .update({
      is_delete: true,
      deleted_at: db.fn.now()
    });
  
  return result > 0;
};

/**
 * Delete all accessories and recreate for quotation
 */
const replaceAccessories = async (manage_quotation_id, accessories, updated_by) => {
  // Soft delete all existing accessories
  await deleteAccessoriesByQuotationId(manage_quotation_id);
  
  // Create new accessories
  const newAccessories = await createAccessories(manage_quotation_id, accessories, updated_by);
  
  return newAccessories;
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
  generateQuotationNumber,
  validateComponenProductIds,
  createItems,
  getItemsByQuotationId,
  deleteItemsByQuotationId,
  replaceItems,
  validateAccessoryIds,
  createAccessories,
  getAccessoriesByQuotationId,
  deleteAccessoriesByQuotationId,
  replaceAccessories
};

