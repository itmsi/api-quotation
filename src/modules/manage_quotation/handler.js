const path = require('path');
const fs = require('fs');
const repository = require('./postgre_repository');
const { baseResponse, mappingError, mappingSuccess } = require('../../utils');
const { decodeToken } = require('../../utils/auth');

const ROOT_DIR = path.join(__dirname, '../../..');
const TERM_CONTENT_FOLDER = path.join(ROOT_DIR, 'uploads/manage_quotation_term_contents');

const ensureDirectory = async (dirPath) => {
  await fs.promises.mkdir(dirPath, { recursive: true });
};

const sanitizeFileName = (fileName) => {
  if (!fileName) return 'term_content';
  return fileName
    .toString()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .toLowerCase();
};

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

const writeJsonFile = async (manageQuotationNo, manageQuotationId, payload) => {
  await ensureDirectory(TERM_CONTENT_FOLDER);

  const sanitizedQuotationNo = sanitizeFileName(manageQuotationNo || 'term_content');
  const fileName = `${sanitizedQuotationNo}_${manageQuotationId}.json`;
  const absolutePath = path.join(TERM_CONTENT_FOLDER, fileName);
  const relativePath = path.relative(ROOT_DIR, absolutePath);

  const dataToWrite = normalizeJsonPayload(payload);
  const fileContent = JSON.stringify(dataToWrite, null, 2);

  await fs.promises.writeFile(absolutePath, fileContent, 'utf8');

  return relativePath.replace(/\\/g, '/');
};

