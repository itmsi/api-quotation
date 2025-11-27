const repository = require('./postgre_repository');
const accessoriesIslandDetailRepository = require('./accessories_island_detail_repository');
const { baseResponse, mappingError, mappingSuccess } = require('../../utils');
const { decodeToken } = require('../../utils/auth');

/**
 * Map sort_by from API format to database column format
 */
const mapSortBy = (sortBy) => {
  const mapping = {
    'created_at': 'created_at',
    'accessory_part_number': 'accessory_part_number',
    'accessory_part_name': 'accessory_part_name',
    'accessory_brand': 'accessory_brand'
  };
  return mapping[sortBy] || 'created_at';
};

/**
 * Get all accessories with pagination, search, and sort
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
      sortBy: mapSortBy(sort_by),
      sortOrder: sort_order
    };
    
    const data = await repository.findAll(params);
    const response = mappingSuccess('Data accessory berhasil diambil', data);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Get single accessory by ID
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await repository.findById(id);
    
    if (!data) {
      const response = mappingError('Data accessory tidak ditemukan', 404);
      return baseResponse(res, response);
    }
    
    const response = mappingSuccess('Data accessory berhasil diambil', data);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Create new accessory
 */
const create = async (req, res) => {
  try {
    // Get user info from token
    const tokenData = decodeToken('created', req);
    
    const accessoryData = {
      accessory_part_number: req.body.accessory_part_number || null,
      accessory_part_name: req.body.accessory_part_name || null,
      accessory_specification: req.body.accessory_specification || null,
      accessory_brand: req.body.accessory_brand || null,
      accessory_remark: req.body.accessory_remark || null,
      accessory_region: req.body.accessory_region || null,
      accessory_description: req.body.accessory_description || null,
      created_by: tokenData.created_by
    };
    
    const data = await repository.create(accessoryData);
    
    // Insert accessories_island_detail if provided
    if (req.body.accessories_island_detail && Array.isArray(req.body.accessories_island_detail) && req.body.accessories_island_detail.length > 0) {
      await accessoriesIslandDetailRepository.createMultiple(
        req.body.accessories_island_detail,
        data.accessory_id,
        tokenData.created_by
      );
    }
    
    // Get full data with accessories_island_detail
    const fullData = await repository.findById(data.accessory_id);
    const response = mappingSuccess('Data accessory berhasil dibuat', fullData, 201);
    return baseResponse(res, response);
  } catch (error) {
    console.error('Error creating accessory:', error);
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Update existing accessory
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user info from token
    const tokenData = decodeToken('updated', req);
    
    // Get existing data
    const existing = await repository.findById(id);
    if (!existing) {
      const response = mappingError('Data accessory tidak ditemukan', 404);
      return baseResponse(res, response);
    }
    
    const accessoryData = {
      accessory_part_number: req.body.accessory_part_number,
      accessory_part_name: req.body.accessory_part_name,
      accessory_specification: req.body.accessory_specification,
      accessory_brand: req.body.accessory_brand,
      accessory_remark: req.body.accessory_remark,
      accessory_region: req.body.accessory_region,
      accessory_description: req.body.accessory_description,
      updated_by: tokenData.updated_by
    };
    
    const data = await repository.update(id, accessoryData);
    
    if (!data) {
      const response = mappingError('Data accessory tidak ditemukan', 404);
      return baseResponse(res, response);
    }
    
    // Update accessories_island_detail if provided
    if (req.body.accessories_island_detail !== undefined) {
      if (Array.isArray(req.body.accessories_island_detail) && req.body.accessories_island_detail.length > 0) {
        await accessoriesIslandDetailRepository.updateByAccessoriesId(
          req.body.accessories_island_detail,
          id,
          tokenData.updated_by
        );
      } else {
        // If empty array, delete all existing
        await accessoriesIslandDetailRepository.deleteByAccessoriesId(id);
      }
    }
    
    // Get full data with accessories_island_detail
    const fullData = await repository.findById(id);
    const response = mappingSuccess('Data accessory berhasil diupdate', fullData);
    return baseResponse(res, response);
  } catch (error) {
    console.error('Error updating accessory:', error);
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Soft delete accessory
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user info from token
    const tokenData = decodeToken('deleted', req);
    
    const result = await repository.remove(id, {
      deleted_by: tokenData.deleted_by
    });
    
    if (!result) {
      const response = mappingError('Data accessory tidak ditemukan', 404);
      return baseResponse(res, response);
    }
    
    const response = mappingSuccess('Data accessory berhasil dihapus', result);
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

