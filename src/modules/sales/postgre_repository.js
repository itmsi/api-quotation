const db = require('../../config/database');

// DBLINK connection string from environment variables
const DB_LINK_CONNECTION = `dbname=${process.env.DB_GATE_SSO_NAME} user=${process.env.DB_GATE_SSO_USER} password=${process.env.DB_GATE_SSO_PASSWORD} host=${process.env.DB_GATE_SSO_HOST} port=${process.env.DB_GATE_SSO_PORT}`;
const DB_LINK_NAME = 'gate_sso_dblink';
const TABLE_NAME = 'employees';

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
 * Build where clause for search
 * Escape single quotes to prevent SQL injection
 */
const buildSearchWhere = (search) => {
  if (!search || search.trim() === '') return '';
  
  // Escape single quotes in search string
  const escapedSearch = search.replace(/'/g, "''");
  
  return `AND (
    LOWER(employee_name) LIKE LOWER('%${escapedSearch}%') OR 
    LOWER(employee_email) LIKE LOWER('%${escapedSearch}%')
  )`;
};

/**
 * Find all employees with pagination, search, and sort
 */
const findAll = async (params) => {
  const { page, limit, offset, search, sortBy, sortOrder } = params;
  
  await ensureConnection();
  
  const searchWhere = buildSearchWhere(search);
  
  // Query data
  const dataQuery = `
    SELECT * FROM dblink('${DB_LINK_NAME}', 
      'SELECT employee_id, employee_name, employee_email, employee_phone, department_id, title_id, created_at FROM ${TABLE_NAME} WHERE 1=1 AND is_delete = false ${searchWhere} ORDER BY ${sortBy} ${sortOrder} LIMIT ${limit} OFFSET ${offset}'
    ) AS employees (
      employee_id uuid,
      employee_name varchar,
      employee_email varchar,
      employee_phone varchar,
      department_id uuid,
      title_id uuid,
      created_at timestamp
    )
  `;
  
  const data = await db.raw(dataQuery);
  
  // Query total count
  const countQuery = `
    SELECT COUNT(*) as count FROM dblink('${DB_LINK_NAME}', 
      'SELECT COUNT(*) as count FROM ${TABLE_NAME} WHERE 1=1 AND is_delete = false ${searchWhere}'
    ) AS employees_count (
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
 * Find single employee by ID
 */
const findById = async (id) => {
  await ensureConnection();
  
  const query = `
    SELECT * FROM dblink('${DB_LINK_NAME}', 
      'SELECT employee_id, employee_name, employee_email, employee_phone, department_id, title_id, created_at FROM ${TABLE_NAME} WHERE employee_id = ''${id}'' AND is_delete = false'
    ) AS employees (
      employee_id uuid,
      employee_name varchar,
      employee_email varchar,
      employee_phone varchar,
      department_id uuid,
      title_id uuid,
      created_at timestamp
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
      'SELECT employee_id, employee_name, employee_email, employee_phone, department_id, title_id, created_at FROM ${TABLE_NAME} WHERE ${whereClause} AND is_delete = false LIMIT 1'
    ) AS employees (
      employee_id uuid,
      employee_name varchar,
      employee_email varchar,
      employee_phone varchar,
      department_id uuid,
      title_id uuid,
      created_at timestamp
    )
  `;
  
  const result = await db.raw(query);
  return result.rows[0] || null;
};

module.exports = {
  findAll,
  findById,
  findOne
};

