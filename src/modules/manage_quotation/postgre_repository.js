const customerRepository = require('../cutomer/postgre_repository');
const DBLINK_NAME = 'gate_sso_dblink';
const DB_LINK_CONNECTION = `dbname=${process.env.DB_GATE_SSO_NAME} user=${process.env.DB_GATE_SSO_USER} password=${process.env.DB_GATE_SSO_PASSWORD} host=${process.env.DB_GATE_SSO_HOST} port=${process.env.DB_GATE_SSO_PORT}`;
const db = require('../../config/database');
const moment = require('moment');
const componenProductRepository = require('../componen_product/postgre_repository');
const accessoryRepository = require('../accessory/postgre_repository');

const TABLE_NAME = 'manage_quotations';

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
        console.error(`[manage-quotation:ensureDblinkConnection] Failed after ${maxRetries} attempts:`, error.message);
        return false; // Connection failed after all retries
      }
      // Wait a bit before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 100 * attempt));
    }
  }
  return false;
};

/**
 * Get customer data from dblink by customer_id
 * Returns customer data with all required fields for customer_datas
 */
const getCustomerDataFromDblink = async (customerId) => {
  if (!customerId) {
    return null;
  }

  try {
    const dblinkConnected = await ensureDblinkConnection();
    if (!dblinkConnected) {
      console.error('[manage-quotation:getCustomerDataFromDblink] Dblink connection failed');
      return null;
    }

    // Escape ID using PostgreSQL quote_literal
    const escapedIdResult = await db.raw(`SELECT quote_literal(?) as escaped`, [customerId]);
    const escapedId = escapedIdResult.rows[0]?.escaped;

    // Build inner query to get all required customer fields
    const innerQuery = `SELECT customer_id, customer_name, customer_email, customer_phone, customer_address, customer_city, customer_state, customer_zip, customer_country, job_title, contact_person, customer_code FROM customers WHERE customer_id = ${escapedId}`;

    // Escape the entire inner query
    const escapedQueryResult = await db.raw(`SELECT quote_literal(?) as escaped`, [innerQuery]);
    const escapedInnerQuery = escapedQueryResult.rows[0]?.escaped;

    const query = `
      SELECT * FROM dblink('${DBLINK_NAME}', 
        ${escapedInnerQuery}
      ) AS customers (
        customer_id uuid,
        customer_name varchar,
        customer_email varchar,
        customer_phone varchar,
        customer_address varchar,
        customer_city varchar,
        customer_state varchar,
        customer_zip varchar,
        customer_country varchar,
        job_title varchar,
        contact_person varchar,
        customer_code varchar
      )
    `;

    const result = await db.raw(query);
    return result.rows[0] || null;
  } catch (error) {
    console.error('[manage-quotation:getCustomerDataFromDblink] Error:', error.message);
    return null;
  }
};

/**
 * Get employee data from dblink by employee_id
 * Returns employee data with joins to titles, departments, and companies
 */
const getEmployeeDataFromDblink = async (employeeId) => {
  if (!employeeId) {
    return null;
  }

  try {
    const dblinkConnected = await ensureDblinkConnection();
    if (!dblinkConnected) {
      console.error('[manage-quotation:getEmployeeDataFromDblink] Dblink connection failed');
      return null;
    }

    // Escape ID using PostgreSQL quote_literal
    const escapedIdResult = await db.raw(`SELECT quote_literal(?) as escaped`, [employeeId]);
    const escapedId = escapedIdResult.rows[0]?.escaped;

    // Build inner query with LEFT JOIN to titles, departments, and companies
    const innerQuery = `
      SELECT 
        e.employee_id,
        e.employee_name,
        e.employee_email,
        e.employee_phone,
        e.employee_address,
        t.title_name,
        d.department_name,
        c.company_name
      FROM employees e
      LEFT JOIN titles t ON e.title_id = t.title_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN companies c ON d.company_id = c.company_id
      WHERE e.employee_id = ${escapedId} AND e.is_delete = false
    `;

    // Escape the entire inner query
    const escapedQueryResult = await db.raw(`SELECT quote_literal(?) as escaped`, [innerQuery]);
    const escapedInnerQuery = escapedQueryResult.rows[0]?.escaped;

    const query = `
      SELECT * FROM dblink('${DBLINK_NAME}', 
        ${escapedInnerQuery}
      ) AS employees (
        employee_id uuid,
        employee_name varchar,
        employee_email varchar,
        employee_phone varchar,
        employee_address varchar,
        title_name varchar,
        department_name varchar,
        company_name varchar
      )
    `;

    const result = await db.raw(query);
    return result.rows[0] || null;
  } catch (error) {
    console.error('[manage-quotation:getEmployeeDataFromDblink] Error:', error.message);
    return null;
  }
};

