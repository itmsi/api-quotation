const db = require('../../config/database');

const TABLE_NAME = 'term_contents';
const MANAGE_QUOTATIONS_TABLE = 'manage_quotations';

const baseSelectColumns = () => (
  db
    .select(
      'term_contents.term_content_id',
      'term_contents.manage_quotation_id',
      'manage_quotations.manage_quotation_no',
      'term_contents.term_content_directory',
      'term_contents.created_by',
      'term_contents.updated_by',
      'term_contents.deleted_by',
      'term_contents.created_at',
      'term_contents.updated_at',
      'term_contents.deleted_at',
      'term_contents.is_delete'
    )
    .from({ term_contents: TABLE_NAME })
    .leftJoin(
      { manage_quotations: MANAGE_QUOTATIONS_TABLE },
      'term_contents.manage_quotation_id',
      'manage_quotations.manage_quotation_id'
    )
);

const findAll = async (params) => {
  const { page, limit, offset, search, sortBy, sortOrder } = params;

  const sortOrderSafe = ['asc', 'desc'].includes((sortOrder || '').toLowerCase())
    ? sortOrder
    : 'desc';
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);
  const offsetNumber = Math.max(parseInt(offset, 10) || 0, 0);

  let query = baseSelectColumns().where('term_contents.is_delete', false);

  if (search && search.trim() !== '') {
    const searchPattern = `%${search.toLowerCase()}%`;
    query = query.andWhere((builder) => {
      builder
        .whereRaw('LOWER(manage_quotations.manage_quotation_no) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(term_contents.term_content_directory) LIKE ?', [searchPattern]);
    });
  }

  query = query
    .orderBy(sortBy, sortOrderSafe)
    .limit(limitNumber)
    .offset(offsetNumber);

  const data = await query;

  let countQuery = db({ term_contents: TABLE_NAME })
    .leftJoin(
      { manage_quotations: MANAGE_QUOTATIONS_TABLE },
      'term_contents.manage_quotation_id',
      'manage_quotations.manage_quotation_id'
    )
    .where('term_contents.is_delete', false)
    .count({ count: 'term_contents.term_content_id' });

  if (search && search.trim() !== '') {
    const searchPattern = `%${search.toLowerCase()}%`;
    countQuery = countQuery.andWhere((builder) => {
      builder
        .whereRaw('LOWER(manage_quotations.manage_quotation_no) LIKE ?', [searchPattern])
        .orWhereRaw('LOWER(term_contents.term_content_directory) LIKE ?', [searchPattern]);
    });
  }

  const totalResult = await countQuery;
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

const findManageQuotationByNo = async (manageQuotationNo) => {
  if (!manageQuotationNo) {
    return null;
  }

  const result = await db(MANAGE_QUOTATIONS_TABLE)
    .select('manage_quotation_id', 'manage_quotation_no')
    .where({ manage_quotation_no: manageQuotationNo, is_delete: false })
    .first();

  return result || null;
};

const create = async (data) => {
  const insertData = {
    term_content_id: data.term_content_id,
    manage_quotation_id: data.manage_quotation_id,
    term_content_directory: data.term_content_directory,
    created_by: data.created_by || null
  };

  const [result] = await db(TABLE_NAME)
    .insert(insertData)
    .returning('*');

  return result;
};

const update = async (id, data) => {
  const updateFields = {};

  if (data.manage_quotation_id !== undefined) {
    updateFields.manage_quotation_id = data.manage_quotation_id;
  }
  if (data.term_content_directory !== undefined) {
    updateFields.term_content_directory = data.term_content_directory;
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
  findManageQuotationByNo,
  create,
  update,
  remove
};


