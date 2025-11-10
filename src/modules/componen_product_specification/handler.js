const repository = require('./postgre_repository');
const { baseResponse, mappingError, mappingSuccess } = require('../../utils');
const { decodeToken } = require('../../utils/auth');

/**
 * Map sort_by from API to database columns
 */
const mapSortBy = (sortBy) => {
  const mapping = {
    created_at: 'created_at',
    componen_product_specification_label: 'componen_product_specification_label',
    componen_product_specification_value: 'componen_product_specification_value'
  };

  return mapping[sortBy] || 'created_at';
};

/**
 * Get all componen product specifications with pagination, search, and sort
 */
const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sort_by = 'created_at',
      sort_order = 'desc',
      componen_product_id = null
    } = req.body;

    const params = {
      page,
      limit,
      offset: (page - 1) * limit,
      search,
      sortBy: mapSortBy(sort_by),
      sortOrder: sort_order,
      componen_product_id
    };

    const data = await repository.findAll(params);
    const response = mappingSuccess(
      'Data componen product specification berhasil diambil',
      data
    );
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Get single componen product specification by ID
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await repository.findById(id);

    if (!data) {
      const response = mappingError('Data componen product specification tidak ditemukan', 404);
      return baseResponse(res, response);
    }

    const response = mappingSuccess(
      'Data componen product specification berhasil diambil',
      data
    );
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Create new componen product specification
 */
const create = async (req, res) => {
  try {
    const tokenData = decodeToken('created', req);

    const payload = {
      componen_product_id: req.body.componen_product_id || null,
      componen_product_specification_label: req.body.componen_product_specification_label || null,
      componen_product_specification_value: req.body.componen_product_specification_value || null,
      componen_product_specification_description: req.body.componen_product_specification_description || null,
      created_by: tokenData.created_by
    };

    const data = await repository.create(payload);
    const response = mappingSuccess(
      'Data componen product specification berhasil dibuat',
      data,
      201
    );
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Update existing componen product specification
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const tokenData = decodeToken('updated', req);

    const existing = await repository.findById(id);
    if (!existing) {
      const response = mappingError('Data componen product specification tidak ditemukan', 404);
      return baseResponse(res, response);
    }

    const payload = {
      componen_product_id: req.body.componen_product_id,
      componen_product_specification_label: req.body.componen_product_specification_label,
      componen_product_specification_value: req.body.componen_product_specification_value,
      componen_product_specification_description: req.body.componen_product_specification_description,
      updated_by: tokenData.updated_by
    };

    const data = await repository.update(id, payload);

    if (!data) {
      const response = mappingError('Data componen product specification tidak ditemukan', 404);
      return baseResponse(res, response);
    }

    const response = mappingSuccess(
      'Data componen product specification berhasil diupdate',
      data
    );
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Soft delete componen product specification
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const tokenData = decodeToken('deleted', req);

    const result = await repository.remove(id, {
      deleted_by: tokenData.deleted_by
    });

    if (!result) {
      const response = mappingError('Data componen product specification tidak ditemukan', 404);
      return baseResponse(res, response);
    }

    const response = mappingSuccess(
      'Data componen product specification berhasil dihapus',
      result
    );
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


