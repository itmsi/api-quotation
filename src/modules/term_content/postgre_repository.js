const db = require('../../config/database');

const TABLE_NAME = 'term_contents';

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
        console.error(`[term-content:ensureDblinkConnection] Failed after ${maxRetries} attempts:`, error.message);
        return false; // Connection failed after all retries
      }
      // Wait a bit before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 100 * attempt));
    }
  }
  return false;
};

const baseSelectColumns = () => (
  db
    .select(
      'term_contents.term_content_id',
      'term_contents.term_content_title',
      'term_contents.term_content_directory',
      'term_contents.term_content_payload',
      'term_contents.created_by',
      'term_contents.updated_by',
      'term_contents.deleted_by',
      'term_contents.created_at',
      'term_contents.updated_at',
      'term_contents.deleted_at',
      'term_contents.is_delete'
    )
    .from({ term_contents: TABLE_NAME })
);

const findAll = async (params) => {
  const { page, limit, offset, search, sortBy, sortOrder } = params;

  const sortOrderSafe = ['asc', 'desc'].includes((sortOrder || '').toLowerCase())
    ? sortOrder
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

  let query = db({ term_contents: TABLE_NAME })
    .select(
      'term_contents.term_content_id',
      'term_contents.term_content_title',
      'term_contents.term_content_directory',
      'term_contents.term_content_payload',
      'term_contents.created_by',
      'term_contents.updated_by',
      db.raw('updater_data.employee_name as updated_by_name'),
      'term_contents.deleted_by',
      'term_contents.created_at',
      'term_contents.updated_at',
      'term_contents.deleted_at',
      'term_contents.is_delete'
    )
    .leftJoin(updaterJoin, 'term_contents.updated_by', 'updater_data.employee_id')
    .where('term_contents.is_delete', false);

  if (search && search.trim() !== '') {
    const searchPattern = `%${search.toLowerCase()}%`;
    query = query.andWhere((builder) => {
      builder
        .whereRaw('LOWER(term_contents.term_content_title) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(term_contents.term_content_directory) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(updater_data.employee_name) LIKE ?', [searchPattern]);
    });
  }

  query = query
    .orderBy(sortBy, sortOrderSafe)
    .limit(limitNumber)
    .offset(offsetNumber);

  let data;
  try {
    data = await query;
  } catch (error) {
    // Retry logic if dblink fails
    if (error.message && (error.message.includes('could not establish connection') || error.message.includes('dblink'))) {
      console.error('[term-content:findAll] Query failed due to dblink error, retrying...', error.message);
      const reconnected = await ensureDblinkConnection();

      if (reconnected) {
        updaterJoin = db.raw(
          `dblink('${DBLINK_NAME}', 'SELECT employee_id, employee_name FROM employees WHERE employee_id IS NOT NULL AND is_delete = false') AS updater_data(employee_id uuid, employee_name varchar)`
        );

        try {
          query = db({ term_contents: TABLE_NAME })
            .select(
              'term_contents.term_content_id',
              'term_contents.term_content_title',
              'term_contents.term_content_directory',
              'term_contents.term_content_payload',
              'term_contents.created_by',
              'term_contents.updated_by',
              db.raw('updater_data.employee_name as updated_by_name'),
              'term_contents.deleted_by',
              'term_contents.created_at',
              'term_contents.updated_at',
              'term_contents.deleted_at',
              'term_contents.is_delete'
            )
            .leftJoin(updaterJoin, 'term_contents.updated_by', 'updater_data.employee_id')
            .where('term_contents.is_delete', false);

          if (search && search.trim() !== '') {
            const searchPattern = `%${search.toLowerCase()}%`;
            query = query.andWhere((builder) => {
              builder
                .whereRaw('LOWER(term_contents.term_content_title) LIKE ?', [searchPattern])
                .orWhereRaw('LOWER(term_contents.term_content_directory) LIKE ?', [searchPattern])
                .orWhereRaw('LOWER(updater_data.employee_name) LIKE ?', [searchPattern]);
            });
          }

          query = query.orderBy(sortBy, sortOrderSafe).limit(limitNumber).offset(offsetNumber);
          data = await query;
        } catch (retryError) {
          // Fallback without dblink
          query = baseSelectColumns().where('term_contents.is_delete', false);
          if (search && search.trim() !== '') {
            const searchPattern = `%${search.toLowerCase()}%`;
            query = query.andWhere((builder) => {
              builder
                .whereRaw('LOWER(term_contents.term_content_title) LIKE ?', [searchPattern])
                .orWhereRaw('LOWER(term_contents.term_content_directory) LIKE ?', [searchPattern]);
            });
          }
          query = query.orderBy(sortBy, sortOrderSafe).limit(limitNumber).offset(offsetNumber);
          data = await query;
          data = data.map(item => ({ ...item, updated_by_name: null }));
        }
      } else {
        // Fallback without dblink
        query = baseSelectColumns().where('term_contents.is_delete', false);
        if (search && search.trim() !== '') {
          const searchPattern = `%${search.toLowerCase()}%`;
          query = query.andWhere((builder) => {
            builder
              .whereRaw('LOWER(term_contents.term_content_title) LIKE ?', [searchPattern])
              .orWhereRaw('LOWER(term_contents.term_content_directory) LIKE ?', [searchPattern]);
          });
        }
        query = query.orderBy(sortBy, sortOrderSafe).limit(limitNumber).offset(offsetNumber);
        data = await query;
        data = data.map(item => ({ ...item, updated_by_name: null }));
      }
    } else {
      throw error;
    }
  }

  let countQuery = db({ term_contents: TABLE_NAME })
    .leftJoin(updaterJoin, 'term_contents.updated_by', 'updater_data.employee_id')
    .where('term_contents.is_delete', false)
    .count({ count: 'term_contents.term_content_id' });

  if (search && search.trim() !== '') {
    const searchPattern = `%${search.toLowerCase()}%`;
    countQuery = countQuery.andWhere((builder) => {
      builder
        .whereRaw('LOWER(term_contents.term_content_title) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(term_contents.term_content_directory) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(updater_data.employee_name) LIKE ?', [searchPattern]);
    });
  }

  let totalResult;
  try {
    totalResult = await countQuery;
  } catch (error) {
    // Retry count query without dblink if needed
    if (error.message && (error.message.includes('could not establish connection') || error.message.includes('dblink'))) {
      countQuery = db({ term_contents: TABLE_NAME })
        .where('term_contents.is_delete', false)
        .count({ count: 'term_contents.term_content_id' });

      if (search && search.trim() !== '') {
        const searchPattern = `%${search.toLowerCase()}%`;
        countQuery = countQuery.andWhere((builder) => {
          builder
            .whereRaw('LOWER(term_contents.term_content_title) LIKE ?', [searchPattern])
            .orWhereRaw('LOWER(term_contents.term_content_directory) LIKE ?', [searchPattern]);
        });
      }
      totalResult = await countQuery;
    } else {
      throw error;
    }
  }

  const total = parseInt(totalResult[0]?.count || 0, 10);

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

const findById = async (id) => {
  const result = await baseSelectColumns()
    .where('term_contents.term_content_id', id)
    .andWhere('term_contents.is_delete', false)
    .first();

  return result || null;
};

const create = async (data) => {
  const insertData = {
    term_content_id: data.term_content_id,
    term_content_title: data.term_content_title || null,
    term_content_directory: data.term_content_directory,
    term_content_payload: data.term_content_payload,
    created_by: data.created_by || null
  };

  const [result] = await db(TABLE_NAME)
    .insert(insertData)
    .returning('*');

  return result;
};

const update = async (id, data) => {
  const updateFields = {};

  if (data.term_content_title !== undefined) {
    updateFields.term_content_title = data.term_content_title;
  }
  if (data.term_content_directory !== undefined) {
    updateFields.term_content_directory = data.term_content_directory;
  }
  if (data.term_content_payload !== undefined) {
    updateFields.term_content_payload = data.term_content_payload;
  }
  if (data.updated_by !== undefined) {
    updateFields.updated_by = data.updated_by;
  }

  if (Object.keys(updateFields).length === 0) {
    return null;
  }

  const [result] = await db(TABLE_NAME)
    .where({ term_content_id: id, is_delete: false })
    .update({
      ...updateFields,
      updated_at: db.fn.now()
    })
    .returning('*');

  return result || null;
};

const remove = async (id, data = {}) => {
  const deleteFields = {
    is_delete: true,
    deleted_at: db.fn.now()
  };

  if (data.deleted_by !== undefined) {
    deleteFields.deleted_by = data.deleted_by;
  }

  const [result] = await db(TABLE_NAME)
    .where({ term_content_id: id, is_delete: false })
    .update(deleteFields)
    .returning('*');

  return result || null;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};


