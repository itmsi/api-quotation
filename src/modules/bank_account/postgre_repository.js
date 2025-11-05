const db = require('../../config/database');

// DBLINK connection string from environment variables
const DB_LINK_CONNECTION = `dbname=${process.env.DB_GATE_SSO_NAME} user=${process.env.DB_GATE_SSO_USER} password=${process.env.DB_GATE_SSO_PASSWORD} host=${process.env.DB_GATE_SSO_HOST} port=${process.env.DB_GATE_SSO_PORT}`;
const DB_LINK_NAME = 'gate_sso_dblink';
const TABLE_NAME = 'bank_accounts';

/**
 * Ensure dblink connection is established
 */
const ensureConnection = async () => {
  try {
    // Try to disconnect first if connection exists
    try {
      await db.raw(`SELECT dblink_disconnect('${DB_LINK_NAME}')`);
    } catch (error) {
      // Ignore if connection doesn't exist
    }
    
    // Create new connection
    await db.raw(`SELECT dblink_connect('${DB_LINK_NAME}', '${DB_LINK_CONNECTION}')`);
  } catch (error) {
    console.error('dblink connection error:', error.message);
    console.error('Connection string:', DB_LINK_CONNECTION);
    throw new Error(`Failed to establish dblink connection: ${error.message}`);
  }
};

/**
 * Validate and sanitize sort column
 */
const validateSortBy = (sortBy) => {
  const allowedColumns = ['bank_account_id', 'bank_account_name', 'bank_account_number', 'bank_account_type', 'bank_account_balance', 'created_at', 'updated_at'];
  return allowedColumns.includes(sortBy) ? sortBy : 'created_at';
};

/**
 * Validate and sanitize sort order
 */
