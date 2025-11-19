const customerRepository = require('../cutomer/postgre_repository');
const DBLINK_NAME = 'gate_sso_dblink';
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
  
  await customerRepository.ensureConnection();

  const customerJoin = db.raw(
    `dblink('${DBLINK_NAME}', 'SELECT customer_id, customer_name FROM customers WHERE customer_id IS NOT NULL') AS customer_data(customer_id uuid, customer_name varchar)`
  );

  const employeeJoin = db.raw(
    `dblink('${DBLINK_NAME}', 'SELECT employee_id, employee_name FROM employees WHERE employee_id IS NOT NULL AND is_delete = false') AS employee_data(employee_id uuid, employee_name varchar)`
  );

  // Query data - use parameterized query with knex
  let query = db({ mq: TABLE_NAME })
    .select(
      'mq.manage_quotation_id',
      'mq.manage_quotation_no',
      'mq.customer_id',
      db.raw('customer_data.customer_name as customer_name'),
      'mq.employee_id',
      db.raw('employee_data.employee_name as employee_name'),
      'mq.manage_quotation_date',
      'mq.manage_quotation_valid_date',
      'mq.manage_quotation_grand_total',
      'mq.manage_quotation_ppn',
      'mq.manage_quotation_delivery_fee',
      'mq.manage_quotation_other',
      'mq.manage_quotation_payment_presentase',
      'mq.manage_quotation_payment_nominal',
      'mq.manage_quotation_description',
      'mq.manage_quotation_shipping_term',
      'mq.manage_quotation_franco',
      'mq.manage_quotation_lead_time',
      'mq.bank_account_name',
      'mq.bank_account_number',
      'mq.bank_account_bank_name',
      'mq.term_content_id',
      'mq.term_content_directory',
      'mq.include_aftersales_page',
      'mq.include_msf_page',
      'mq.status',
      'mq.created_by',
      'mq.updated_by',
      'mq.deleted_by',
      'mq.created_at',
      'mq.updated_at',
      'mq.deleted_at',
      'mq.is_delete'
    )
    .leftJoin(customerJoin, 'mq.customer_id', 'customer_data.customer_id')
    .leftJoin(employeeJoin, 'mq.employee_id', 'employee_data.employee_id')
    .where('mq.is_delete', false);
  
  // Add search condition
  if (search && search.trim() !== '') {
    const searchLower = `%${search.toLowerCase()}%`;
    query = query.where(function() {
      this.where('mq.manage_quotation_no', 'ILIKE', searchLower)
        .orWhere(db.raw('LOWER(CAST(mq.customer_id AS TEXT))'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(CAST(mq.employee_id AS TEXT))'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(customer_data.customer_name)'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(employee_data.employee_name)'), 'LIKE', searchLower);
    });
  }
  
  // Add sorting
  const sortColumnMap = {
    'created_at': 'mq.created_at',
    'manage_quotation_no': 'mq.manage_quotation_no',
    'manage_quotation_date': 'mq.manage_quotation_date',
    'manage_quotation_valid_date': 'mq.manage_quotation_valid_date'
  };
  const sortBySafe = sortColumnMap[sortBy] || sortColumnMap.created_at;
  const sortOrderSafe = ['asc', 'desc'].includes(sortOrder?.toLowerCase()) ? sortOrder : 'desc';
  
  query = query.orderBy(sortBySafe, sortOrderSafe).limit(parseInt(limit)).offset(parseInt(offset));
  
  const data = await query;
  
  // Query total count
  let countQuery = db({ mq: TABLE_NAME })
    .count('* as count')
    .leftJoin(customerJoin, 'mq.customer_id', 'customer_data.customer_id')
    .leftJoin(employeeJoin, 'mq.employee_id', 'employee_data.employee_id')
    .where('mq.is_delete', false);
  
  if (search && search.trim() !== '') {
    const searchLower = `%${search.toLowerCase()}%`;
    countQuery = countQuery.where(function() {
      this.where('mq.manage_quotation_no', 'ILIKE', searchLower)
        .orWhere(db.raw('LOWER(CAST(mq.customer_id AS TEXT))'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(CAST(mq.employee_id AS TEXT))'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(customer_data.customer_name)'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(employee_data.employee_name)'), 'LIKE', searchLower);
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
const generateQuotationNumber = async (trx = db) => {
  const currentYear = moment().format('YYYY');
  const prefix = 'IEC-MSI';
  
  // Find the last quotation number for current year
  // Extract sequence number (first 3 digits before '/') and sort numerically
  const lastQuotation = await trx(TABLE_NAME)
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
const create = async (data, trx = db) => {
  // Generate quotation number if status is submit and no number provided
  let quotationNumber = data.manage_quotation_no || null;
  if (data.status === 'submit' && !quotationNumber) {
    quotationNumber = await generateQuotationNumber(trx);
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
    bank_account_name: data.bank_account_name || null,
    bank_account_number: data.bank_account_number || null,
    bank_account_bank_name: data.bank_account_bank_name || null,
    term_content_id: data.term_content_id || null,
    term_content_directory: data.term_content_directory || null,
    status: data.status || 'submit',
    include_aftersales_page: data.include_aftersales_page ?? false,
    include_msf_page: data.include_msf_page ?? false,
    created_by: data.created_by || null
  };
  
  const result = await trx(TABLE_NAME)
    .insert(fields)
    .returning('*');
  
  return result[0] || null;
};

/**
 * Update existing manage quotation
 */
const update = async (id, data, trx = db) => {
  // Check if status is changing to submit and quotation number is not set
  if (data.status === 'submit') {
    const existingQuotation = await findById(id);
    if (existingQuotation && !existingQuotation.manage_quotation_no) {
      // Generate quotation number if status is submit and no number exists
      data.manage_quotation_no = await generateQuotationNumber(trx);
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
  if (data.bank_account_name !== undefined) updateFields.bank_account_name = data.bank_account_name;
  if (data.bank_account_number !== undefined) updateFields.bank_account_number = data.bank_account_number;
  if (data.bank_account_bank_name !== undefined) updateFields.bank_account_bank_name = data.bank_account_bank_name;
  if (data.term_content_id !== undefined) updateFields.term_content_id = data.term_content_id;
  if (data.term_content_directory !== undefined) updateFields.term_content_directory = data.term_content_directory;
  if (data.include_aftersales_page !== undefined) updateFields.include_aftersales_page = data.include_aftersales_page;
  if (data.include_msf_page !== undefined) updateFields.include_msf_page = data.include_msf_page;
  if (data.status !== undefined) updateFields.status = data.status;
  if (data.updated_by !== undefined) updateFields.updated_by = data.updated_by;
  if (data.deleted_by !== undefined) updateFields.deleted_by = data.deleted_by;
  
  if (Object.keys(updateFields).length === 0) {
    return null;
  }
  
  // Use Knex query builder instead of raw query to avoid binding issues
  updateFields.updated_at = trx.fn.now();

  const result = await trx(TABLE_NAME)
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
const createItems = async (manage_quotation_id, items, created_by, trx = db) => {
  if (!items || items.length === 0) {
    return [];
  }
  
  const results = [];
  
  for (const item of items) {
    // Convert order_number to integer, default to 0 if not provided or invalid
    let orderNumber = 0;
    if (item.order_number !== undefined && item.order_number !== null) {
      // Handle both string and number types
      if (typeof item.order_number === 'number') {
        orderNumber = isNaN(item.order_number) ? 0 : Math.floor(item.order_number);
      } else if (typeof item.order_number === 'string') {
        const parsed = parseInt(item.order_number, 10);
        orderNumber = isNaN(parsed) ? 0 : parsed;
      } else {
        // If it's an object or other type, default to 0
        orderNumber = 0;
      }
    }
    
    // Ensure quantity is also an integer
    let quantity = 1;
    if (item.quantity !== undefined && item.quantity !== null) {
      if (typeof item.quantity === 'number') {
        quantity = isNaN(item.quantity) ? 1 : Math.floor(item.quantity);
      } else if (typeof item.quantity === 'string') {
        const parsed = parseInt(item.quantity, 10);
        quantity = isNaN(parsed) ? 1 : parsed;
      }
    }
    
    const fields = {
      manage_quotation_id: manage_quotation_id || null,
      componen_product_id: item.componen_product_id || null,
      code_unique: item.code_unique ?? null,
      segment: item.segment ?? null,
      msi_model: item.msi_model ?? null,
      wheel_no: item.wheel_no ?? null,
      engine: item.engine ?? null,
      volume: item.volume ?? null,
      horse_power: item.horse_power ?? null,
      market_price: item.market_price ?? null,
      componen_product_name: item.componen_product_name ?? null,
      quantity: quantity,
      price: item.price ?? null,
      total: item.total ?? null,
      description: item.description ?? null,
      order_number: orderNumber,
      created_by: created_by || null
    };
    
    const result = await trx(ITEMS_TABLE_NAME)
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
      'mqi.code_unique',
      'mqi.segment',
      'mqi.msi_model',
      'mqi.wheel_no',
      'mqi.engine',
      'mqi.volume',
      'mqi.horse_power',
      'mqi.market_price',
      'mqi.componen_product_name',
      'mqi.quantity',
      'mqi.price',
      'mqi.total',
      'mqi.description',
      'mqi.order_number',
      'mqi.created_by',
      'mqi.updated_by',
      'mqi.deleted_by',
      'mqi.created_at',
      'mqi.updated_at',
      'mqi.deleted_at',
      'mqi.is_delete',
      // Data from componen_products - using db.raw for aliases
      db.raw('cp.code_unique as cp_code_unique'),
      db.raw('cp.segment as cp_segment'),
      db.raw('cp.msi_model as cp_msi_model'),
      db.raw('cp.wheel_no as cp_wheel_no'),
      db.raw('cp.engine as cp_engine'),
      db.raw('cp.volume as cp_volume'),
      db.raw('cp.horse_power as cp_horse_power'),
      db.raw('cp.market_price as cp_market_price'),
      db.raw('cp.componen_product_name as cp_componen_product_name'),
      db.raw('cp.componen_product_unit_model as cp_componen_product_unit_model'),
      db.raw('cp.image as cp_image')
    )
    .leftJoin('componen_products as cp', function() {
      this.on('mqi.componen_product_id', '=', 'cp.componen_product_id')
          .andOn(db.raw('cp.is_delete = false'));
    })
    .where('mqi.manage_quotation_id', manage_quotation_id)
    .where('mqi.is_delete', false)
    .orderBy('mqi.order_number', 'asc');
  
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
const SPECIFICATIONS_TABLE_NAME = 'manage_quotation_item_specifications';

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
 * Validate componen_product_id for specification payload
 */
const validateSpecificationComponenProductIds = async (specifications) => {
  if (!specifications || specifications.length === 0) {
    return { isValid: true, invalidIds: [] };
  }

  const invalidIds = [];

  for (const spec of specifications) {
    if (!spec.componen_product_id) {
      continue;
    }

    const product = await componenProductRepository.findById(spec.componen_product_id);
    if (!product) {
      invalidIds.push(spec.componen_product_id);
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
const createAccessories = async (manage_quotation_id, accessories, created_by, trx = db) => {
  if (!accessories || accessories.length === 0) {
    return [];
  }
  
  const results = [];
  
  for (const accessory of accessories) {
    const fields = {
      manage_quotation_id: manage_quotation_id || null,
      accessory_id: accessory.accessory_id || null,
      componen_product_id: accessory.componen_product_id || null,
      accessory_part_number: accessory.accessory_part_number ?? null,
      accessory_part_name: accessory.accessory_part_name ?? null,
      accessory_specification: accessory.accessory_specification ?? null,
      accessory_brand: accessory.accessory_brand ?? null,
      accessory_remark: accessory.accessory_remark ?? null,
      accessory_region: accessory.accessory_region ?? null,
      accessory_description: accessory.accessory_description ?? null,
      quantity: accessory.quantity ?? 1,
      description: accessory.description ?? null,
      created_by: created_by || null
    };
    
    const result = await trx(ACCESSORIES_TABLE_NAME)
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
      'mqia.componen_product_id',
      'mqia.accessory_part_number',
      'mqia.accessory_part_name',
      'mqia.accessory_specification',
      'mqia.accessory_brand',
      'mqia.accessory_remark',
      'mqia.accessory_region',
      'mqia.accessory_description',
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
      db.raw('a.accessory_part_number as accessory_part_number_source'),
      db.raw('a.accessory_part_name as accessory_part_name_source'),
      db.raw('a.accessory_specification as accessory_specification_source'),
      db.raw('a.accessory_brand as accessory_brand_source'),
      db.raw('a.accessory_remark as accessory_remark_source'),
      db.raw('a.accessory_region as accessory_region_source'),
      db.raw('a.accessory_description as accessory_description_source')
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

/**
 * SPECIFICATION FUNCTIONS
 */

const createSpecifications = async (manage_quotation_id, specifications, created_by, trx = db) => {
  if (!specifications || specifications.length === 0) {
    return [];
  }

  const results = [];

  for (const spec of specifications) {
    const fields = {
      manage_quotation_id: manage_quotation_id || null,
      componen_product_id: spec.componen_product_id || null,
      manage_quotation_item_specification_label: spec.manage_quotation_item_specification_label ?? null,
      manage_quotation_item_specification_value: spec.manage_quotation_item_specification_value ?? null,
      created_by: created_by || null
    };

    const result = await trx(SPECIFICATIONS_TABLE_NAME)
      .insert(fields)
      .returning('*');

    results.push(result[0]);
  }

  return results;
};

const getSpecificationsByQuotationId = async (manage_quotation_id) => {
  if (!manage_quotation_id) {
    return [];
  }

  const result = await db(`${SPECIFICATIONS_TABLE_NAME} as mqis`)
    .select(
      'mqis.manage_quotation_item_specification_id',
      'mqis.manage_quotation_id',
      'mqis.componen_product_id',
      'mqis.manage_quotation_item_specification_label',
      'mqis.manage_quotation_item_specification_value',
      'mqis.created_by',
      'mqis.updated_by',
      'mqis.deleted_by',
      'mqis.created_at',
      'mqis.updated_at',
      'mqis.deleted_at',
      'mqis.is_delete',
      db.raw('cp.code_unique as cp_code_unique'),
      db.raw('cp.componen_product_name as cp_componen_product_name'),
      db.raw('cp.segment as cp_segment'),
      db.raw('cp.msi_model as cp_msi_model'),
      db.raw('cp.wheel_no as cp_wheel_no'),
      db.raw('cp.engine as cp_engine'),
      db.raw('cp.volume as cp_volume'),
      db.raw('cp.horse_power as cp_horse_power'),
      db.raw('cp.market_price as cp_market_price')
    )
    .leftJoin('componen_products as cp', function() {
      this.on('mqis.componen_product_id', '=', 'cp.componen_product_id')
          .andOn(db.raw('cp.is_delete = false'));
    })
    .where('mqis.manage_quotation_id', manage_quotation_id)
    .where('mqis.is_delete', false)
    .orderBy('mqis.created_at', 'asc');

  return result || [];
};

const deleteSpecificationsByQuotationId = async (manage_quotation_id) => {
  if (!manage_quotation_id) {
    return false;
  }

  const result = await db(SPECIFICATIONS_TABLE_NAME)
    .where({ manage_quotation_id: manage_quotation_id, is_delete: false })
    .update({
      is_delete: true,
      deleted_at: db.fn.now()
    });

  return result > 0;
};

const replaceSpecifications = async (manage_quotation_id, specifications, updated_by) => {
  await deleteSpecificationsByQuotationId(manage_quotation_id);
  const newSpecifications = await createSpecifications(manage_quotation_id, specifications, updated_by);
  return newSpecifications;
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
  replaceAccessories,
  validateSpecificationComponenProductIds,
  createSpecifications,
  getSpecificationsByQuotationId,
  deleteSpecificationsByQuotationId,
  replaceSpecifications
};