/**
 * Get island data from dblink by island_id
 * Returns island data with all required fields for island_datas
 */
const getIslandDataFromDblink = async (islandId) => {
  if (!islandId) {
    return null;
  }

  try {
    const dblinkConnected = await ensureDblinkConnection();
    if (!dblinkConnected) {
      console.error('[manage-quotation:getIslandDataFromDblink] Dblink connection failed');
      return null;
    }

    // Escape ID using PostgreSQL quote_literal
    const escapedIdResult = await db.raw(`SELECT quote_literal(?) as escaped`, [islandId]);
    const escapedId = escapedIdResult.rows[0]?.escaped;

    // Build inner query to get island data
    const innerQuery = `SELECT island_id, island_name FROM islands WHERE island_id = ${escapedId}`;

    // Escape the entire inner query
    const escapedQueryResult = await db.raw(`SELECT quote_literal(?) as escaped`, [innerQuery]);
    const escapedInnerQuery = escapedQueryResult.rows[0]?.escaped;

    const query = `
      SELECT * FROM dblink('${DBLINK_NAME}', 
        ${escapedInnerQuery}
      ) AS islands (
        island_id uuid,
        island_name varchar
      )
    `;

    const result = await db.raw(query);
    return result.rows[0] || null;
  } catch (error) {
    console.error('[manage-quotation:getIslandDataFromDblink] Error:', error.message);
    return null;
  }
};

/**
 * Find all manage quotations with pagination, search, and sort
 */
