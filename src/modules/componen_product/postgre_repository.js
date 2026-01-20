const db = require('../../config/database');
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = 'componen_products';

const DBLINK_NAME = 'gate_sso_dblink';
const DB_LINK_CONNECTION = `dbname=${process.env.DB_GATE_SSO_NAME} user=${process.env.DB_GATE_SSO_USER} password=${process.env.DB_GATE_SSO_PASSWORD} host=${process.env.DB_GATE_SSO_HOST} port=${process.env.DB_GATE_SSO_PORT}`;

/**
 * Ensure dblink connection with retry mechanism
 */
const ensureDblinkConnection = async (maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Try to disconnect first if connection exists
      try {
        await db.raw(`SELECT dblink_disconnect('${DBLINK_NAME}')`);
      } catch (error) {
        // Ignore if connection doesn't exist
      }

      // Create new connection
      await db.raw(`SELECT dblink_connect('${DBLINK_NAME}', '${DB_LINK_CONNECTION}')`);
      return true; // Connection successful
    } catch (error) {
      if (attempt === maxRetries) {
        console.error(`[componen-product:ensureDblinkConnection] Failed after ${maxRetries} attempts:`, error.message);
        return false; // Connection failed after all retries
      }
      // Wait a bit before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 100 * attempt));
    }
  }
  return false;
};

/**
 * Normalize spesifikasi untuk response API
 */
const mapSpecificationResponse = (specifications = []) => {
  if (!Array.isArray(specifications)) {
    return [];
  }

  return specifications.map((spec) => ({
    ...spec,
    specification_label_name: spec.componen_product_specification_label,
    specification_value_name: spec.componen_product_specification_value
  }));
};

/**
 * Normalize image untuk response API
 * Convert JSON string to array, or keep as array, or convert single string to array
 */
const mapImageResponse = (image) => {
  if (!image) {
    return [];
  }

  // If already an array, return as is
  if (Array.isArray(image)) {
    return image;
  }

  // If string, try to parse as JSON
  if (typeof image === 'string') {
    try {
      const parsed = JSON.parse(image);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      // If parsed is not array, treat as single URL
      return [parsed];
    } catch (e) {
      // If not JSON, treat as single URL string
      return [image];
    }
  }

  // Fallback: return empty array
  return [];
};

/**
 * Map product_type from database to response
 * Note: product_type is now a direct column, but we still map from componen_type for backward compatibility
 */
const mapProductTypeResponse = (productType, componenType) => {
  // If product_type is provided directly, use it
  if (productType && productType.trim() !== '') {
    return productType.trim();
  }
  
  // Otherwise, fallback to mapping from componen_type for backward compatibility
  return mapProductType(componenType);
};

/**
 * Map nilai componen_type menjadi product_type
 */
const mapProductType = (componenType) => {
  if (componenType === null || componenType === undefined || componenType === '') {
    return '';
  }

  const normalizedType = Number(componenType);

  switch (normalizedType) {
    case 1:
      return 'OFF ROAD REGULAR';
    case 2:
      return 'ON ROAD REGULAR';
    case 3:
      return 'OFF ROAD IRREGULAR';
    default:
      return '';
  }
};

/**
 * Build where clause for search
 */
const buildSearchWhere = (search) => {
  if (!search || search.trim() === '') return null;

  const searchPattern = `%${search.trim().toLowerCase()}%`;

  return function () {
    this.where(function () {
      this.whereRaw('LOWER(componen_products.code_unique) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(componen_products.componen_product_name) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(componen_products.segment) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(componen_products.msi_model) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(componen_products.msi_product) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(componen_products.wheel_no) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(componen_products.engine) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(componen_products.horse_power) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(componen_products.componen_product_unit_model) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(componen_products.volume) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(componen_products.componen_product_description) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(componen_products.product_type) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(updater_data.employee_name) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(company_data.company_name) LIKE ?', [searchPattern]);
    });
  };
};