const validateSortOrder = (sortOrder) => {
  return ['asc', 'desc'].includes(sortOrder?.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';
};

/**
 * Find all bank accounts with pagination, search, and sort
 */
const findAll = async (params) => {
  const { page, limit, offset, search, sortBy, sortOrder } = params;
  
  await ensureConnection();
  
  // Validate and sanitize sort parameters
  const safeSortBy = validateSortBy(sortBy);
  const safeSortOrder = validateSortOrder(sortOrder);
  
  // Validate limit and offset as numbers
  const safeLimit = Math.max(parseInt(limit) || 10, 1);
  const safeOffset = Math.max(parseInt(offset) || 0, 0);
  
  // Build inner query string - don't use template literal interpolation for escaped values
  let innerQueryArray = [
    'SELECT bank_account_id, bank_account_name, bank_account_number, bank_account_type, bank_account_balance, created_at, updated_at FROM bank_accounts',
    'WHERE is_delete = false'
  ];
  
  if (search && search.trim()) {
    // Escape search string properly using PostgreSQL quote_literal
    const escapedSearchResult = await db.raw(`SELECT quote_literal(?) as escaped`, [`%${search.trim()}%`]);
    const escapedSearch = escapedSearchResult.rows[0]?.escaped;
    
    // Build search condition using string concatenation
    innerQueryArray.push('AND (');
    innerQueryArray.push('LOWER(bank_account_name) LIKE LOWER(' + escapedSearch + ')');
    innerQueryArray.push('OR');
    innerQueryArray.push('LOWER(bank_account_number) LIKE LOWER(' + escapedSearch + ')');
    innerQueryArray.push('OR');
    innerQueryArray.push('LOWER(bank_account_type) LIKE LOWER(' + escapedSearch + ')');
    innerQueryArray.push(')');
  }
  
  innerQueryArray.push(`ORDER BY ${safeSortBy} ${safeSortOrder}`);
  innerQueryArray.push(`LIMIT ${safeLimit}`);
  innerQueryArray.push(`OFFSET ${safeOffset}`);
  
  // Join all parts
  const innerQuery = innerQueryArray.join(' ');
  
  // Escape the entire inner query manually for dblink (double single quotes for single quotes)
  const escapedInnerQuery = "'" + innerQuery.replace(/'/g, "''") + "'";
  
  // Build the final query
  const finalQuery = `SELECT * FROM dblink('${DB_LINK_NAME}', ${escapedInnerQuery}) AS bank_accounts (
    bank_account_id uuid,
    bank_account_name varchar,
    bank_account_number varchar,
    bank_account_type varchar,
    bank_account_balance numeric,
    created_at timestamp,
    updated_at timestamp
  )`;
  
  const data = await db.raw(finalQuery);
  
  // Query total count
  let countQueryArray = [
    'SELECT COUNT(*) as count FROM bank_accounts',
    'WHERE is_delete = false'
  ];
  
  if (search && search.trim()) {
    // Escape search string properly using PostgreSQL quote_literal
    const escapedSearchResult = await db.raw(`SELECT quote_literal(?) as escaped`, [`%${search.trim()}%`]);
    const escapedSearch = escapedSearchResult.rows[0]?.escaped;
    
    countQueryArray.push('AND (');
    countQueryArray.push('LOWER(bank_account_name) LIKE LOWER(' + escapedSearch + ')');
    countQueryArray.push('OR');
    countQueryArray.push('LOWER(bank_account_number) LIKE LOWER(' + escapedSearch + ')');
    countQueryArray.push('OR');
    countQueryArray.push('LOWER(bank_account_type) LIKE LOWER(' + escapedSearch + ')');
    countQueryArray.push(')');
  }
  
  const countInnerQuery = countQueryArray.join(' ');
  // Escape the count query manually for dblink (double single quotes for single quotes)
  const escapedCountQuery = "'" + countInnerQuery.replace(/'/g, "''") + "'";
  
  const countFinalQuery = `SELECT COUNT(*) as count FROM dblink('${DB_LINK_NAME}', ${escapedCountQuery}) AS bank_accounts_count (
    count bigint
  )`;
  
  const totalResult = await db.raw(countFinalQuery);
  const total = totalResult.rows[0]?.count || 0;
  
  return {
    items: data.rows || [],
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(total),
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Find single bank account by ID
 */
const findById = async (id) => {
  if (!id) {
    return null;
  }
  
  await ensureConnection();
  
  // Escape ID using PostgreSQL quote_literal
  const escapedIdResult = await db.raw(`SELECT quote_literal(?) as escaped`, [id]);
  const escapedId = escapedIdResult.rows[0]?.escaped;
  
  // Build inner query
  const innerQuery = `SELECT bank_account_id, bank_account_name, bank_account_number, bank_account_type, bank_account_balance, created_at, updated_at FROM bank_accounts WHERE bank_account_id = ${escapedId} AND is_delete = false`;
  
  // Escape the entire inner query
  const escapedQueryResult = await db.raw(`SELECT quote_literal(?) as escaped`, [innerQuery]);
  const escapedInnerQuery = escapedQueryResult.rows[0]?.escaped;
  
  const query = `
    SELECT * FROM dblink('${DB_LINK_NAME}', 
      ${escapedInnerQuery}
    ) AS bank_accounts (
      bank_account_id uuid,
      bank_account_name varchar,
      bank_account_number varchar,
      bank_account_type varchar,
      bank_account_balance numeric,
      created_at timestamp,
      updated_at timestamp
    )
  `;
  
  const result = await db.raw(query);
  return result.rows[0] || null;
};

/**
 * Find by custom condition
 */
const findOne = async (conditions) => {
  if (!conditions || Object.keys(conditions).length === 0) {
    return null;
  }
  
  await ensureConnection();
  
  // Build where clause with escaped values
  const whereParts = [];
  for (const [key, value] of Object.entries(conditions)) {
    const escapedValueResult = await db.raw(`SELECT quote_literal(?) as escaped`, [value]);
    const escapedValue = escapedValueResult.rows[0]?.escaped;
    whereParts.push(`${key} = ${escapedValue}`);
  }
  
  const whereClause = whereParts.join(' AND ');
  
  // Build inner query
  const innerQuery = `SELECT * FROM bank_accounts WHERE ${whereClause} AND is_delete = false LIMIT 1`;
  
  // Escape the entire inner query
  const escapedQueryResult = await db.raw(`SELECT quote_literal(?) as escaped`, [innerQuery]);
  const escapedInnerQuery = escapedQueryResult.rows[0]?.escaped;
  
  const query = `
    SELECT * FROM dblink('${DB_LINK_NAME}', 
      ${escapedInnerQuery}
    ) AS bank_accounts (
      bank_account_id uuid,
      bank_account_name varchar,
      bank_account_number varchar,
      bank_account_type varchar,
      bank_account_balance numeric,
      created_by uuid,
      updated_by uuid,
      deleted_by uuid,
      created_at timestamp,
      updated_at timestamp,
      deleted_at timestamp,
      is_delete boolean
    )
  `;
  
  const result = await db.raw(query);
  return result.rows[0] || null;
};

/**
 * Create new bank account
 */
const create = async (data) => {
  await ensureConnection();
  
  const fields = {
    bank_account_name: data.bank_account_name || null,
    bank_account_number: data.bank_account_number || null,
    bank_account_type: data.bank_account_type || null,
    bank_account_balance: data.bank_account_balance || 0,
    created_by: data.created_by || null
  };
  
  const columns = Object.keys(fields).join(', ');
  const values = Object.values(fields).map(v => v === null ? 'NULL' : `'${v}'`).join(', ');
  
  const query = `
    SELECT * FROM dblink('${DB_LINK_NAME}', 
      'INSERT INTO bank_accounts (${columns}, created_at, updated_at) VALUES (${values}, NOW(), NOW()) RETURNING *'
    ) AS bank_accounts (
      bank_account_id uuid,
      bank_account_name varchar,
      bank_account_number varchar,
      bank_account_type varchar,
      bank_account_balance numeric,
      created_by uuid,
      updated_by uuid,
      deleted_by uuid,
      created_at timestamp,
      updated_at timestamp,
      deleted_at timestamp,
      is_delete boolean
    )
  `;
  
  const result = await db.raw(query);
  return result.rows[0] || null;
};

/**
 * Update existing bank account
 */
const update = async (id, data) => {
  await ensureConnection();
  
  const updateFields = {};
  if (data.bank_account_name !== undefined) updateFields.bank_account_name = data.bank_account_name;
  if (data.bank_account_number !== undefined) updateFields.bank_account_number = data.bank_account_number;
  if (data.bank_account_type !== undefined) updateFields.bank_account_type = data.bank_account_type;
  if (data.bank_account_balance !== undefined) updateFields.bank_account_balance = data.bank_account_balance;
  if (data.updated_by !== undefined) updateFields.updated_by = data.updated_by;
  if (data.deleted_by !== undefined) updateFields.deleted_by = data.deleted_by;
  
  const setClause = Object.keys(updateFields).map(key => {
    const value = updateFields[key];
    return value === null ? `${key} = NULL` : `${key} = '${value}'`;
  }).join(', ');
  
  if (!setClause) {
    return null;
  }
  
  const query = `
    SELECT * FROM dblink('${DB_LINK_NAME}', 
      'UPDATE bank_accounts SET ${setClause}, updated_at = NOW() WHERE bank_account_id = ''${id}'' RETURNING *'
    ) AS bank_accounts (
      bank_account_id uuid,
      bank_account_name varchar,
      bank_account_number varchar,
      bank_account_type varchar,
      bank_account_balance numeric,
      created_by uuid,
      updated_by uuid,
      deleted_by uuid,
      created_at timestamp,
      updated_at timestamp,
      deleted_at timestamp,
      is_delete boolean
    )
  `;
  
  const result = await db.raw(query);
  return result.rows[0] || null;
};

/**
 * Soft delete bank account
 */
const remove = async (id) => {
  await ensureConnection();
  
  const query = `
    SELECT * FROM dblink('${DB_LINK_NAME}', 
      'UPDATE bank_accounts SET is_delete = true, deleted_at = NOW() WHERE bank_account_id = ''${id}'' RETURNING *'
    ) AS bank_accounts (
      bank_account_id uuid,
      bank_account_name varchar,
      bank_account_number varchar,
      bank_account_type varchar,
      bank_account_balance numeric,
      created_by uuid,
      updated_by uuid,
      deleted_by uuid,
      created_at timestamp,
      updated_at timestamp,
      deleted_at timestamp,
      is_delete boolean
    )
  `;
  
  const result = await db.raw(query);
  return result.rows[0] || null;
};

/**
 * Restore soft deleted bank account
 */
const restore = async (id) => {
  await ensureConnection();
  
  const query = `
    SELECT * FROM dblink('${DB_LINK_NAME}', 
      'UPDATE bank_accounts SET is_delete = false, deleted_at = NULL, updated_at = NOW() WHERE bank_account_id = ''${id}'' AND is_delete = true RETURNING *'
    ) AS bank_accounts (
      bank_account_id uuid,
      bank_account_name varchar,
      bank_account_number varchar,
      bank_account_type varchar,
      bank_account_balance numeric,
      created_by uuid,
      updated_by uuid,
      deleted_by uuid,
      created_at timestamp,
      updated_at timestamp,
      deleted_at timestamp,
      is_delete boolean
    )
  `;
  
  const result = await db.raw(query);
  return result.rows[0] || null;
};

/**
 * Hard delete bank account (permanent)
 */
const hardDelete = async (id) => {
  await ensureConnection();
  
  const query = `
    SELECT * FROM dblink('${DB_LINK_NAME}', 
      'DELETE FROM bank_accounts WHERE bank_account_id = ''${id}'''
    ) AS bank_accounts (
      bank_account_id uuid,
      bank_account_name varchar,
      bank_account_number varchar,
      bank_account_type varchar,
      bank_account_balance numeric,
      created_by uuid,
      updated_by uuid,
      deleted_by uuid,
      created_at timestamp,
      updated_at timestamp,
      deleted_at timestamp,
      is_delete boolean
    )
  `;
  
  const result = await db.raw(query);
  return result.rowCount > 0;
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

