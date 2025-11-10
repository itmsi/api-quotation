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
    
    // Get detail data
    const items = await repository.getItemsByQuotationId(id);
    const accessories = await repository.getAccessoriesByQuotationId(id);
    const specifications = await repository.getSpecificationsByQuotationId(id);

    const itemsWithRelations = items.map((item) => {
      const itemAccessories = accessories.filter((accessory) => {
        if (item.componen_product_id && accessory.componen_product_id) {
          return accessory.componen_product_id === item.componen_product_id;
        }
        return false;
      });

      const itemSpecifications = specifications.filter((specification) => {
        if (item.componen_product_id && specification.componen_product_id) {
          return specification.componen_product_id === item.componen_product_id;
        }
        return false;
      });

      return {
        ...item,
        manage_quotation_item_accessories: itemAccessories,
        manage_quotation_item_specifications: itemSpecifications
      };
    });

    data.manage_quotation_items = itemsWithRelations;
    
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
      manage_quotation_no,
      term_content_id,
      term_content_directory,
      ...quotationData
    } = req.body;
    
    const hasItemsArray = Array.isArray(manage_quotation_items);
    const itemsForProcessing = hasItemsArray ? manage_quotation_items : [];
    const itemsForInsert = [];
    const accessoriesForInsert = [];
    const specificationsForInsert = [];
    
    if (hasItemsArray) {
      for (const rawItem of itemsForProcessing) {
        if (!rawItem || typeof rawItem !== 'object') {
          continue;
        }
        
        const {
          manage_quotation_item_accessories: itemAccessories,
          manage_quotation_item_specifications: itemSpecifications,
          ...itemFields
        } = rawItem;
        
        itemsForInsert.push(itemFields);
        
        if (Array.isArray(itemAccessories)) {
          for (const accessory of itemAccessories) {
            accessoriesForInsert.push({
              ...accessory,
              componen_product_id: accessory?.componen_product_id || itemFields.componen_product_id || null
            });
          }
        }
        
        if (Array.isArray(itemSpecifications)) {
          for (const specification of itemSpecifications) {
            specificationsForInsert.push({
              ...specification,
              componen_product_id: specification?.componen_product_id || itemFields.componen_product_id || null
            });
          }
        }
      }
    }
    
    if (Array.isArray(req.body.manage_quotation_item_accessories)) {
      for (const accessory of req.body.manage_quotation_item_accessories) {
        accessoriesForInsert.push({
          ...accessory,
          componen_product_id: accessory?.componen_product_id || null
        });
      }
    }
    
    if (Array.isArray(req.body.manage_quotation_item_specifications)) {
      for (const specification of req.body.manage_quotation_item_specifications) {
        specificationsForInsert.push({
          ...specification,
          componen_product_id: specification?.componen_product_id || null
        });
      }
    }
    
    const hasAccessoriesArray = accessoriesForInsert.length > 0;
    const hasSpecificationsArray = specificationsForInsert.length > 0;
    
    // Validate componen_product_id if items provided
    if (itemsForInsert.length > 0) {
      const validation = await repository.validateComponenProductIds(itemsForInsert);
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
    if (hasAccessoriesArray) {
      const validation = await repository.validateAccessoryIds(accessoriesForInsert);
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
    if (hasSpecificationsArray) {
      const validation = await repository.validateSpecificationComponenProductIds(specificationsForInsert);
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
    if (itemsForInsert.length > 0) {
      await repository.createItems(data.manage_quotation_id, itemsForInsert, tokenData.created_by);
    }
    
    // Create accessories if provided
    if (accessoriesForInsert.length > 0) {
      await repository.createAccessories(data.manage_quotation_id, accessoriesForInsert, tokenData.created_by);
    }

    // Create specifications jika disediakan
    if (specificationsForInsert.length > 0) {
      await repository.createSpecifications(data.manage_quotation_id, specificationsForInsert, tokenData.created_by);
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
      manage_quotation_no,
      term_content_id,
      term_content_directory,
      ...quotationData
    } = req.body;
    
    const itemsProvided = Object.prototype.hasOwnProperty.call(req.body, 'manage_quotation_items');
    const hasItemsArray = Array.isArray(manage_quotation_items);
    const itemsForProcessing = hasItemsArray ? manage_quotation_items : [];
    const itemsForInsert = [];
    const accessoriesForInsert = [];
    const specificationsForInsert = [];
    
    if (hasItemsArray) {
      for (const rawItem of itemsForProcessing) {
        if (!rawItem || typeof rawItem !== 'object') {
          continue;
        }
        
        const {
          manage_quotation_item_accessories: itemAccessories,
          manage_quotation_item_specifications: itemSpecifications,
          ...itemFields
        } = rawItem;
        
        itemsForInsert.push(itemFields);
        
        if (Array.isArray(itemAccessories)) {
          for (const accessory of itemAccessories) {
            accessoriesForInsert.push({
              ...accessory,
              componen_product_id: accessory?.componen_product_id || itemFields.componen_product_id || null
            });
          }
        }
        
        if (Array.isArray(itemSpecifications)) {
          for (const specification of itemSpecifications) {
            specificationsForInsert.push({
              ...specification,
              componen_product_id: specification?.componen_product_id || itemFields.componen_product_id || null
            });
          }
        }
      }
    }
    
    if (Array.isArray(req.body.manage_quotation_item_accessories)) {
      for (const accessory of req.body.manage_quotation_item_accessories) {
        accessoriesForInsert.push({
          ...accessory,
          componen_product_id: accessory?.componen_product_id || null
        });
      }
    }
    
    if (Array.isArray(req.body.manage_quotation_item_specifications)) {
      for (const specification of req.body.manage_quotation_item_specifications) {
        specificationsForInsert.push({
          ...specification,
          componen_product_id: specification?.componen_product_id || null
        });
      }
    }
    
    const accessoriesProvided = itemsProvided || Object.prototype.hasOwnProperty.call(req.body, 'manage_quotation_item_accessories');
    const specificationsProvided = itemsProvided || Object.prototype.hasOwnProperty.call(req.body, 'manage_quotation_item_specifications');
    
    // Get existing quotation data
    existing = await repository.findById(id);
    if (!existing) {
      const response = mappingError('Data tidak ditemukan', 404);
      return baseResponse(res, response);
    }
    
    // Validate componen_product_id if items provided
    if (itemsForInsert.length > 0) {
      const validation = await repository.validateComponenProductIds(itemsForInsert);
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
    if (accessoriesForInsert.length > 0) {
      const validation = await repository.validateAccessoryIds(accessoriesForInsert);
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
    if (specificationsForInsert.length > 0) {
      const validation = await repository.validateSpecificationComponenProductIds(specificationsForInsert);
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
    if (itemsProvided) {
      await repository.replaceItems(id, itemsForInsert, tokenData.updated_by);
    }
    
    // Update accessories jika array disediakan (termasuk kosong untuk reset)
    if (accessoriesProvided) {
      await repository.replaceAccessories(id, accessoriesForInsert, tokenData.updated_by);
    }

    // Update specifications jika array disediakan (termasuk kosong untuk reset)
    if (specificationsProvided) {
      await repository.replaceSpecifications(id, specificationsForInsert, tokenData.updated_by);
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