/**
 * Find all componen products with pagination, search, and sort
 */
const findAll = async (params) => {
  const { page, limit, offset, search, sortBy, sortOrder, companyName } = params;

  const sortOrderSafe = ['asc', 'desc'].includes((sortOrder || '').toLowerCase())
    ? sortOrder.toLowerCase()
    : 'desc';
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);
  const offsetNumber = Math.max(parseInt(offset, 10) || 0, 0);

  // Ensure dblink connection
  const dblinkConnected = await ensureDblinkConnection();
  let updaterJoin;

  if (dblinkConnected) {
    updaterJoin = db.raw(
      `dblink('${DBLINK_NAME}', 'SELECT employee_id, employee_name FROM employees WHERE employee_id IS NOT NULL AND is_delete = false') AS updater_data(employee_id uuid, employee_name varchar)`
    );
  } else {
    updaterJoin = db.raw(`(SELECT NULL::uuid as employee_id, NULL::varchar as employee_name WHERE false) AS updater_data(employee_id uuid, employee_name varchar)`);
  }

  let query = db(TABLE_NAME)
    .select(`${TABLE_NAME}.*`, db.raw('updater_data.employee_name as updated_by_name'))
    .leftJoin(updaterJoin, `${TABLE_NAME}.updated_by`, 'updater_data.employee_id')
    .where(`${TABLE_NAME}.is_delete`, false);

  // Apply company_name filter
  if (companyName !== undefined && companyName !== null && companyName !== '') {
    query = query.where(`${TABLE_NAME}.company_name`, companyName);
  }

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

  let data;
  try {
    data = await query;
  } catch (error) {
    // Retry logic if dblink fails
    if (error.message && (error.message.includes('could not establish connection') || error.message.includes('dblink'))) {
      console.error('[componen-product:findAll] Query failed due to dblink error, retrying...', error.message);
      const reconnected = await ensureDblinkConnection();

      if (reconnected) {
        updaterJoin = db.raw(
          `dblink('${DBLINK_NAME}', 'SELECT employee_id, employee_name FROM employees WHERE employee_id IS NOT NULL AND is_delete = false') AS updater_data(employee_id uuid, employee_name varchar)`
        );

        try {
          query = db(TABLE_NAME)
            .select(`${TABLE_NAME}.*`, db.raw('updater_data.employee_name as updated_by_name'))
            .leftJoin(updaterJoin, `${TABLE_NAME}.updated_by`, 'updater_data.employee_id')
            .where(`${TABLE_NAME}.is_delete`, false);

          if (companyName !== undefined && companyName !== null && companyName !== '') {
            query = query.where(`${TABLE_NAME}.company_name`, companyName);
          }

          if (search && search.trim() !== '') {
            const searchWhere = buildSearchWhere(search);
            query = query.where(searchWhere);
          }

          query = query.orderBy(sortBy || 'created_at', sortOrderSafe).limit(limitNumber).offset(offsetNumber);
          data = await query;
        } catch (retryError) {
          // Fallback without dblink
          query = db(TABLE_NAME)
            .select(`${TABLE_NAME}.*`)
            .where(`${TABLE_NAME}.is_delete`, false);

          if (companyName !== undefined && companyName !== null && companyName !== '') {
            query = query.where(`${TABLE_NAME}.company_name`, companyName);
          }

          if (search && search.trim() !== '') {
            const searchWhere = buildSearchWhere(search);
            query = query.where(searchWhere);
          }

          query = query.orderBy(sortBy || 'created_at', sortOrderSafe).limit(limitNumber).offset(offsetNumber);
          data = await query;
          data = data.map(item => ({ ...item, updated_by_name: null }));
        }
      } else {
        // Fallback without dblink
        query = db(TABLE_NAME)
          .select(`${TABLE_NAME}.*`)
          .where(`${TABLE_NAME}.is_delete`, false);

        if (companyName !== undefined && companyName !== null && companyName !== '') {
          query = query.where(`${TABLE_NAME}.company_name`, companyName);
        }

        if (search && search.trim() !== '') {
          const searchWhere = buildSearchWhere(search);
          query = query.where(searchWhere);
        }

        query = query.orderBy(sortBy || 'created_at', sortOrderSafe).limit(limitNumber).offset(offsetNumber);
        data = await query;
        data = data.map(item => ({ ...item, updated_by_name: null }));
      }
    } else {
      throw error;
    }
  }

  const itemsWithProductType = (data || []).map((item) => {
    // Remove specification_properties from response
    const { specification_properties, ...itemWithoutSpecs } = item;
    return {
      ...itemWithoutSpecs,
      product_type: mapProductTypeResponse(item.product_type, item.componen_type),
      image: mapImageResponse(item.image)
    };
  });

  // Count total
  let countQuery = db(TABLE_NAME)
    .leftJoin(updaterJoin, `${TABLE_NAME}.updated_by`, 'updater_data.employee_id')
    .where(`${TABLE_NAME}.is_delete`, false);

  if (companyName !== undefined && companyName !== null && companyName !== '') {
    countQuery = countQuery.where(`${TABLE_NAME}.company_name`, companyName);
  }

  if (search && search.trim() !== '') {
    const searchWhere = buildSearchWhere(search);
    countQuery = countQuery.where(searchWhere);
  }

  let totalResult;
  try {
    totalResult = await countQuery.count('componen_product_id as count').first();
  } catch (error) {
    if (error.message && (error.message.includes('could not establish connection') || error.message.includes('dblink'))) {
      countQuery = db(TABLE_NAME)
        .where(`${TABLE_NAME}.is_delete`, false);
      if (companyName !== undefined && companyName !== null && companyName !== '') {
        countQuery = countQuery.where(`${TABLE_NAME}.company_name`, companyName);
      }
      if (search && search.trim() !== '') {
        const searchWhere = buildSearchWhere(search);
        countQuery = countQuery.where(searchWhere);
      }
      totalResult = await countQuery.count('componen_product_id as count').first();
    } else {
      throw error;
    }
  }

  const total = parseInt(totalResult?.count || 0, 10);

  return {
    items: itemsWithProductType,
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
  const componenProduct = await db(TABLE_NAME)
    .where({ componen_product_id: id, is_delete: false })
    .first();

  if (!componenProduct) {
    return null;
  }

  const storedSpecs = typeof componenProduct.specification_properties === 'string'
    ? JSON.parse(componenProduct.specification_properties)
    : (componenProduct.specification_properties || []);

  const normalizedSpecs = mapSpecificationResponse(storedSpecs);

  // Remove specification_properties from response, only return normalized componen_product_specifications
  const { specification_properties, ...productWithoutSpecs } = componenProduct;

  return {
    ...productWithoutSpecs,
    componen_product_specifications: normalizedSpecs,
    product_type: mapProductTypeResponse(componenProduct.product_type, componenProduct.componen_type),
    image: mapImageResponse(componenProduct.image)
  };
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
 * Check if code_unique already exists (excluding soft deleted records)
 * @param {string} codeUnique - The code_unique to check
 * @param {string} excludeId - Optional ID to exclude from check (for update operations)
 * @param {object} trx - Optional transaction object
 * @returns {Promise<boolean>} - Returns true if duplicate exists
 */
const checkCodeUniqueDuplicate = async (codeUnique, excludeId = null, trx = db) => {
  if (!codeUnique || codeUnique.trim() === '') {
    return false; // Empty code_unique is allowed
  }

  let query = trx(TABLE_NAME)
    .where('code_unique', codeUnique.trim())
    .where('is_delete', false);

  // Exclude current record when updating
  if (excludeId) {
    query = query.where('componen_product_id', '!=', excludeId);
  }

  const existing = await query.first();
  return !!existing;
};

/**
 * Create new componen product
 */
const create = async (data, specifications = []) => {
  return db.transaction(async (trx) => {
    // Validate code_unique duplicate before insert
    if (data.code_unique) {
      const isDuplicate = await checkCodeUniqueDuplicate(data.code_unique, null, trx);
      if (isDuplicate) {
        const error = new Error(`Code unique '${data.code_unique}' sudah digunakan`);
        error.statusCode = 400;
        error.code = 'DUPLICATE_CODE_UNIQUE';
        throw error;
      }
    }

    const newId = uuidv4();
    const insertData = {
      componen_product_id: newId,
      componen_product_name: data.componen_product_name || null,
      componen_type: data.componen_type || null,
      company_name: data.company_name || null,
      product_type: data.product_type || null,
      code_unique: data.code_unique || null,
      segment: data.segment || null,
      msi_model: data.msi_model || null,
      msi_product: data.msi_product || null,
      wheel_no: data.wheel_no || null,
      engine: data.engine || null,
      horse_power: data.horse_power || null,
      volume: data.volume || null,
      componen_product_unit_model: data.componen_product_unit_model || null,
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

    let specsToStore = [];
    if (Array.isArray(specifications) && specifications.length > 0) {
      specsToStore = specifications.map((spec) => ({
        componen_product_id: newId,
        componen_product_specification_label: spec.componen_product_specification_label || null,
        componen_product_specification_value: spec.componen_product_specification_value || null,
        componen_product_specification_description: spec.componen_product_specification_description || null
      }));
    }

    insertData.specification_properties = JSON.stringify(specsToStore);

    const [product] = await trx(TABLE_NAME)
      .insert(insertData)
      .returning('*');

    if (!product) {
      throw new Error('Gagal membuat data componen product');
    }

    // Parse back the JSON for response
    const storedSpecs = typeof product.specification_properties === 'string'
      ? JSON.parse(product.specification_properties)
      : (product.specification_properties || []);

    const normalizedSpecs = mapSpecificationResponse(storedSpecs);

    // Remove specification_properties from response, only return normalized componen_product_specifications
    const { specification_properties, ...productWithoutSpecs } = product;

    return {
      ...productWithoutSpecs,
      componen_product_specifications: normalizedSpecs,
      product_type: mapProductTypeResponse(product.product_type, product.componen_type),
      image: mapImageResponse(product.image)
    };
  });
};

/**
 * Update existing componen product
 */
const update = async (id, data, options = {}) => {
  const {
    specifications = [],
    specificationsProvided = false
  } = options;

  return db.transaction(async (trx) => {
    // Validate code_unique duplicate before update (if code_unique is being updated)
    if (data.code_unique !== undefined) {
      const isDuplicate = await checkCodeUniqueDuplicate(data.code_unique, id, trx);
      if (isDuplicate) {
        const error = new Error(`Code unique '${data.code_unique}' sudah digunakan`);
        error.statusCode = 400;
        error.code = 'DUPLICATE_CODE_UNIQUE';
        throw error;
      }
    }

    const updateFields = {};

    if (data.componen_product_name !== undefined) updateFields.componen_product_name = data.componen_product_name;
    if (data.componen_type !== undefined) updateFields.componen_type = data.componen_type;
    if (data.company_name !== undefined) updateFields.company_name = data.company_name;
    if (data.product_type !== undefined) updateFields.product_type = data.product_type;
    if (data.code_unique !== undefined) updateFields.code_unique = data.code_unique;
    if (data.segment !== undefined) updateFields.segment = data.segment;
    if (data.msi_model !== undefined) updateFields.msi_model = data.msi_model;
    if (data.msi_product !== undefined) updateFields.msi_product = data.msi_product;
    if (data.wheel_no !== undefined) updateFields.wheel_no = data.wheel_no;
    if (data.engine !== undefined) updateFields.engine = data.engine;
    if (data.horse_power !== undefined) updateFields.horse_power = data.horse_power;
    if (data.volume !== undefined) updateFields.volume = data.volume;
    if (data.componen_product_unit_model !== undefined) updateFields.componen_product_unit_model = data.componen_product_unit_model;
    if (data.market_price !== undefined) updateFields.market_price = data.market_price;
    if (data.selling_price_star_1 !== undefined) updateFields.selling_price_star_1 = data.selling_price_star_1;
    if (data.selling_price_star_2 !== undefined) updateFields.selling_price_star_2 = data.selling_price_star_2;
    if (data.selling_price_star_3 !== undefined) updateFields.selling_price_star_3 = data.selling_price_star_3;
    if (data.selling_price_star_4 !== undefined) updateFields.selling_price_star_4 = data.selling_price_star_4;
    if (data.selling_price_star_5 !== undefined) updateFields.selling_price_star_5 = data.selling_price_star_5;
    if (data.image !== undefined) updateFields.image = data.image;
    if (data.componen_product_description !== undefined) updateFields.componen_product_description = data.componen_product_description;
    if (data.updated_by !== undefined) updateFields.updated_by = data.updated_by;

    if (specificationsProvided) {
      let specsToStore = [];
      if (Array.isArray(specifications) && specifications.length > 0) {
        specsToStore = specifications.map((spec) => ({
          componen_product_id: id,
          componen_product_specification_label: spec.componen_product_specification_label || null,
          componen_product_specification_value: spec.componen_product_specification_value || null,
          componen_product_specification_description: spec.componen_product_specification_description || null
        }));
      }
      updateFields.specification_properties = JSON.stringify(specsToStore);
    }

    let product = null;

    if (Object.keys(updateFields).length > 0) {
      const [result] = await trx(TABLE_NAME)
        .where({ componen_product_id: id, is_delete: false })
        .update({
          ...updateFields,
          updated_at: db.fn.now()
        })
        .returning('*');

      if (!result) {
        return null;
      }

      product = result;
    } else {
      product = await trx(TABLE_NAME)
        .where({ componen_product_id: id, is_delete: false })
        .first();

      if (!product) {
        return null;
      }
    }

    const storedSpecs = typeof product.specification_properties === 'string'
      ? JSON.parse(product.specification_properties)
      : (product.specification_properties || []);

    const normalizedSpecs = mapSpecificationResponse(storedSpecs);

    // Remove specification_properties from response, only return normalized componen_product_specifications
    const { specification_properties, ...productWithoutSpecs } = product;

    return {
      ...productWithoutSpecs,
      componen_product_specifications: normalizedSpecs,
      product_type: mapProductTypeResponse(product.product_type, product.componen_type),
      image: mapImageResponse(product.image)
    };
  });
};

/**
 * Soft delete componen product
 */
const remove = async (id, data = {}) => {
  return db.transaction(async (trx) => {
    const deleteFields = {
      is_delete: true,
      deleted_at: db.fn.now()
    };

    if (data.deleted_by !== undefined) {
      deleteFields.deleted_by = data.deleted_by;
    }

    const [result] = await trx(TABLE_NAME)
      .where({ componen_product_id: id, is_delete: false })
      .update(deleteFields)
      .returning('*');

    if (!result) {
      return null;
    }

    return result;
  });
};

/**
 * Restore soft deleted componen product
 */
const restore = async (id) => {
  return db.transaction(async (trx) => {
    const [result] = await trx(TABLE_NAME)
      .where({ componen_product_id: id, is_delete: true })
      .update({
        is_delete: false,
        deleted_at: null,
        deleted_by: null,
        updated_at: db.fn.now()
      })
      .returning('*');

    if (!result) {
      return null;
    }

    return result;
  });
};

/**
 * Hard delete componen product (permanent)
 */
const hardDelete = async (id) => {
  return db.transaction(async (trx) => {
    return trx(TABLE_NAME)
      .where({ componen_product_id: id })
      .del();
  });
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

