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
 * Validate and sanitize sort column
 */
const validateSortBy = (sortBy) => {
  const allowedColumns = ['employee_id', 'employee_name', 'employee_email', 'employee_phone', 'department_id', 'title_id', 'created_at'];
  return allowedColumns.includes(sortBy) ? sortBy : 'created_at';
};

/**
 * Validate and sanitize sort order
 */
const validateSortOrder = (sortOrder) => {
  return ['asc', 'desc'].includes(sortOrder?.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';
};

/**
 * Find all employees with pagination, search, and sort
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
    'SELECT employee_id, employee_name, employee_email, employee_phone, department_id, title_id, created_at FROM',
    TABLE_NAME,
    'WHERE 1=1 AND is_delete = false'
  ];
  
  if (search && search.trim()) {
    // Escape search string properly using PostgreSQL quote_literal
    const escapedSearchResult = await db.raw(`SELECT quote_literal(?) as escaped`, [`%${search.trim()}%`]);
    const escapedSearch = escapedSearchResult.rows[0]?.escaped;
    
    // Build search condition using string concatenation
    innerQueryArray.push('AND (');
    innerQueryArray.push('LOWER(employee_name) LIKE LOWER(' + escapedSearch + ')');
    innerQueryArray.push('OR');
    innerQueryArray.push('LOWER(employee_email) LIKE LOWER(' + escapedSearch + ')');
    innerQueryArray.push(')');
  }
  
  innerQueryArray.push(`ORDER BY ${safeSortBy} ${safeSortOrder}`);
  innerQueryArray.push(`LIMIT ${safeLimit}`);
  innerQueryArray.push(`OFFSET ${safeOffset}`);
  
  // Join all parts - this ensures escapedSearch is properly inserted
  const innerQuery = innerQueryArray.join(' ');
  
  // Escape the entire inner query manually for dblink (double single quotes for single quotes)
  const escapedInnerQuery = "'" + innerQuery.replace(/'/g, "''") + "'";
  
  // Build the final query using db.raw with parameterized query
  const finalQuery = `SELECT * FROM dblink('${DB_LINK_NAME}', ${escapedInnerQuery}) AS employees (
    employee_id uuid,
    employee_name varchar,
    employee_email varchar,
    employee_phone varchar,
    department_id uuid,
    title_id uuid,
    created_at timestamp
  )`;
  
  const data = await db.raw(finalQuery);
  
  // Query total count
  let countQueryArray = [
    'SELECT COUNT(*) as count FROM',
    TABLE_NAME,
    'WHERE 1=1 AND is_delete = false'
  ];
  
  if (search && search.trim()) {
    // Escape search string properly using PostgreSQL quote_literal
    const escapedSearchResult = await db.raw(`SELECT quote_literal(?) as escaped`, [`%${search.trim()}%`]);
    const escapedSearch = escapedSearchResult.rows[0]?.escaped;
    
    countQueryArray.push('AND (');
    countQueryArray.push('LOWER(employee_name) LIKE LOWER(' + escapedSearch + ')');
    countQueryArray.push('OR');
    countQueryArray.push('LOWER(employee_email) LIKE LOWER(' + escapedSearch + ')');
    countQueryArray.push(')');
  }
  
  const countInnerQuery = countQueryArray.join(' ');
  // Escape the count query manually for dblink (double single quotes for single quotes)
  const escapedCountQuery = "'" + countInnerQuery.replace(/'/g, "''") + "'";
  
  const countFinalQuery = `SELECT COUNT(*) as count FROM dblink('${DB_LINK_NAME}', ${escapedCountQuery}) AS employees_count (
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
 * Find single employee by ID
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
  const innerQuery = `SELECT employee_id, employee_name, employee_email, employee_phone, department_id, title_id, created_at FROM ${TABLE_NAME} WHERE employee_id = ${escapedId} AND is_delete = false`;
  
  // Escape the entire inner query
  const escapedQueryResult = await db.raw(`SELECT quote_literal(?) as escaped`, [innerQuery]);
  const escapedInnerQuery = escapedQueryResult.rows[0]?.escaped;
  
  const query = `
    SELECT * FROM dblink('${DB_LINK_NAME}', 
      ${escapedInnerQuery}
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
  const innerQuery = `SELECT employee_id, employee_name, employee_email, employee_phone, department_id, title_id, created_at FROM ${TABLE_NAME} WHERE ${whereClause} AND is_delete = false LIMIT 1`;
  
  // Escape the entire inner query
  const escapedQueryResult = await db.raw(`SELECT quote_literal(?) as escaped`, [innerQuery]);
  const escapedInnerQuery = escapedQueryResult.rows[0]?.escaped;
  
  const query = `
    SELECT * FROM dblink('${DB_LINK_NAME}', 
      ${escapedInnerQuery}
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