const deleteJsonFile = async (relativePath) => {
  if (!relativePath) {
    return;
  }

  const absolutePath = path.join(ROOT_DIR, relativePath);
  try {
    await fs.promises.unlink(absolutePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

const readJsonFile = async (relativePath) => {
  if (!relativePath) {
    return {};
  }

  const absolutePath = path.join(ROOT_DIR, relativePath);
  try {
    const content = await fs.promises.readFile(absolutePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }

    if (error.name === 'SyntaxError') {
      return {};
    }

    throw error;
  }
};

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

    // Get specifications for this quotation
    const specifications = await repository.getSpecificationsByQuotationId(id);
    data.manage_quotation_item_specifications = specifications;
    
    // Read term_content_directory JSON file if exists
    if (data.term_content_directory) {
      const payload = await readJsonFile(data.term_content_directory);
      data.term_content_payload = payload;
    }
    
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
  let relativePath = null;
  
  try {
    // Get user info from token
    const tokenData = decodeToken('created', req);
    
    // Extract items and accessories from request body
    // Remove manage_quotation_no from body as it will be auto-generated if status is submit
    const {
      manage_quotation_items,
      manage_quotation_item_accessories,
      manage_quotation_item_specifications,
      manage_quotation_no,
      term_content_id,
      term_content_directory,
      ...quotationData
    } = req.body;
    
    const hasItemsArray = Array.isArray(manage_quotation_items);
    const hasAccessoriesArray = Array.isArray(manage_quotation_item_accessories);
    const hasSpecificationsArray = Array.isArray(manage_quotation_item_specifications);
    
    // Validate componen_product_id if items provided
    if (hasItemsArray && manage_quotation_items.length > 0) {
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
    if (hasAccessoriesArray && manage_quotation_item_accessories.length > 0) {
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

    // Validate componen_product_id untuk specifications jika ada
    if (hasSpecificationsArray && manage_quotation_item_specifications.length > 0) {
      const validation = await repository.validateSpecificationComponenProductIds(manage_quotation_item_specifications);
      if (!validation.isValid) {
        const invalidIdsList = validation.invalidIds.join(', ');
        const response = mappingError(
          `Componen product pada specification dengan ID berikut tidak ditemukan: ${invalidIdsList}`,
          400
        );
        return baseResponse(res, response);
      }
    }
    
    // Add created_by and term_content_id
    quotationData.created_by = tokenData.created_by;
    if (term_content_id !== undefined) {
      quotationData.term_content_id = term_content_id || null;
    }
    
    // Create quotation
    const data = await repository.create(quotationData);
    
    // Handle term_content_directory - save as JSON file if provided
    if (term_content_directory !== undefined && term_content_directory !== null && term_content_directory !== '') {
      relativePath = await writeJsonFile(
        data.manage_quotation_no || 'term_content',
        data.manage_quotation_id,
        term_content_directory
      );
      
      // Update quotation with term_content_directory path
      await repository.update(data.manage_quotation_id, {
        term_content_directory: relativePath
      });
      data.term_content_directory = relativePath;
    }
    
    // Create items if provided
    if (hasItemsArray && manage_quotation_items.length > 0) {
      await repository.createItems(data.manage_quotation_id, manage_quotation_items, tokenData.created_by);
    }
    
    // Create accessories if provided
    if (hasAccessoriesArray && manage_quotation_item_accessories.length > 0) {
      await repository.createAccessories(data.manage_quotation_id, manage_quotation_item_accessories, tokenData.created_by);
    }

    // Create specifications jika disediakan
    if (hasSpecificationsArray && manage_quotation_item_specifications.length > 0) {
      await repository.createSpecifications(data.manage_quotation_id, manage_quotation_item_specifications, tokenData.created_by);
    }
    
    // Read term_content_directory JSON file if exists
    if (data.term_content_directory) {
      const payload = await readJsonFile(data.term_content_directory);
      data.term_content_payload = payload;
    }
    
    const response = mappingSuccess('Data berhasil dibuat', data, 201);
    return baseResponse(res, response);
  } catch (error) {
    // Cleanup file if error occurred
    if (relativePath) {
      try {
        await deleteJsonFile(relativePath);
      } catch (cleanupError) {
        console.error('Gagal menghapus file term content saat rollback create:', cleanupError);
      }
    }
    
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Update existing manage quotation
 */
const update = async (req, res) => {
  let newRelativePath = null;
  let existing = null;
  
  try {
    const { id } = req.params;
    
    // Get user info from token
    const tokenData = decodeToken('updated', req);
    
    // Extract items and accessories from request body
    // Remove manage_quotation_no from body as it will be auto-generated if status changes to submit
    const {
      manage_quotation_items,
      manage_quotation_item_accessories,
      manage_quotation_item_specifications,
      manage_quotation_no,
      term_content_id,
      term_content_directory,
      ...quotationData
    } = req.body;
    
    const hasItemsArray = Array.isArray(manage_quotation_items);
    const hasAccessoriesArray = Array.isArray(manage_quotation_item_accessories);
    const hasSpecificationsArray = Array.isArray(manage_quotation_item_specifications);
    
    // Get existing quotation data
    existing = await repository.findById(id);
    if (!existing) {
      const response = mappingError('Data tidak ditemukan', 404);
      return baseResponse(res, response);
    }
    
    // Validate componen_product_id if items provided
    if (hasItemsArray && manage_quotation_items.length > 0) {
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
    if (hasAccessoriesArray && manage_quotation_item_accessories.length > 0) {
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

    // Validate componen_product_id untuk specifications jika ada
    if (hasSpecificationsArray && manage_quotation_item_specifications.length > 0) {
      const validation = await repository.validateSpecificationComponenProductIds(manage_quotation_item_specifications);
      if (!validation.isValid) {
        const invalidIdsList = validation.invalidIds.join(', ');
        const response = mappingError(
          `Componen product pada specification dengan ID berikut tidak ditemukan: ${invalidIdsList}`,
          400
        );
        return baseResponse(res, response);
      }
    }
    
    // Handle term_content_id
    if (term_content_id !== undefined) {
      quotationData.term_content_id = term_content_id || null;
    }
    
    // Handle term_content_directory - save as JSON file if provided
    if (term_content_directory !== undefined) {
      const payloadSource = term_content_directory !== null && term_content_directory !== ''
        ? term_content_directory
        : await readJsonFile(existing.term_content_directory || '');
      
      if (payloadSource && Object.keys(payloadSource).length > 0) {
        newRelativePath = await writeJsonFile(
          existing.manage_quotation_no || 'term_content',
          existing.manage_quotation_id,
          payloadSource
        );
        
        quotationData.term_content_directory = newRelativePath;
      } else if (term_content_directory === null || term_content_directory === '') {
        // If explicitly set to null or empty, delete the file and clear the field
        if (existing.term_content_directory) {
          await deleteJsonFile(existing.term_content_directory);
        }
        quotationData.term_content_directory = null;
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
    
    // Delete old file if path changed
    if (newRelativePath && existing.term_content_directory && existing.term_content_directory !== newRelativePath) {
      await deleteJsonFile(existing.term_content_directory);
    }
    
    // Update items jika array disediakan (termasuk kosong untuk reset)
    if (hasItemsArray) {
      await repository.replaceItems(id, manage_quotation_items, tokenData.updated_by);
    }
    
    // Update accessories jika array disediakan (termasuk kosong untuk reset)
    if (hasAccessoriesArray) {
      await repository.replaceAccessories(id, manage_quotation_item_accessories, tokenData.updated_by);
    }

    // Update specifications jika array disediakan (termasuk kosong untuk reset)
    if (hasSpecificationsArray) {
      await repository.replaceSpecifications(id, manage_quotation_item_specifications, tokenData.updated_by);
    }
    
    // Read term_content_directory JSON file if exists
    if (data.term_content_directory) {
      const payload = await readJsonFile(data.term_content_directory);
      data.term_content_payload = payload;
    }
    
    const response = mappingSuccess('Data berhasil diupdate', data);
    return baseResponse(res, response);
  } catch (error) {
    // Cleanup new file if error occurred
    if (newRelativePath && existing && existing.term_content_directory !== newRelativePath) {
      try {
        await deleteJsonFile(newRelativePath);
      } catch (cleanupError) {
        console.error('Gagal menghapus file term content saat rollback update:', cleanupError);
      }
    }
    
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

