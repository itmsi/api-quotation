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
 * Find all manage quotations with pagination, search, and sort
 */
const findAll = async (params) => {
  const { page, limit, offset, search, sortBy, sortOrder, status, islandId, quotationFor } = params;

  // Try to ensure dblink connection, but don't fail if it doesn't work
  const dblinkConnected = await ensureDblinkConnection();

  // If dblink connection fails, we'll query without joins and handle data enrichment later
  let customerJoin, employeeJoin, islandJoin, updaterJoin;

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

    updaterJoin = db.raw(
      `dblink('${DBLINK_NAME}', 'SELECT employee_id, employee_name FROM employees WHERE employee_id IS NOT NULL AND is_delete = false') AS updater_data(employee_id uuid, employee_name varchar)`
    );
  } else {
    // Create dummy joins that return empty results if dblink is not available
    customerJoin = db.raw(`(SELECT NULL::uuid as customer_id, NULL::varchar as customer_name, NULL::varchar as contact_person WHERE false) AS customer_data(customer_id uuid, customer_name varchar, contact_person varchar)`);
    employeeJoin = db.raw(`(SELECT NULL::uuid as employee_id, NULL::varchar as employee_name WHERE false) AS employee_data(employee_id uuid, employee_name varchar)`);
    islandJoin = db.raw(`(SELECT NULL::uuid as island_id, NULL::varchar as island_name WHERE false) AS island_data(island_id uuid, island_name varchar)`);
    updaterJoin = db.raw(`(SELECT NULL::uuid as employee_id, NULL::varchar as employee_name WHERE false) AS updater_data(employee_id uuid, employee_name varchar)`);
  }

  // Query data - use parameterized query with knex
  let query = db({ mq: TABLE_NAME })
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
      'mq.manage_quotation_grand_total_before',
      'mq.manage_quotation_mutation_type',
      'mq.manage_quotation_mutation_nominal',
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
      'mq.company',
      'mq.project_id',
      'mq.quotation_for',
      'mq.star',
      'mq.created_by',
      'mq.updated_by',
      db.raw('updater_data.employee_name as updated_by_name'),
      'mq.deleted_by',
      'mq.created_at',
      'mq.updated_at',
      'mq.deleted_at',
      'mq.is_delete'
    )
    .leftJoin(customerJoin, 'mq.customer_id', 'customer_data.customer_id')
    .leftJoin(employeeJoin, 'mq.employee_id', 'employee_data.employee_id')
    .leftJoin(islandJoin, 'mq.island_id', 'island_data.island_id')
    .leftJoin(updaterJoin, 'mq.updated_by', 'updater_data.employee_id')
    .where('mq.is_delete', false);

  // Add search condition
  if (search && search.trim() !== '') {
    const searchLower = `%${search.toLowerCase()}%`;
    query = query.where(function () {
      this.where('mq.manage_quotation_no', 'ILIKE', searchLower)
        .orWhere(db.raw('LOWER(CAST(mq.customer_id AS TEXT))'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(CAST(mq.employee_id AS TEXT))'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(CAST(mq.island_id AS TEXT))'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(customer_data.customer_name)'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(employee_data.employee_name)'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(island_data.island_name)'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(updater_data.employee_name)'), 'LIKE', searchLower);
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

  // Add quotation_for filter condition
  if (quotationFor && quotationFor.trim() !== '') {
    query = query.where('mq.quotation_for', quotationFor.trim());
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
        updaterJoin = db.raw(
          `dblink('${DBLINK_NAME}', 'SELECT employee_id, employee_name FROM employees WHERE employee_id IS NOT NULL AND is_delete = false') AS updater_data(employee_id uuid, employee_name varchar)`
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
              'mq.manage_quotation_grand_total_before',
              'mq.manage_quotation_mutation_type',
              'mq.manage_quotation_mutation_nominal',
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
              db.raw('updater_data.employee_name as updated_by_name'),
              'mq.deleted_by',
              'mq.created_at',
              'mq.updated_at',
              'mq.deleted_at',
              'mq.is_delete'
            )
            .leftJoin(customerJoin, 'mq.customer_id', 'customer_data.customer_id')
            .leftJoin(employeeJoin, 'mq.employee_id', 'employee_data.employee_id')
            .leftJoin(islandJoin, 'mq.island_id', 'island_data.island_id')
            .leftJoin(updaterJoin, 'mq.updated_by', 'updater_data.employee_id')
            .where('mq.is_delete', false);

          // Reapply filters
          if (search && search.trim() !== '') {
            const searchLower = `%${search.toLowerCase()}%`;
            query = query.where(function () {
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
            island_name: null,
            updated_by_name: null
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
          island_name: null,
          updated_by_name: null
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
    .leftJoin(updaterJoin, 'mq.updated_by', 'updater_data.employee_id')
    .where('mq.is_delete', false);

  if (search && search.trim() !== '') {
    const searchLower = `%${search.toLowerCase()}%`;
    countQuery = countQuery.where(function () {
      this.where('mq.manage_quotation_no', 'ILIKE', searchLower)
        .orWhere(db.raw('LOWER(CAST(mq.customer_id AS TEXT))'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(CAST(mq.employee_id AS TEXT))'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(CAST(mq.island_id AS TEXT))'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(customer_data.customer_name)'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(employee_data.employee_name)'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(island_data.island_name)'), 'LIKE', searchLower)
        .orWhere(db.raw('LOWER(updater_data.employee_name)'), 'LIKE', searchLower);
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

  // Fetch external data for properties
  let customerData = {};
  let employeeData = {};
  let islandData = {};

  try {
    const dblinkConnected = await ensureDblinkConnection();

    if (dblinkConnected) {
      // Fetch customer
      if (data.customer_id) {
        const customerQuery = `SELECT customer_name, customer_email, customer_phone, customer_address, contact_person FROM customers WHERE customer_id = ''${data.customer_id}''`;
        const customerRes = await db.raw(`SELECT * FROM dblink('${DBLINK_NAME}', '${customerQuery}') AS t(customer_name varchar, customer_email varchar, customer_phone varchar, customer_address text, contact_person varchar)`);
        if (customerRes.rows.length > 0) customerData = customerRes.rows[0];
      }

      // Fetch employee
      if (data.employee_id) {
        const employeeQuery = `SELECT employee_name, employee_phone FROM employees WHERE employee_id = ''${data.employee_id}''`;
        const employeeRes = await db.raw(`SELECT * FROM dblink('${DBLINK_NAME}', '${employeeQuery}') AS t(employee_name varchar, employee_phone varchar)`);
        if (employeeRes.rows.length > 0) employeeData = employeeRes.rows[0];
      }

      // Fetch island
      if (data.island_id) {
        const islandQuery = `SELECT island_name FROM islands WHERE island_id = ''${data.island_id}''`;
        const islandRes = await db.raw(`SELECT * FROM dblink('${DBLINK_NAME}', '${islandQuery}') AS t(island_name varchar)`);
        if (islandRes.rows.length > 0) islandData = islandRes.rows[0];
      }
    }
  } catch (err) {
    console.error('[manage-quotation:create] Failed to fetch external data via dblink for properties', err);
  }

  // Construct properties JSONB object
  const properties = {
    customer_id: data.customer_id || null,
    customer_name: customerData.customer_name || null,
    customer_email: customerData.customer_email || null,
    customer_phone: customerData.customer_phone || null,
    customer_address: customerData.customer_address || null,
    contact_person: customerData.contact_person || null,
    employee_id: data.employee_id || null,
    employee_name: employeeData.employee_name || null,
    employee_phone: employeeData.employee_phone || null,
    island_id: data.island_id || null,
    island_name: islandData.island_name || null,
    bank_account_id: data.bank_account_id || null,
    bank_account_name: data.bank_account_name || null,
    bank_account_number: data.bank_account_number || null,
    bank_account_bank_name: data.bank_account_bank_name || null,
    term_content_id: data.term_content_id || null,
    term_content_directory: data.term_content_directory || null
  };

  // Build fields object - include all expected fields
  const fields = {
    manage_quotation_no: quotationNumber,
    customer_id: data.customer_id || null,
    employee_id: data.employee_id || null,
    manage_quotation_date: data.manage_quotation_date || null,
    manage_quotation_valid_date: data.manage_quotation_valid_date || null,
    manage_quotation_grand_total: data.manage_quotation_grand_total !== undefined ? data.manage_quotation_grand_total : null,
    manage_quotation_grand_total_before: data.manage_quotation_grand_total_before !== undefined ? data.manage_quotation_grand_total_before : null,
    manage_quotation_mutation_type: data.manage_quotation_mutation_type || null,
    manage_quotation_mutation_nominal: data.manage_quotation_mutation_nominal !== undefined ? data.manage_quotation_mutation_nominal : null,
    manage_quotation_ppn: data.manage_quotation_ppn || null,
    manage_quotation_delivery_fee: data.manage_quotation_delivery_fee || null,
    manage_quotation_other: data.manage_quotation_other || null,
    manage_quotation_payment_presentase: data.manage_quotation_payment_presentase || null,
    manage_quotation_payment_nominal: data.manage_quotation_payment_nominal || null,
    manage_quotation_description: data.manage_quotation_description || null,
    manage_quotation_shipping_term: data.manage_quotation_shipping_term || null,
    manage_quotation_franco: data.manage_quotation_franco || null,
    manage_quotation_lead_time: data.manage_quotation_lead_time || null,
    bank_account_id: data.bank_account_id || null,
    bank_account_name: data.bank_account_name || null,
    bank_account_number: data.bank_account_number || null,
    bank_account_bank_name: data.bank_account_bank_name || null,
    term_content_id: data.term_content_id || null,
    term_content_directory: null,
    properties: JSON.stringify(properties),
    status: data.status || 'submit',
    include_aftersales_page: data.include_aftersales_page ?? false,
    include_msf_page: data.include_msf_page ?? false,
    island_id: data.island_id || null,
    company: data.company || null,
    project_id: data.project_id || null,
    quotation_for: data.quotation_for || null,
    star: data.star !== undefined ? (data.star !== null && data.star !== '' ? String(data.star) : '0') : '0',
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

  // Get existing record to access current IDs if not provided in update data
  const existingRecord = await findById(id);
  if (!existingRecord) return null;

  // Determine effective IDs (newly updated or existing)
  const effectiveCustomerId = data.customer_id !== undefined ? data.customer_id : existingRecord.customer_id;
  const effectiveEmployeeId = data.employee_id !== undefined ? data.employee_id : existingRecord.employee_id;
  const effectiveIslandId = data.island_id !== undefined ? data.island_id : existingRecord.island_id;

  // Fetch external data for properties if any change might affect them
  let customerData = {};
  let employeeData = {};
  let islandData = {};

  // Parse existing properties or default to empty object
  let existingProperties = existingRecord.properties || {};
  if (typeof existingProperties === 'string') {
    try {
      existingProperties = JSON.parse(existingProperties);
    } catch (e) {
      existingProperties = {};
    }
  }

  try {
    const dblinkConnected = await ensureDblinkConnection();

    if (dblinkConnected) {
      // Fetch customer if ID is present
      if (effectiveCustomerId) {
        const customerQuery = `SELECT customer_name, customer_email, customer_phone, customer_address, contact_person FROM customers WHERE customer_id = ''${effectiveCustomerId}''`;
        const customerRes = await db.raw(`SELECT * FROM dblink('${DBLINK_NAME}', '${customerQuery}') AS t(customer_name varchar, customer_email varchar, customer_phone varchar, customer_address text, contact_person varchar)`);
        if (customerRes.rows.length > 0) customerData = customerRes.rows[0];
      }

      // Fetch employee if ID is present
      if (effectiveEmployeeId) {
        const employeeQuery = `SELECT employee_name, employee_phone FROM employees WHERE employee_id = ''${effectiveEmployeeId}''`;
        const employeeRes = await db.raw(`SELECT * FROM dblink('${DBLINK_NAME}', '${employeeQuery}') AS t(employee_name varchar, employee_phone varchar)`);
        if (employeeRes.rows.length > 0) employeeData = employeeRes.rows[0];
      }

      // Fetch island if ID is present
      if (effectiveIslandId) {
        const islandQuery = `SELECT island_name FROM islands WHERE island_id = ''${effectiveIslandId}''`;
        const islandRes = await db.raw(`SELECT * FROM dblink('${DBLINK_NAME}', '${islandQuery}') AS t(island_name varchar)`);
        if (islandRes.rows.length > 0) islandData = islandRes.rows[0];
      }
    }
  } catch (err) {
    console.error('[manage-quotation:update] Failed to fetch external data via dblink for properties', err);
    // If dblink fails, try to use existing properties for fallback data if IDs haven't changed
    if (effectiveCustomerId === existingRecord.customer_id) {
      customerData = {
        customer_name: existingProperties.customer_name,
        customer_email: existingProperties.customer_email,
        customer_phone: existingProperties.customer_phone,
        customer_address: existingProperties.customer_address,
        contact_person: existingProperties.contact_person
      };
    }
    if (effectiveEmployeeId === existingRecord.employee_id) {
      employeeData = {
        employee_name: existingProperties.employee_name,
        employee_phone: existingProperties.employee_phone
      };
    }
    if (effectiveIslandId === existingRecord.island_id) {
      islandData = {
        island_name: existingProperties.island_name
      };
    }
  }

  // Determine values for other property fields
  const effectiveBankAccountName = data.bank_account_name !== undefined ? data.bank_account_name : existingRecord.bank_account_name;
  const effectiveBankAccountNumber = data.bank_account_number !== undefined ? data.bank_account_number : existingRecord.bank_account_number;
  const effectiveBankAccountBankName = data.bank_account_bank_name !== undefined ? data.bank_account_bank_name : existingRecord.bank_account_bank_name;
  const effectiveBankAccountId = data.bank_account_id !== undefined ? data.bank_account_id : existingRecord.bank_account_id;
  const effectiveTermContentId = data.term_content_id !== undefined ? data.term_content_id : existingRecord.term_content_id;

  // For term_content_directory (HTML content), prefer update data, else use what we had (but we only store content in properties if passed explicitly in data)
  // If data.term_content_directory is passed (even if path), it might be used here. 
  // However, usually Handler passes the path here after writing file.
  // BUT the requirement said: "term_content_directory ambil dari body request (ini bisa berisi halaman html jadi sesuaiakan formatnya)"
  // So if handler passes the original content in a separate field or if we use valid data.
  // In Handler update, we are setting `quotationData.term_content_directory` to the new path (string) OR null.
  // The original HTML content is in `req.body.term_content_directory` before handler processes it.
  // Determine effective term_content_directory for properties
  // Use properties_term_content_directory if provided (original content from handler),
  // otherwise use term_content_directory (which might be path) or existing.
  let effectiveTermContentDirectory = data.properties_term_content_directory;
  if (effectiveTermContentDirectory === undefined) {
    effectiveTermContentDirectory = data.term_content_directory !== undefined ? data.term_content_directory : existingRecord.term_content_directory;
  }

  // Construct properties JSONB object
  const properties = {
    customer_id: effectiveCustomerId || null,
    customer_name: customerData.customer_name || null,
    customer_email: customerData.customer_email || null,
    customer_phone: customerData.customer_phone || null,
    customer_address: customerData.customer_address || null,
    contact_person: customerData.contact_person || null,
    employee_id: effectiveEmployeeId || null,
    employee_name: employeeData.employee_name || null,
    employee_phone: employeeData.employee_phone || null,
    island_id: effectiveIslandId || null,
    island_name: islandData.island_name || null,
    bank_account_id: effectiveBankAccountId || null,
    bank_account_name: effectiveBankAccountName || null,
    bank_account_number: effectiveBankAccountNumber || null,
    bank_account_bank_name: effectiveBankAccountBankName || null,
    term_content_id: effectiveTermContentId || null,
    term_content_directory: effectiveTermContentDirectory || null
  };

  const updateFields = {};
  if (data.manage_quotation_no !== undefined) updateFields.manage_quotation_no = data.manage_quotation_no;
  if (data.customer_id !== undefined) updateFields.customer_id = data.customer_id;
  if (data.employee_id !== undefined) updateFields.employee_id = data.employee_id;
  if (data.manage_quotation_date !== undefined) updateFields.manage_quotation_date = data.manage_quotation_date;
  if (data.manage_quotation_valid_date !== undefined) updateFields.manage_quotation_valid_date = data.manage_quotation_valid_date;
  if (data.manage_quotation_grand_total !== undefined) updateFields.manage_quotation_grand_total = data.manage_quotation_grand_total;
  if (data.manage_quotation_grand_total_before !== undefined) updateFields.manage_quotation_grand_total_before = data.manage_quotation_grand_total_before;
  if (data.manage_quotation_mutation_type !== undefined) updateFields.manage_quotation_mutation_type = data.manage_quotation_mutation_type || null;
  if (data.manage_quotation_mutation_nominal !== undefined) updateFields.manage_quotation_mutation_nominal = data.manage_quotation_mutation_nominal;
  if (data.manage_quotation_ppn !== undefined) updateFields.manage_quotation_ppn = data.manage_quotation_ppn;
  if (data.manage_quotation_delivery_fee !== undefined) updateFields.manage_quotation_delivery_fee = data.manage_quotation_delivery_fee;
  if (data.manage_quotation_other !== undefined) updateFields.manage_quotation_other = data.manage_quotation_other;
  if (data.manage_quotation_payment_presentase !== undefined) updateFields.manage_quotation_payment_presentase = data.manage_quotation_payment_presentase;
  if (data.manage_quotation_payment_nominal !== undefined) updateFields.manage_quotation_payment_nominal = data.manage_quotation_payment_nominal;
  if (data.manage_quotation_description !== undefined) updateFields.manage_quotation_description = data.manage_quotation_description;
  if (data.manage_quotation_shipping_term !== undefined) updateFields.manage_quotation_shipping_term = data.manage_quotation_shipping_term;
  if (data.manage_quotation_franco !== undefined) updateFields.manage_quotation_franco = data.manage_quotation_franco;
  if (data.manage_quotation_lead_time !== undefined) updateFields.manage_quotation_lead_time = data.manage_quotation_lead_time;
  if (data.bank_account_id !== undefined) updateFields.bank_account_id = data.bank_account_id;
  if (data.bank_account_name !== undefined) updateFields.bank_account_name = data.bank_account_name;
  if (data.bank_account_number !== undefined) updateFields.bank_account_number = data.bank_account_number;
  if (data.bank_account_bank_name !== undefined) updateFields.bank_account_bank_name = data.bank_account_bank_name;
  if (data.term_content_id !== undefined) updateFields.term_content_id = data.term_content_id;
  if (data.term_content_directory !== undefined) updateFields.term_content_directory = data.term_content_directory;
  if (data.include_aftersales_page !== undefined) updateFields.include_aftersales_page = data.include_aftersales_page;
  if (data.include_msf_page !== undefined) updateFields.include_msf_page = data.include_msf_page;
  if (data.status !== undefined) updateFields.status = data.status;
  if (data.island_id !== undefined) updateFields.island_id = data.island_id;
  if (data.company !== undefined) updateFields.company = data.company;
  if (data.project_id !== undefined) updateFields.project_id = data.project_id;
  if (data.quotation_for !== undefined) updateFields.quotation_for = data.quotation_for;
  if (data.star !== undefined) updateFields.star = data.star !== null && data.star !== '' ? String(data.star) : '0';
  if (data.updated_by !== undefined) updateFields.updated_by = data.updated_by;
  if (data.deleted_by !== undefined) updateFields.deleted_by = data.deleted_by;

  // Always update properties
  updateFields.properties = JSON.stringify(properties);

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
      description: item.description ?? null,
      order_number: orderNumber,
      specification_properties: item.specification_properties
        ? JSON.stringify(Array.isArray(item.specification_properties)
          ? item.specification_properties.map(p => ({ ...p, manage_quotation_id: manage_quotation_id || null }))
          : item.specification_properties)
        : '{}',
      accesories_properties: item.accesories_properties
        ? JSON.stringify(Array.isArray(item.accesories_properties)
          ? item.accesories_properties.map(p => ({ ...p, manage_quotation_id: manage_quotation_id || null }))
          : item.accesories_properties)
        : '{}',
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
    .leftJoin('componen_products as cp', function () {
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
    .where({ manage_quotation_id: manage_quotation_id })
    .del();

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
 * Get multiple accessories by IDs
 */
const getAccessoriesByIds = async (ids) => {
  if (!ids || ids.length === 0) {
    return [];
  }

  const result = await db('accessories')
    .whereIn('accessory_id', ids)
    .where('is_delete', false);

  return result;
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
    .leftJoin('accessories as a', function () {
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
    .where({ manage_quotation_id: manage_quotation_id })
    .del();

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
    .leftJoin('componen_products as cp', function () {
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
    .where({ manage_quotation_id: manage_quotation_id })
    .del();

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

  // Prepare new quotation data
  const newQuotationData = {
    manage_quotation_no: newQuotationNo,
    customer_id: sourceQuotation.customer_id,
    employee_id: sourceQuotation.employee_id,
    island_id: sourceQuotation.island_id,
    manage_quotation_date: sourceQuotation.manage_quotation_date,
    manage_quotation_valid_date: sourceQuotation.manage_quotation_valid_date,
    manage_quotation_grand_total: sourceQuotation.manage_quotation_grand_total,
    manage_quotation_grand_total_before: sourceQuotation.manage_quotation_grand_total_before,
    manage_quotation_mutation_type: sourceQuotation.manage_quotation_mutation_type,
    manage_quotation_mutation_nominal: sourceQuotation.manage_quotation_mutation_nominal,
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
  getAccessoriesByIds,
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

