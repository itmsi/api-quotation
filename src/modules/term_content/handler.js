const { v4: uuidv4 } = require('uuid');
const repository = require('./postgre_repository');
const { baseResponse, mappingError, mappingSuccess } = require('../../utils');
const { decodeToken } = require('../../utils/auth');



const normalizeJsonPayload = (payload) => {
  if (payload === null || payload === undefined) {
    return {};
  }

  if (typeof payload === 'object') {
    return payload;
  }

  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    if (!trimmed) {
      return {};
    }

    try {
      return JSON.parse(trimmed);
    } catch (error) {
      return trimmed;
    }
  }

  return payload;
};



const mapSortBy = (sortBy) => {
  const mapping = {
    created_at: 'term_contents.created_at',
    term_content_title: 'term_contents.term_content_title'
  };
  return mapping[sortBy] || 'term_contents.created_at';
};

const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      company_name = '',
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.body;

    const offset = (page - 1) * limit;

    const params = {
      page,
      limit,
      offset,
      search,
      company_name,
      sortBy: mapSortBy(sort_by),
      sortOrder: sort_order
    };

    const data = await repository.findAll(params);
    const response = mappingSuccess('Data berhasil diambil', data);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await repository.findById(id);

    if (!data) {
      const response = mappingError('Data tidak ditemukan', 404);
      return baseResponse(res, response);
    }

    // Parse stored payload if it's a string, or use it directly
    const rawPayload = data.term_content_payload;
    let parsedPayload = {};

    if (rawPayload) {
      if (typeof rawPayload === 'string') {
        try {
          parsedPayload = JSON.parse(rawPayload);
        } catch (e) {
          parsedPayload = rawPayload;
        }
      } else {
        parsedPayload = rawPayload;
      }
    }

    data.term_content_payload = parsedPayload;

    const response = mappingSuccess('Data berhasil diambil', data);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

const create = async (req, res) => {

  try {
    const tokenData = decodeToken('created', req);
    const { term_content_title, term_content_directory, company_name } = req.body;

    const termContentId = uuidv4();

    // Process payload from term_content_directory (input) to be stored in DB
    const processedPayload = normalizeJsonPayload(term_content_directory);
    const payloadString = JSON.stringify(processedPayload);

    const payload = {
      term_content_id: termContentId,
      term_content_title: term_content_title || null,
      term_content_directory: null, // No longer using file path
      term_content_payload: payloadString,
      company_name: company_name || null,
      created_by: tokenData.created_by
    };

    await repository.create(payload);
    const data = await repository.findById(termContentId);

    // Format response
    if (data && data.term_content_payload) {
      try {
        data.term_content_payload = JSON.parse(data.term_content_payload);
      } catch (e) {
        // keep as string if parse fails
      }
    }

    const response = mappingSuccess('Data berhasil dibuat', data, 201);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

const update = async (req, res) => {

  try {
    const { id } = req.params;
    const tokenData = decodeToken('updated', req);
    const { term_content_title, term_content_directory, company_name } = req.body;

    const existing = await repository.findById(id);
    if (!existing) {
      const response = mappingError('Data tidak ditemukan', 404);
      return baseResponse(res, response);
    }

    const payload = {
      term_content_title: term_content_title !== undefined ? term_content_title : existing.term_content_title,
      updated_by: tokenData.updated_by
    };

    if (company_name !== undefined) {
      payload.company_name = company_name;
    }

    if (term_content_directory !== undefined) {
      const processedPayload = normalizeJsonPayload(term_content_directory);
      payload.term_content_payload = JSON.stringify(processedPayload);
      payload.term_content_directory = null; // Ensure directory is cleared if updating content
    }

    await repository.update(id, payload);

    const data = await repository.findById(id);

    // Format response
    if (data && data.term_content_payload) {
      try {
        data.term_content_payload = JSON.parse(data.term_content_payload);
      } catch (e) {
        // keep as string
      }
    }

    const response = mappingSuccess('Data berhasil diperbarui', data);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const tokenData = decodeToken('deleted', req);

    const existing = await repository.findById(id);
    if (!existing) {
      const response = mappingError('Data tidak ditemukan', 404);
      return baseResponse(res, response);
    }

    const result = await repository.remove(id, {
      deleted_by: tokenData.deleted_by
    });

    if (!result) {
      const response = mappingError('Data tidak ditemukan', 404);
      return baseResponse(res, response);
    }

    if (!result) {
      const response = mappingError('Data tidak ditemukan', 404);
      return baseResponse(res, response);
    }

    // No file cleanup needed anymore

    const response = mappingSuccess('Data berhasil dihapus', result);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};