const findAll = async (params) => {
  const { page, limit, offset, search, sortBy, sortOrder, status, islandId } = params;
  
  // Try to ensure dblink connection, but don't fail if it doesn't work
  const dblinkConnected = await ensureDblinkConnection();
  
  // If dblink connection fails, we'll query without joins and handle data enrichment later
  let customerJoin, employeeJoin, islandJoin;
  
  if (dblinkConnected) {
    customerJoin = db.raw(
    `dblink('${DBLINK_NAME}', 'SELECT customer_id, customer_name, contact_person FROM customers WHERE customer_id IS NOT NULL') AS customer_data(customer_id uuid, customer_name varchar, contact_person varchar)`
  );

    employeeJoin = db.raw(
    `dblink('${DBLINK_NAME}', 'SELECT employee_id, employee_name FROM employees WHERE employee_id IS NOT NULL AND is_delete = false') AS employee_data(employee_id uuid, employee_name varchar)`
  );

    islandJoin = db.raw(
    `dblink('${DBLINK_NAME}', 'SELECT island_id, island_name FROM islands WHERE island_id IS NOT NULL') AS island_data(island_id uuid, island_name varchar)`
  );
  } else {
    // Create dummy joins that return empty results if dblink is not available
    customerJoin = db.raw(`(SELECT NULL::uuid as customer_id, NULL::varchar as customer_name, NULL::varchar as contact_person WHERE false) AS customer_data(customer_id uuid, customer_name varchar, contact_person varchar)`);
    employeeJoin = db.raw(`(SELECT NULL::uuid as employee_id, NULL::varchar as employee_name WHERE false) AS employee_data(employee_id uuid, employee_name varchar)`);
    islandJoin = db.raw(`(SELECT NULL::uuid as island_id, NULL::varchar as island_name WHERE false) AS island_data(island_id uuid, island_name varchar)`);
  }

  // Query data - use parameterized query with knex
  // Note: We still include dblink joins for backward compatibility, but data will be taken from jsonb columns
  let query = db({ mq: TABLE_NAME })
    .select(
      'mq.manage_quotation_id',
      'mq.manage_quotation_no',
      'mq.customer_id',
      'mq.customer_datas',
      db.raw('customer_data.customer_name as customer_name'),
      db.raw('customer_data.contact_person as contact_person'),
      'mq.employee_id',
      'mq.employee_datas',
      db.raw('employee_data.employee_name as employee_name'),
      'mq.island_id',
      'mq.island_datas',
      db.raw('island_data.island_name as island_name'),
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
    .leftJoin(islandJoin, 'mq.island_id', 'island_data.island_id')
    .where('mq.is_delete', false);
  
  // Add search condition
  if (search && search.trim() !== '') {
    const searchLower = `%${search.toLowerCase()}%`;
    query = query.where(function() {
      this.where('mq.manage_quotation_no', 'ILIKE', searchLower)
        .orWhere(db.raw('LOWER(CAST(mq.customer_id AS TEXT))'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(CAST(mq.employee_id AS TEXT))'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(CAST(mq.island_id AS TEXT))'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(customer_data.customer_name)'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(employee_data.employee_name)'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(island_data.island_name)'), 'LIKE', searchLower);
    });
  }
  
  // Add status filter condition
  if (status && status.trim() !== '') {
    query = query.where('mq.status', status.trim().toLowerCase());
  }
  
  // Add island_id filter condition
  if (islandId && islandId.trim() !== '') {
    query = query.where('mq.island_id', islandId.trim());
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
  
  let data;
  try {
    data = await query;
  } catch (error) {
    // If query fails due to dblink connection issue, retry with fresh connection
    if (error.message && (error.message.includes('could not establish connection') || error.message.includes('dblink'))) {
      console.error('[manage-quotation:findAll] Query failed due to dblink error, retrying...', error.message);
      
      // Try to reconnect
      const reconnected = await ensureDblinkConnection();
      
      if (reconnected) {
        // Rebuild joins with fresh connection
        customerJoin = db.raw(
          `dblink('${DBLINK_NAME}', 'SELECT customer_id, customer_name, contact_person FROM customers WHERE customer_id IS NOT NULL') AS customer_data(customer_id uuid, customer_name varchar, contact_person varchar)`
        );
        employeeJoin = db.raw(
          `dblink('${DBLINK_NAME}', 'SELECT employee_id, employee_name FROM employees WHERE employee_id IS NOT NULL AND is_delete = false') AS employee_data(employee_id uuid, employee_name varchar)`
        );
        islandJoin = db.raw(
          `dblink('${DBLINK_NAME}', 'SELECT island_id, island_name FROM islands WHERE island_id IS NOT NULL') AS island_data(island_id uuid, island_name varchar)`
        );
        
        // Retry query without joins if still fails
        try {
          query = db({ mq: TABLE_NAME })
            .select(
              'mq.manage_quotation_id',
              'mq.manage_quotation_no',
              'mq.customer_id',
              db.raw('customer_data.customer_name as customer_name'),
              db.raw('customer_data.contact_person as contact_person'),
              'mq.employee_id',
              db.raw('employee_data.employee_name as employee_name'),
              'mq.island_id',
              db.raw('island_data.island_name as island_name'),
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
            .leftJoin(islandJoin, 'mq.island_id', 'island_data.island_id')
            .where('mq.is_delete', false);
          
          // Reapply filters
          if (search && search.trim() !== '') {
            const searchLower = `%${search.toLowerCase()}%`;
            query = query.where(function() {
              this.where('mq.manage_quotation_no', 'ILIKE', searchLower)
                .orWhere(db.raw('LOWER(CAST(mq.customer_id AS TEXT))'), 'LIKE', searchLower)
                .orWhere(db.raw('LOWER(CAST(mq.employee_id AS TEXT))'), 'LIKE', searchLower)
                .orWhere(db.raw('LOWER(CAST(mq.island_id AS TEXT))'), 'LIKE', searchLower);
            });
          }
          
          if (status && status.trim() !== '') {
            query = query.where('mq.status', status.trim().toLowerCase());
          }
          
          if (islandId && islandId.trim() !== '') {
            query = query.where('mq.island_id', islandId.trim());
          }
          
          query = query.orderBy(sortBySafe, sortOrderSafe).limit(parseInt(limit)).offset(parseInt(offset));
          data = await query;
        } catch (retryError) {
          // If retry also fails, query without dblink joins
          console.error('[manage-quotation:findAll] Retry failed, querying without dblink joins', retryError.message);
          query = db({ mq: TABLE_NAME })
            .select('mq.*')
            .where('mq.is_delete', false);
          
          if (search && search.trim() !== '') {
            const searchLower = `%${search.toLowerCase()}%`;
            query = query.where('mq.manage_quotation_no', 'ILIKE', searchLower);
          }
          
          if (status && status.trim() !== '') {
            query = query.where('mq.status', status.trim().toLowerCase());
          }
          
          if (islandId && islandId.trim() !== '') {
            query = query.where('mq.island_id', islandId.trim());
          }
          
          query = query.orderBy(sortBySafe, sortOrderSafe).limit(parseInt(limit)).offset(parseInt(offset));
          data = await query;
          
          // Set null values for joined fields
          data = data.map(item => ({
            ...item,
            customer_name: null,
            contact_person: null,
            employee_name: null,
            island_name: null
          }));
        }
      } else {
        // If reconnection fails, query without joins
        console.error('[manage-quotation:findAll] Could not reconnect dblink, querying without joins');
        query = db({ mq: TABLE_NAME })
          .select('mq.*')
          .where('mq.is_delete', false);
        
        if (search && search.trim() !== '') {
          const searchLower = `%${search.toLowerCase()}%`;
          query = query.where('mq.manage_quotation_no', 'ILIKE', searchLower);
        }
        
        if (status && status.trim() !== '') {
          query = query.where('mq.status', status.trim().toLowerCase());
        }
        
        if (islandId && islandId.trim() !== '') {
          query = query.where('mq.island_id', islandId.trim());
        }
        
        query = query.orderBy(sortBySafe, sortOrderSafe).limit(parseInt(limit)).offset(parseInt(offset));
        data = await query;
        
        // Set null values for joined fields
        data = data.map(item => ({
          ...item,
          customer_name: null,
          contact_person: null,
          employee_name: null,
          island_name: null
        }));
      }
    } else {
      // Re-throw if it's not a dblink error
      throw error;
    }
  }
  
  // Query total count
  let countQuery = db({ mq: TABLE_NAME })
    .count('* as count')
    .leftJoin(customerJoin, 'mq.customer_id', 'customer_data.customer_id')
    .leftJoin(employeeJoin, 'mq.employee_id', 'employee_data.employee_id')
    .leftJoin(islandJoin, 'mq.island_id', 'island_data.island_id')
    .where('mq.is_delete', false);
  
  if (search && search.trim() !== '') {
    const searchLower = `%${search.toLowerCase()}%`;
    countQuery = countQuery.where(function() {
      this.where('mq.manage_quotation_no', 'ILIKE', searchLower)
        .orWhere(db.raw('LOWER(CAST(mq.customer_id AS TEXT))'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(CAST(mq.employee_id AS TEXT))'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(CAST(mq.island_id AS TEXT))'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(customer_data.customer_name)'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(employee_data.employee_name)'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(island_data.island_name)'), 'LIKE', searchLower);
    });
  }
  
  // Add status filter condition to count query
  if (status && status.trim() !== '') {
    countQuery = countQuery.where('mq.status', status.trim().toLowerCase());
  }
  
  // Add island_id filter condition to count query
  if (islandId && islandId.trim() !== '') {
    countQuery = countQuery.where('mq.island_id', islandId.trim());
  }
  
  let totalResult;
  try {
    totalResult = await countQuery;
  } catch (error) {
    // If count query fails due to dblink, query without joins
    if (error.message && (error.message.includes('could not establish connection') || error.message.includes('dblink'))) {
      console.error('[manage-quotation:findAll] Count query failed due to dblink error, querying without joins', error.message);
      countQuery = db({ mq: TABLE_NAME })
        .count('* as count')
        .where('mq.is_delete', false);
      
      if (search && search.trim() !== '') {
        const searchLower = `%${search.toLowerCase()}%`;
        countQuery = countQuery.where('mq.manage_quotation_no', 'ILIKE', searchLower);
      }
      
      if (status && status.trim() !== '') {
        countQuery = countQuery.where('mq.status', status.trim().toLowerCase());
      }
      
      if (islandId && islandId.trim() !== '') {
        countQuery = countQuery.where('mq.island_id', islandId.trim());
      }
      
      totalResult = await countQuery;
    } else {
      // Re-throw if it's not a dblink error
      throw error;
    }
  }
  
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
 * Convert month number (1-12) to Roman numeral
 */
const monthToRoman = (month) => {
  const romans = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return romans[month] || '';
};

/**
 * Generate quotation number with format: 001/IEC-MSI/IX/2025
 * Format: {sequence}/IEC-MSI/{month-roman}/{year}
 * Sequence increments per year, resets to 001 when year changes
 * Month is displayed but does not affect sequence reset
 */
const generateQuotationNumber = async (trx = db) => {
  const currentYear = moment().format('YYYY');
  const currentMonth = moment().month() + 1; // moment().month() returns 0-11, we need 1-12
  const monthRoman = monthToRoman(currentMonth);
  const prefix = 'IEC-MSI';
  
  // Find the last quotation number for current year
  // Extract sequence number (first 3 digits before '/') and sort numerically
  // Query based on year only, sequence reset only when year changes
  const lastQuotation = await trx(TABLE_NAME)
    .select('manage_quotation_no')
    .where('is_delete', false)
    .whereNotNull('manage_quotation_no')
    .whereRaw(`manage_quotation_no LIKE '%/${prefix}/%/${currentYear}'`)
    .orderByRaw(`CAST(SPLIT_PART(manage_quotation_no, '/', 1) AS INTEGER) DESC`)
    .first();
  
  let sequence = 1;
  
  if (lastQuotation && lastQuotation.manage_quotation_no) {
    // Extract sequence number from last quotation number
    // Format: 001/IEC-MSI/IX/2025 (4 parts) or 001/IEC-MSI/2025 (3 parts - old format)
    const parts = lastQuotation.manage_quotation_no.split('/');
    
    // Handle both old format (3 parts) and new format (4 parts)
    if ((parts.length === 4 && parts[1] === prefix && parts[3] === currentYear) ||
        (parts.length === 3 && parts[1] === prefix && parts[2] === currentYear)) {
      const lastSequence = parseInt(parts[0], 10);
      if (!isNaN(lastSequence) && lastSequence > 0) {
        sequence = lastSequence + 1;
      }
    }
  }
  
  // Format sequence with leading zeros (001, 002, etc.)
  const sequenceStr = String(sequence).padStart(3, '0');
  
  return `${sequenceStr}/${prefix}/${monthRoman}/${currentYear}`;
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
  
  // Get customer_datas from dblink if customer_id is provided
  let customerDatas = null;
  if (data.customer_id) {
    try {
      const customerData = await getCustomerDataFromDblink(data.customer_id);
      if (customerData) {
        customerDatas = customerData;
        console.log('[manage-quotation:create] Customer data retrieved:', {
          customer_id: data.customer_id,
          has_data: !!customerData
        });
      } else {
        console.warn('[manage-quotation:create] Customer data not found for customer_id:', data.customer_id);
      }
    } catch (error) {
      console.error('[manage-quotation:create] Error getting customer data:', error.message);
    }
  }
  
  // Get employee_datas from dblink if employee_id is provided
  let employeeDatas = null;
  if (data.employee_id) {
    try {
      const employeeData = await getEmployeeDataFromDblink(data.employee_id);
      if (employeeData) {
        employeeDatas = employeeData;
        console.log('[manage-quotation:create] Employee data retrieved:', {
          employee_id: data.employee_id,
          has_data: !!employeeData
        });
      } else {
        console.warn('[manage-quotation:create] Employee data not found for employee_id:', data.employee_id);
      }
    } catch (error) {
      console.error('[manage-quotation:create] Error getting employee data:', error.message);
    }
  }
  
  // Get island_datas from dblink if island_id is provided
  let islandDatas = null;
  if (data.island_id) {
    try {
      const islandData = await getIslandDataFromDblink(data.island_id);
      if (islandData) {
        islandDatas = islandData;
        console.log('[manage-quotation:create] Island data retrieved:', {
          island_id: data.island_id,
          has_data: !!islandData
        });
      } else {
        console.warn('[manage-quotation:create] Island data not found for island_id:', data.island_id);
      }
    } catch (error) {
      console.error('[manage-quotation:create] Error getting island data:', error.message);
    }
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
    island_id: data.island_id || null,
    created_by: data.created_by || null
  };
  
  // Handle jsonb columns separately with explicit casting
  if (customerDatas) {
    fields.customer_datas = trx.raw('?::jsonb', [JSON.stringify(customerDatas)]);
  } else {
    fields.customer_datas = null;
  }
  
  if (employeeDatas) {
    fields.employee_datas = trx.raw('?::jsonb', [JSON.stringify(employeeDatas)]);
  } else {
    fields.employee_datas = null;
  }
  
  if (islandDatas) {
    fields.island_datas = trx.raw('?::jsonb', [JSON.stringify(islandDatas)]);
  } else {
    fields.island_datas = null;
  }
  
  // Insert with jsonb handling
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
  
  // Get customer_datas from dblink if customer_id is being updated
  if (data.customer_id !== undefined) {
    if (data.customer_id) {
      const customerData = await getCustomerDataFromDblink(data.customer_id);
      if (customerData) {
        data.customer_datas = customerData;
      } else {
        data.customer_datas = null;
      }
    } else {
      data.customer_datas = null;
    }
  }
  
  // Get employee_datas from dblink if employee_id is being updated
  if (data.employee_id !== undefined) {
    if (data.employee_id) {
      const employeeData = await getEmployeeDataFromDblink(data.employee_id);
      if (employeeData) {
        data.employee_datas = employeeData;
      } else {
        data.employee_datas = null;
      }
    } else {
      data.employee_datas = null;
    }
  }
  
  // Get island_datas from dblink if island_id is being updated
  if (data.island_id !== undefined) {
    if (data.island_id) {
      const islandData = await getIslandDataFromDblink(data.island_id);
      if (islandData) {
        data.island_datas = islandData;
      } else {
        data.island_datas = null;
      }
    } else {
      data.island_datas = null;
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
  if (data.island_id !== undefined) updateFields.island_id = data.island_id;
  // Handle jsonb columns separately with explicit casting
  if (data.customer_datas !== undefined) {
    if (data.customer_datas) {
      updateFields.customer_datas = trx.raw('?::jsonb', [JSON.stringify(data.customer_datas)]);
    } else {
      updateFields.customer_datas = null;
    }
  }
  if (data.employee_datas !== undefined) {
    if (data.employee_datas) {
      updateFields.employee_datas = trx.raw('?::jsonb', [JSON.stringify(data.employee_datas)]);
    } else {
      updateFields.employee_datas = null;
    }
  }
  if (data.island_datas !== undefined) {
    if (data.island_datas) {
      updateFields.island_datas = trx.raw('?::jsonb', [JSON.stringify(data.island_datas)]);
    } else {
      updateFields.island_datas = null;
    }
  }
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
      msi_product: item.msi_product ?? null,
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
      'mqi.msi_product',
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
      db.raw('cp.msi_product as cp_msi_product'),
      db.raw('cp.wheel_no as cp_wheel_no'),
      db.raw('cp.engine as cp_engine'),
      db.raw('cp.volume as cp_volume'),
      db.raw('cp.horse_power as cp_horse_power'),
      db.raw('cp.market_price as cp_market_price'),
      db.raw('cp.componen_product_name as cp_componen_product_name'),
      db.raw('cp.componen_product_unit_model as cp_componen_product_unit_model'),
      db.raw('cp.image as cp_image'),
      db.raw('cp.componen_type as cp_componen_type')
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
    // Only store accessory_id and quantity, data will be fetched from accessories table via join
    const fields = {
      manage_quotation_id: manage_quotation_id || null,
      accessory_id: accessory.accessory_id || null,
      componen_product_id: accessory.componen_product_id || null,
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
      'mqia.quantity',
      'mqia.description',
      'mqia.created_by',
      'mqia.updated_by',
      'mqia.deleted_by',
      'mqia.created_at',
      'mqia.updated_at',
      'mqia.deleted_at',
      'mqia.is_delete',
      // Data from accessories table (use these as primary data)
      'a.accessory_part_number',
      'a.accessory_part_name',
      'a.accessory_specification',
      'a.accessory_brand',
      'a.accessory_remark',
      'a.accessory_region',
      'a.accessory_description'
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
      db.raw('cp.msi_product as cp_msi_product'),
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

/**
 * Duplicate manage quotation with all related data
 * Creates a new quotation with:
 * - New manage_quotation_no (generated)
 * - status = 'draft'
 * - manage_quotation_description = copy from manage_quotation_no mana
 */
const duplicateQuotation = async (sourceQuotationId, created_by, trx = db) => {
  // Get source quotation
  const sourceQuotation = await findById(sourceQuotationId);
  if (!sourceQuotation) {
    throw new Error('Quotation tidak ditemukan');
  }

  // Get all related data
  const sourceItems = await getItemsByQuotationId(sourceQuotationId);
  const sourceAccessories = await getAccessoriesByQuotationId(sourceQuotationId);
  const sourceSpecifications = await getSpecificationsByQuotationId(sourceQuotationId);

  // Generate new quotation number
  const newQuotationNo = await generateQuotationNumber(trx);

  // Build description: copy from manage_quotation_no mana
  const descriptionPrefix = sourceQuotation.manage_quotation_no 
    ? `Copy dari ${sourceQuotation.manage_quotation_no}` 
    : 'Copy dari quotation';
  const newDescription = sourceQuotation.manage_quotation_description
    ? `${descriptionPrefix}. ${sourceQuotation.manage_quotation_description}`
    : descriptionPrefix;

  // Parse jsonb columns from source quotation if they exist
  let customerDatas = null;
  let employeeDatas = null;
  let islandDatas = null;
  
  if (sourceQuotation.customer_datas) {
    try {
      customerDatas = typeof sourceQuotation.customer_datas === 'string' 
        ? JSON.parse(sourceQuotation.customer_datas) 
        : sourceQuotation.customer_datas;
    } catch (error) {
      console.error('[manage-quotation:duplicateQuotation] Error parsing customer_datas:', error.message);
    }
  }
  
  if (sourceQuotation.employee_datas) {
    try {
      employeeDatas = typeof sourceQuotation.employee_datas === 'string' 
        ? JSON.parse(sourceQuotation.employee_datas) 
        : sourceQuotation.employee_datas;
    } catch (error) {
      console.error('[manage-quotation:duplicateQuotation] Error parsing employee_datas:', error.message);
    }
  }
  
  if (sourceQuotation.island_datas) {
    try {
      islandDatas = typeof sourceQuotation.island_datas === 'string' 
        ? JSON.parse(sourceQuotation.island_datas) 
        : sourceQuotation.island_datas;
    } catch (error) {
      console.error('[manage-quotation:duplicateQuotation] Error parsing island_datas:', error.message);
    }
  }
  
  // Prepare new quotation data
  const newQuotationData = {
    manage_quotation_no: newQuotationNo,
    customer_id: sourceQuotation.customer_id,
    employee_id: sourceQuotation.employee_id,
    island_id: sourceQuotation.island_id,
    manage_quotation_date: sourceQuotation.manage_quotation_date,
    manage_quotation_valid_date: sourceQuotation.manage_quotation_valid_date,
    manage_quotation_grand_total: sourceQuotation.manage_quotation_grand_total,
    manage_quotation_ppn: sourceQuotation.manage_quotation_ppn,
    manage_quotation_delivery_fee: sourceQuotation.manage_quotation_delivery_fee,
    manage_quotation_other: sourceQuotation.manage_quotation_other,
    manage_quotation_payment_presentase: sourceQuotation.manage_quotation_payment_presentase,
    manage_quotation_payment_nominal: sourceQuotation.manage_quotation_payment_nominal,
    manage_quotation_description: newDescription,
    manage_quotation_shipping_term: sourceQuotation.manage_quotation_shipping_term,
    manage_quotation_franco: sourceQuotation.manage_quotation_franco,
    manage_quotation_lead_time: sourceQuotation.manage_quotation_lead_time,
    bank_account_name: sourceQuotation.bank_account_name,
    bank_account_number: sourceQuotation.bank_account_number,
    bank_account_bank_name: sourceQuotation.bank_account_bank_name,
    term_content_id: sourceQuotation.term_content_id,
    term_content_directory: sourceQuotation.term_content_directory,
    status: 'draft',
    include_aftersales_page: sourceQuotation.include_aftersales_page ?? false,
    include_msf_page: sourceQuotation.include_msf_page ?? false,
    customer_datas: customerDatas,
    employee_datas: employeeDatas,
    island_datas: islandDatas,
    created_by: created_by
  };

  // Create new quotation
  const newQuotation = await create(newQuotationData, trx);

  // Prepare items for duplication (remove IDs and manage_quotation_id)
  const itemsForInsert = sourceItems.map(item => {
    const { 
      manage_quotation_item_id, 
      manage_quotation_id, 
      created_at, 
      updated_at, 
      deleted_at,
      created_by: item_created_by,
      updated_by: item_updated_by,
      deleted_by: item_deleted_by,
      is_delete,
      // Remove fields from JOIN with componen_products
      cp_code_unique,
      cp_segment,
      cp_msi_model,
      cp_msi_product,
      cp_wheel_no,
      cp_engine,
      cp_volume,
      cp_horse_power,
      cp_market_price,
      cp_componen_product_name,
      cp_componen_product_unit_model,
      cp_image,
      cp_componen_type,
      ...rest
    } = item;
    return rest;
  });

  // Prepare accessories for duplication
  const accessoriesForInsert = sourceAccessories.map(accessory => {
    const {
      manage_quotation_item_accessory_id,
      manage_quotation_id,
      created_at,
      updated_at,
      deleted_at,
      created_by: acc_created_by,
      updated_by: acc_updated_by,
      deleted_by: acc_deleted_by,
      is_delete,
      // Remove fields from JOIN with accessories
      accessory_part_number_source,
      accessory_part_name_source,
      accessory_specification_source,
      accessory_brand_source,
      accessory_remark_source,
      accessory_region_source,
      accessory_description_source,
      ...rest
    } = accessory;
    return rest;
  });

  // Prepare specifications for duplication
  const specificationsForInsert = sourceSpecifications.map(spec => {
    const {
      manage_quotation_item_specification_id,
      manage_quotation_id,
      created_at,
      updated_at,
      deleted_at,
      created_by: spec_created_by,
      updated_by: spec_updated_by,
      deleted_by: spec_deleted_by,
      is_delete,
      // Remove fields from JOIN with componen_products
      cp_code_unique,
      cp_componen_product_name,
      cp_segment,
      cp_msi_model,
      cp_msi_product,
      cp_wheel_no,
      cp_engine,
      cp_volume,
      cp_horse_power,
      cp_market_price,
      ...rest
    } = spec;
    return rest;
  });

  // Create items
  if (itemsForInsert.length > 0) {
    await createItems(newQuotation.manage_quotation_id, itemsForInsert, created_by, trx);
  }

  // Create accessories
  if (accessoriesForInsert.length > 0) {
    await createAccessories(newQuotation.manage_quotation_id, accessoriesForInsert, created_by, trx);
  }

  // Create specifications
  if (specificationsForInsert.length > 0) {
    await createSpecifications(newQuotation.manage_quotation_id, specificationsForInsert, created_by, trx);
  }

  return newQuotation;
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
  replaceSpecifications,
  duplicateQuotation
};

