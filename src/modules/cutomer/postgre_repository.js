const db = require('../../config/database');

// DBLINK connection string from environment variables
const DB_LINK_CONNECTION = `dbname=${process.env.DB_GATE_SSO_NAME} user=${process.env.DB_GATE_SSO_USER} password=${process.env.DB_GATE_SSO_PASSWORD} host=${process.env.DB_GATE_SSO_HOST} port=${process.env.DB_GATE_SSO_PORT}`;
const DB_LINK_NAME = 'gate_sso_dblink';
const TABLE_NAME = 'customers';

/**
 * Ensure dblink connection is established
 */
const ensureConnection = async () => {
  try {
    // Try to connect, ignore if already connected
    await db.raw(`SELECT dblink_connect('${DB_LINK_NAME}', '${DB_LINK_CONNECTION}')`);
  } catch (error) {
    // Connection might already exist, that's okay
    if (!error.message.includes('already exists')) {
      console.error('dblink connection error:', error.message);
    }
  }
};

/**
 * Build where clause for search
 */
const buildSearchWhere = (search) => {
  if (!search || search.trim() === '') return '';
  
  return `AND (
    LOWER(name) LIKE LOWER('%${search}%') OR 
    LOWER(email) LIKE LOWER('%${search}%') OR 
    LOWER(phone) LIKE LOWER('%${search}%')
  )`;
};

/**
 * Find all customers with pagination, search, and sort
 */
const findAll = async (params) => {
  const { page, limit, offset, search, sortBy, sortOrder } = params;
  
  await ensureConnection();
  
  const searchWhere = buildSearchWhere(search);
  
  // Query data
  const dataQuery = `
    SELECT * FROM dblink('${DB_LINK_NAME}', 
      'SELECT * FROM customers WHERE 1=1 ${searchWhere} ORDER BY ${sortBy} ${sortOrder} LIMIT ${limit} OFFSET ${offset}'
    ) AS customers (
      id uuid,
      name varchar,
      email varchar,
      phone varchar,
      created_by uuid,
      updated_by uuid,
      deleted_by uuid,
      created_at timestamp,
      updated_at timestamp,
      deleted_at timestamp
    )
  `;
  
  const data = await db.raw(dataQuery);
  
  // Query total count
  const countQuery = `
    SELECT COUNT(*) as count FROM dblink('${DB_LINK_NAME}', 
      'SELECT COUNT(*) as count FROM customers WHERE 1=1 ${searchWhere}'
    ) AS customers_count (
      count bigint
    )
  `;
  
  const totalResult = await db.raw(countQuery);
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
 * Find single customer by ID
 */
const findById = async (id) => {
  await ensureConnection();
  
  const query = `
    SELECT * FROM dblink('${DB_LINK_NAME}', 
      'SELECT * FROM customers WHERE id = ''${id}'''
    ) AS customers (
      id uuid,
      name varchar,
      email varchar,
      phone varchar,
      created_by uuid,
      updated_by uuid,
      deleted_by uuid,
      created_at timestamp,
      updated_at timestamp,
      deleted_at timestamp
    )
  `;
  
  const result = await db.raw(query);
  return result.rows[0] || null;
};

/**
 * Find by custom condition
 */
const findOne = async (conditions) => {
  await ensureConnection();
  
  const whereClause = Object.keys(conditions).map(key => 
    `${key} = '${conditions[key]}'`
  ).join(' AND ');
  
  const query = `
    SELECT * FROM dblink('${DB_LINK_NAME}', 
      'SELECT * FROM customers WHERE ${whereClause} LIMIT 1'
    ) AS customers (
      id uuid,
      name varchar,
      email varchar,
      phone varchar,
      created_by uuid,
      updated_by uuid,
      deleted_by uuid,
      created_at timestamp,
      updated_at timestamp,
      deleted_at timestamp
    )
  `;
  
  const result = await db.raw(query);
  return result.rows[0] || null;
};

/**
 * Create new customer
 */
const create = async (data) => {
  await ensureConnection();
  
  const columns = Object.keys(data).join(', ');
  const values = Object.values(data).map(v => `'${v}'`).join(', ');
  
  const query = `
    SELECT * FROM dblink('${DB_LINK_NAME}', 
      'INSERT INTO customers (${columns}, created_at, updated_at) VALUES (${values}, NOW(), NOW()) RETURNING *'
    ) AS customers (
      id uuid,
      name varchar,
      email varchar,
      phone varchar,
      created_by uuid,
      updated_by uuid,
      deleted_by uuid,
      created_at timestamp,
      updated_at timestamp,
      deleted_at timestamp
    )
  `;
  
  const result = await db.raw(query);
  return result.rows[0] || null;
};

/**
 * Update existing customer
 */
const update = async (id, data) => {
  await ensureConnection();
  
  const setClause = Object.keys(data).map(key => 
    `${key} = '${data[key]}'`
  ).join(', ');
  
  const query = `
    SELECT * FROM dblink('${DB_LINK_NAME}', 
      'UPDATE customers SET ${setClause}, updated_at = NOW() WHERE id = ''${id}'' RETURNING *'
    ) AS customers (
      id uuid,
      name varchar,
      email varchar,
      phone varchar,
      created_by uuid,
      updated_by uuid,
      deleted_by uuid,
      created_at timestamp,
      updated_at timestamp,
      deleted_at timestamp
    )
  `;
  
  const result = await db.raw(query);
  return result.rows[0] || null;
};

/**
 * Soft delete customer
 */
const remove = async (id) => {
  await ensureConnection();
  
  const query = `
    SELECT * FROM dblink('${DB_LINK_NAME}', 
      'UPDATE customers SET deleted_at = NOW() WHERE id = ''${id}'' RETURNING *'
    ) AS customers (
      id uuid,
      name varchar,
      email varchar,
      phone varchar,
      created_by uuid,
      updated_by uuid,
      deleted_by uuid,
      created_at timestamp,
      updated_at timestamp,
      deleted_at timestamp
    )
  `;
  
  const result = await db.raw(query);
  return result.rows[0] || null;
};

/**
 * Restore soft deleted customer
 */
const restore = async (id) => {
  await ensureConnection();
  
  const query = `
    SELECT * FROM dblink('${DB_LINK_NAME}', 
      'UPDATE customers SET deleted_at = NULL, updated_at = NOW() WHERE id = ''${id}'' AND deleted_at IS NOT NULL RETURNING *'
    ) AS customers (
      id uuid,
      name varchar,
      email varchar,
      phone varchar,
      created_by uuid,
      updated_by uuid,
      deleted_by uuid,
      created_at timestamp,
      updated_at timestamp,
      deleted_at timestamp
    )
  `;
  
  const result = await db.raw(query);
  return result.rows[0] || null;
};

/**
 * Hard delete customer (permanent)
 */
const hardDelete = async (id) => {
  await ensureConnection();
  
  const query = `
    SELECT * FROM dblink('${DB_LINK_NAME}', 
      'DELETE FROM customers WHERE id = ''${id}'''
    ) AS customers (
      id uuid,
      name varchar,
      email varchar,
      phone varchar,
      created_by uuid,
      updated_by uuid,
      deleted_by uuid,
      created_at timestamp,
      updated_at timestamp,
      deleted_at timestamp
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

