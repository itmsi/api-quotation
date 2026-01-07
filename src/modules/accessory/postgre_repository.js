const db = require('../../config/database');
const accessoriesIslandDetailRepository = require('./accessories_island_detail_repository');

const TABLE_NAME = 'accessories';

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
        console.error(`[accessory:ensureDblinkConnection] Failed after ${maxRetries} attempts:`, error.message);
        return false; // Connection failed after all retries
      }
      // Wait a bit before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 100 * attempt));
    }
  }
  return false;
};

/**
 * Build where clause for search
 */
const buildSearchWhere = (search) => {
  if (!search || search.trim() === '') return null;

  const searchPattern = `%${search.trim().toLowerCase()}%`;

  return function () {
    this.where(function () {
      this.whereRaw('LOWER(accessories.accessory_part_number) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(accessories.accessory_part_name) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(accessories.accessory_specification) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(accessories.accessory_brand) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(accessories.accessory_remark) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(accessories.accessory_region) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(accessories.accessory_description) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(updater_data.employee_name) LIKE ?', [searchPattern]);
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
      console.error('[accessory:findAll] Query failed due to dblink error, retrying...', error.message);
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

  // Get accessories_island_detail for each accessory
  if (data && data.length > 0) {
    for (const item of data) {
      const islandDetails = await accessoriesIslandDetailRepository.findByAccessoriesId(item.accessory_id);
      item.accessories_island_detail = islandDetails;
    }
  }

  // Count total
  let countQuery = db(TABLE_NAME)
    .leftJoin(updaterJoin, `${TABLE_NAME}.updated_by`, 'updater_data.employee_id')
    .where(`${TABLE_NAME}.is_delete`, false);

  if (search && search.trim() !== '') {
    const searchWhere = buildSearchWhere(search);
    countQuery = countQuery.where(searchWhere);
  }

  let totalResult;
  try {
    totalResult = await countQuery.count('accessory_id as count').first();
  } catch (error) {
    if (error.message && (error.message.includes('could not establish connection') || error.message.includes('dblink'))) {
      countQuery = db(TABLE_NAME)
        .where(`${TABLE_NAME}.is_delete`, false);
      if (search && search.trim() !== '') {
        const searchWhere = buildSearchWhere(search);
        countQuery = countQuery.where(searchWhere);
      }
      totalResult = await countQuery.count('accessory_id as count').first();
    } else {
      throw error;
    }
  }

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
 * Check if accessory_part_number already exists (excluding soft deleted records)
 * @param {string} accessoryPartNumber - The accessory_part_number to check
 * @param {string} excludeId - Optional ID to exclude from check (for update operations)
 * @param {object} trx - Optional transaction object
 * @returns {Promise<boolean>} - Returns true if duplicate exists
 */
const checkAccessoryPartNumberDuplicate = async (accessoryPartNumber, excludeId = null, trx = db) => {
  if (!accessoryPartNumber || accessoryPartNumber.trim() === '') {
    return false; // Empty accessory_part_number is allowed
  }

  let query = trx(TABLE_NAME)
    .where('accessory_part_number', accessoryPartNumber.trim())
    .where('is_delete', false);

  // Exclude current record when updating
  if (excludeId) {
    query = query.where('accessory_id', '!=', excludeId);
  }

  const existing = await query.first();
  return !!existing;
};

/**
 * Create new accessory
 */
const create = async (data) => {
  return db.transaction(async (trx) => {
    // Validate accessory_part_number duplicate before insert
    if (data.accessory_part_number) {
      const isDuplicate = await checkAccessoryPartNumberDuplicate(data.accessory_part_number, null, trx);
      if (isDuplicate) {
        const error = new Error(`Accessory part number '${data.accessory_part_number}' sudah digunakan`);
        error.statusCode = 400;
        error.code = 'DUPLICATE_ACCESSORY_PART_NUMBER';
        throw error;
      }
    }

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

    const [result] = await trx(TABLE_NAME)
      .insert(insertData)
      .returning('*');

    return result;
  });
};

/**
 * Update existing accessory
 */
const update = async (id, data) => {
  return db.transaction(async (trx) => {
    // Validate accessory_part_number duplicate before update (if accessory_part_number is being updated)
    if (data.accessory_part_number !== undefined) {
      const isDuplicate = await checkAccessoryPartNumberDuplicate(data.accessory_part_number, id, trx);
      if (isDuplicate) {
        const error = new Error(`Accessory part number '${data.accessory_part_number}' sudah digunakan`);
        error.statusCode = 400;
        error.code = 'DUPLICATE_ACCESSORY_PART_NUMBER';
        throw error;
      }
    }

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

    const [result] = await trx(TABLE_NAME)
      .where({ accessory_id: id, is_delete: false })
      .update({
        ...updateFields,
        updated_at: db.fn.now()
      })
      .returning('*');

    return result || null;
  });
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

/**
 * Find accessories by island_id
 * Join accessories_island_detail with accessories
 */
const findByIslandId = async (islandId) => {
  const results = await db('accessories_island_detail as aid')
    .select(
      'a.*',
      'aid.accessories_island_detail_id',
      'aid.island_id',
      'aid.accessories_island_detail_quantity',
      'aid.accessories_island_detail_description',
      'aid.created_at as island_detail_created_at',
      'aid.created_by as island_detail_created_by',
      'aid.updated_at as island_detail_updated_at',
      'aid.updated_by as island_detail_updated_by'
    )
    .innerJoin('accessories as a', 'aid.accessories_id', 'a.accessory_id')
    .where({
      'aid.island_id': islandId,
      'a.is_delete': false
    })
    .orderBy('a.created_at', 'desc');

  return results || [];
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
  findByIslandId
};

