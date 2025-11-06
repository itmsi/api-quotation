const repository = require('./postgre_repository');
const { baseResponse, mappingError, mappingSuccess } = require('../../utils');
const { decodeToken } = require('../../utils/auth');

/**
 * Map sort_by from API format to database column format
 */
const mapSortBy = (sortBy) => {
  const mapping = {
    'created_at': 'created_at',
    'manage_quotation_no': 'manage_quotation_no',
    'manage_quotation_date': 'manage_quotation_date',
    'manage_quotation_valid_date': 'manage_quotation_valid_date'
  };
  return mapping[sortBy] || sortBy;
};

/**
 * Get all manage quotations with pagination, search, and sort
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
    const response = mappingSuccess('Data berhasil diambil', data);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Get single manage quotation by ID
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await repository.findById(id);
    
    if (!data) {
      const response = mappingError('Data tidak ditemukan', 404);
      return baseResponse(res, response);
    }
    
    // Get items for this quotation
    const items = await repository.getItemsByQuotationId(id);
    data.manage_quotation_items = items;
    
    // Get accessories for this quotation
    const accessories = await repository.getAccessoriesByQuotationId(id);
    data.manage_quotation_item_accessories = accessories;
    
    const response = mappingSuccess('Data berhasil diambil', data);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Create new manage quotation
 */
const create = async (req, res) => {
  try {
    // Get user info from token
    const tokenData = decodeToken('created', req);
    
    // Extract items and accessories from request body
    // Remove manage_quotation_no from body as it will be auto-generated if status is submit
    const { manage_quotation_items, manage_quotation_item_accessories, manage_quotation_no, ...quotationData } = req.body;
    
    // Validate componen_product_id if items provided
    if (manage_quotation_items && manage_quotation_items.length > 0) {
      const validation = await repository.validateComponenProductIds(manage_quotation_items);
      if (!validation.isValid) {
        const invalidIdsList = validation.invalidIds.join(', ');
        const response = mappingError(
          `Componen product dengan ID berikut tidak ditemukan: ${invalidIdsList}`,
          400
        );
        return baseResponse(res, response);
      }
    }
    
    // Validate accessory_id if accessories provided
    if (manage_quotation_item_accessories && manage_quotation_item_accessories.length > 0) {
      const validation = await repository.validateAccessoryIds(manage_quotation_item_accessories);
      if (!validation.isValid) {
        const invalidIdsList = validation.invalidIds.join(', ');
        const response = mappingError(
          `Accessory dengan ID berikut tidak ditemukan: ${invalidIdsList}`,
          400
        );
        return baseResponse(res, response);
      }
    }
    
    // Add created_by
    quotationData.created_by = tokenData.created_by;
    
    // Create quotation
    const data = await repository.create(quotationData);
    
    // Create items if provided
    if (manage_quotation_items && manage_quotation_items.length > 0) {
      await repository.createItems(data.manage_quotation_id, manage_quotation_items, tokenData.created_by);
    }
    
    // Create accessories if provided
    if (manage_quotation_item_accessories && manage_quotation_item_accessories.length > 0) {
      await repository.createAccessories(data.manage_quotation_id, manage_quotation_item_accessories, tokenData.created_by);
    }
    
    const response = mappingSuccess('Data berhasil dibuat', data, 201);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Update existing manage quotation
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user info from token
    const tokenData = decodeToken('updated', req);
    
    // Extract items and accessories from request body
    // Remove manage_quotation_no from body as it will be auto-generated if status changes to submit
    const { manage_quotation_items, manage_quotation_item_accessories, manage_quotation_no, ...quotationData } = req.body;
    
    // Validate componen_product_id if items provided
    if (manage_quotation_items && manage_quotation_items.length > 0) {
      const validation = await repository.validateComponenProductIds(manage_quotation_items);
      if (!validation.isValid) {
        const invalidIdsList = validation.invalidIds.join(', ');
        const response = mappingError(
          `Componen product dengan ID berikut tidak ditemukan: ${invalidIdsList}`,
          400
        );
        return baseResponse(res, response);
      }
    }
    
    // Validate accessory_id if accessories provided
    if (manage_quotation_item_accessories && manage_quotation_item_accessories.length > 0) {
      const validation = await repository.validateAccessoryIds(manage_quotation_item_accessories);
      if (!validation.isValid) {
        const invalidIdsList = validation.invalidIds.join(', ');
        const response = mappingError(
          `Accessory dengan ID berikut tidak ditemukan: ${invalidIdsList}`,
          400
        );
        return baseResponse(res, response);
      }
    }
    
    // Add updated_by
    quotationData.updated_by = tokenData.updated_by;
    
    // Update quotation
    const data = await repository.update(id, quotationData);
    
    if (!data) {
      const response = mappingError('Data tidak ditemukan', 404);
      return baseResponse(res, response);
    }
    
    // Update items if provided
    if (manage_quotation_items && manage_quotation_items.length > 0) {
      await repository.replaceItems(id, manage_quotation_items, tokenData.updated_by);
    }
    
    // Update accessories if provided
    if (manage_quotation_item_accessories && manage_quotation_item_accessories.length > 0) {
      await repository.replaceAccessories(id, manage_quotation_item_accessories, tokenData.updated_by);
    }
    
    const response = mappingSuccess('Data berhasil diupdate', data);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Soft delete manage quotation
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
 * Restore soft deleted manage quotation
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

