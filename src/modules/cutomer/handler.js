const repository = require('./postgre_repository');
const { baseResponse, mappingError, mappingSuccess } = require('../../utils');
const { decodeToken } = require('../../utils/auth');

/**
 * Get all customers with pagination, search, and sort
 */
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sort_by = 'created_at', sort_order = 'desc' } = req.body;
    
    const offset = (page - 1) * limit;
    
    const params = {
      page,
      limit,
      offset,
      search,
      sortBy: sort_by,
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

/**
 * Get single customer by ID
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await repository.findById(id);
    
    if (!data) {
      const response = mappingError('Data tidak ditemukan', 404);
      return baseResponse(res, response);
    }
    
    const response = mappingSuccess('Data berhasil diambil', data);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Create new customer
 */
const create = async (req, res) => {
  try {
    // Get user info from token
    const tokenData = decodeToken('created', req);
    
    const customerData = {
      ...req.body,
      created_by: tokenData.created_by
    };
    
    const data = await repository.create(customerData);
    const response = mappingSuccess('Data berhasil dibuat', data, 201);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Update existing customer
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user info from token
    const tokenData = decodeToken('updated', req);
    
    const customerData = {
      ...req.body,
      updated_by: tokenData.updated_by
    };
    
    const data = await repository.update(id, customerData);
    
    if (!data) {
      const response = mappingError('Data tidak ditemukan', 404);
      return baseResponse(res, response);
    }
    
    const response = mappingSuccess('Data berhasil diupdate', data);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Soft delete customer
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user info from token
    const tokenData = decodeToken('deleted', req);
    
    // First update with deleted_by info
    await repository.update(id, {
      deleted_by: tokenData.deleted_by
    });
    
    const result = await repository.remove(id);
    
    if (!result) {
      const response = mappingError('Data tidak ditemukan', 404);
      return baseResponse(res, response);
    }
    
    const response = mappingSuccess('Data berhasil dihapus', result);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Restore soft deleted customer
 */
const restore = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await repository.restore(id);
    
    if (!data) {
      const response = mappingError('Data tidak ditemukan', 404);
      return baseResponse(res, response);
    }
    
    const response = mappingSuccess('Data berhasil direstore', data);
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
  remove,
  restore
};

