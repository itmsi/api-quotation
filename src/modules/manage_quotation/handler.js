const path = require('path');
const fs = require('fs');
const db = require('../../config/database');
const repository = require('./postgre_repository');
const customerRepository = require('../cutomer/postgre_repository');
const employeeRepository = require('../sales/postgre_repository');
const { baseResponse, mappingError, mappingSuccess, Logger } = require('../../utils');
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

  if (typeof payload === 'object' && !Array.isArray(payload)) {
    // Check if it's a plain object (not Date, Buffer, etc.)
    if (payload.constructor === Object) {
      return payload;
    }
    // For other object types, convert to string representation
    return { content: String(payload) };
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    if (!trimmed) {
      return {};
    }

    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(trimmed);
      // If parsed result is a primitive, wrap it in an object
      if (typeof parsed !== 'object' || parsed === null) {
        return { content: parsed };
      }
      return parsed;
    } catch (error) {
      // If not valid JSON, treat as plain string content
      return { content: trimmed };
    }
  }

  // For other types (number, boolean, etc.), wrap in object
  return { content: payload };
};

const writeJsonFile = async (manageQuotationNo, manageQuotationId, payload) => {
  await ensureDirectory(TERM_CONTENT_FOLDER);

  const sanitizedQuotationNo = sanitizeFileName(manageQuotationNo || 'term_content');
  const fileName = `${sanitizedQuotationNo}_${manageQuotationId}.json`;
  const absolutePath = path.join(TERM_CONTENT_FOLDER, fileName);
  const relativePath = path.relative(ROOT_DIR, absolutePath);

  const dataToWrite = normalizeJsonPayload(payload);
  
  // Ensure dataToWrite is always a valid object/array for JSON.stringify
  let fileContent;
  try {
    fileContent = JSON.stringify(dataToWrite, null, 2);
    // Ensure fileContent is a string
    if (typeof fileContent !== 'string') {
      fileContent = JSON.stringify({ content: String(fileContent) }, null, 2);
    }
  } catch (error) {
    // If stringify fails (e.g., circular reference), wrap in object
    fileContent = JSON.stringify({ content: String(dataToWrite) }, null, 2);
  }

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
 * Extract term_content_payload as string from payload object
 * If payload has content property, return it as string
 * Otherwise, convert payload to string
 */
const extractTermContentPayload = (payload) => {
  if (!payload) {
    return null;
  }
  
  // If payload has content property, extract it
  if (payload && typeof payload === 'object' && payload.content !== undefined) {
    return typeof payload.content === 'string' ? payload.content : JSON.stringify(payload.content);
  }
  
  // If payload is already a string, return it
  if (typeof payload === 'string') {
    return payload;
  }
  
  // Otherwise, stringify the payload
  return JSON.stringify(payload);
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

const insertFieldAfterKey = (item, targetKey, fieldName, fieldValue) => {
  if (!item || typeof item !== 'object') {
    return item;
  }

  const entries = Object.entries(item).filter(([key]) => key !== fieldName);
  const resultEntries = [];
  let inserted = false;

  for (const [key, value] of entries) {
    resultEntries.push([key, value]);
    if (!inserted && key === targetKey) {
      resultEntries.push([fieldName, fieldValue]);
      inserted = true;
    }
  }

  if (!inserted) {
    resultEntries.push([fieldName, fieldValue]);
  }

  return Object.fromEntries(resultEntries);
};

/**
 * Map nilai componen_type menjadi product_type
 */
const mapProductType = (componenType) => {
  if (componenType === null || componenType === undefined || componenType === '') {
    return '';
  }

  const normalizedType = Number(componenType);

  switch (normalizedType) {
    case 1:
      return 'OFF ROAD REGULAR';
    case 2:
      return 'ON ROAD REGULAR';
    case 3:
      return 'OFF ROAD IRREGULAR';
    default:
      return '';
  }
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

    if (Array.isArray(data?.items) && data.items.length > 0) {
      const itemsNeedingCustomer = data.items.filter(
        (item) => item && item.customer_id && (item.customer_name === undefined || item.customer_name === null)
      );
      const itemsNeedingEmployee = data.items.filter(
        (item) => item && item.employee_id && (item.employee_name === undefined || item.employee_name === null)
      );

      let customerMap = {};
      let employeeMap = {};

      if (itemsNeedingCustomer.length > 0) {
        const uniqueCustomerIds = [
          ...new Set(itemsNeedingCustomer.map((item) => item.customer_id).filter(Boolean))
        ];

        if (uniqueCustomerIds.length > 0) {
          try {
            const customers = await customerRepository.findByIds(uniqueCustomerIds);
            if (Array.isArray(customers)) {
              customerMap = customers.reduce((acc, customer) => {
                if (customer?.customer_id) {
                  acc[customer.customer_id] = customer.customer_name || null;
                }
                return acc;
              }, {});
            }
          } catch (error) {
            Logger.error('[manage-quotation:getAll] gagal memuat customer fallback', {
              customer_ids: uniqueCustomerIds,
              message: error?.message
            });
          }
        }
      }

      if (itemsNeedingEmployee.length > 0) {
        const uniqueEmployeeIds = [
          ...new Set(itemsNeedingEmployee.map((item) => item.employee_id).filter(Boolean))
        ];

        if (uniqueEmployeeIds.length > 0) {
          try {
            const employees = await employeeRepository.findByIds(uniqueEmployeeIds);
            if (Array.isArray(employees)) {
              employeeMap = employees.reduce((acc, employee) => {
                if (employee?.employee_id) {
                  acc[employee.employee_id] = employee.employee_name || null;
                }
                return acc;
              }, {});
            }
          } catch (error) {
            Logger.error('[manage-quotation:getAll] gagal memuat employee fallback', {
              employee_ids: uniqueEmployeeIds,
              message: error?.message
            });
          }
        }
      }

      data.items = data.items.map((item) => {
        if (!item) {
          return item;
        }

        const customerName = Object.prototype.hasOwnProperty.call(item, 'customer_name')
          ? item.customer_name
          : (item.customer_id ? customerMap[item.customer_id] ?? null : null);

        const employeeName = Object.prototype.hasOwnProperty.call(item, 'employee_name')
          ? item.employee_name
          : (item.employee_id ? employeeMap[item.employee_id] ?? null : null);

        let result = insertFieldAfterKey(item, 'customer_id', 'customer_name', customerName);
        result = insertFieldAfterKey(result, 'employee_id', 'employee_name', employeeName);
        return result;
      });
    }

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
    
    if (data.customer_id && (data.customer_name === undefined || data.customer_name === null)) {
      try {
        const customer = await customerRepository.findById(data.customer_id);
        data.customer_name = customer?.customer_name || null;
      } catch (error) {
        Logger.error('[manage-quotation:getById] gagal memuat customer', {
          customer_id: data.customer_id,
          message: error?.message
        });
        data.customer_name = null;
      }
    }
    
    if (data.employee_id && (data.employee_name === undefined || data.employee_name === null)) {
      try {
        const employee = await employeeRepository.findById(data.employee_id);
        data.employee_name = employee?.employee_name || null;
      } catch (error) {
        Logger.error('[manage-quotation:getById] gagal memuat employee', {
          employee_id: data.employee_id,
          message: error?.message
        });
        data.employee_name = null;
      }
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

      const productType = mapProductType(item.cp_componen_type);

      return {
        ...item,
        product_type: productType,
        manage_quotation_item_accessories: itemAccessories,
        manage_quotation_item_specifications: itemSpecifications
      };
    });

    data.manage_quotation_items = itemsWithRelations;
    
    // Read term_content_directory JSON file if exists
    if (data.term_content_directory) {
      const payload = await readJsonFile(data.term_content_directory);
      data.term_content_payload = extractTermContentPayload(payload);
    }
    
    const response = mappingSuccess('Data berhasil diambil', data);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Get single manage quotation by ID for PDF
 */
const getPdfById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await repository.findById(id);
    
    if (!data) {
      const response = mappingError('Data tidak ditemukan', 404);
      return baseResponse(res, response);
    }
    
    if (data.customer_id) {
      try {
        const customer = await customerRepository.findById(data.customer_id);
        if (customer) {
          if (data.customer_name === undefined || data.customer_name === null) {
            data.customer_name = customer?.customer_name || null;
          }
          data.contact_person = customer?.contact_person || null;
          data.customer_phone = customer?.customer_phone || null;
          data.customer_address = customer?.customer_address || null;
        }
      } catch (error) {
        Logger.error('[manage-quotation:getPdfById] gagal memuat customer', {
          customer_id: data.customer_id,
          message: error?.message
        });
        if (data.customer_name === undefined || data.customer_name === null) {
          data.customer_name = null;
        }
        data.contact_person = null;
        data.customer_phone = null;
        data.customer_address = null;
      }
    }
    
    if (data.employee_id) {
      try {
        const employee = await employeeRepository.findById(data.employee_id);
        if (employee) {
          if (data.employee_name === undefined || data.employee_name === null) {
            data.employee_name = employee?.employee_name || null;
          }
          data.employee_phone = employee?.employee_phone || null;
        }
      } catch (error) {
        Logger.error('[manage-quotation:getPdfById] gagal memuat employee', {
          employee_id: data.employee_id,
          message: error?.message
        });
        if (data.employee_name === undefined || data.employee_name === null) {
          data.employee_name = null;
        }
        data.employee_phone = null;
      }
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

      const productType = mapProductType(item.cp_componen_type);

      return {
        ...item,
        componen_product_unit_model: item.cp_componen_product_unit_model || null,
        product_type: productType,
        manage_quotation_item_accessories: itemAccessories,
        manage_quotation_item_specifications: itemSpecifications
      };
    });

    data.manage_quotation_items = itemsWithRelations;
    
    // Read term_content_directory JSON file if exists
    if (data.term_content_directory) {
      const payload = await readJsonFile(data.term_content_directory);
      data.term_content_payload = extractTermContentPayload(payload);
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
  let createdQuotation = null;
  const processLogs = [];

  const logStep = (stage, status, details = {}) => {
    const entry = {
      stage,
      status,
      timestamp: new Date().toISOString(),
      details
    };
    processLogs.push(entry);

    const logPayload = { stage, status, ...details };
    if (status === 'error') {
      Logger.error('[manage-quotation:create]', logPayload);
    } else {
      Logger.info('[manage-quotation:create]', logPayload);
    }

    return entry;
  };
  
  try {
    logStep('request.received', 'info', {
      bodyKeys: Object.keys(req.body || {}),
      hasItems: Array.isArray(req.body?.manage_quotation_items),
      itemsCount: Array.isArray(req.body?.manage_quotation_items) ? req.body.manage_quotation_items.length : 0
    });

    const tokenData = decodeToken('created', req);
    logStep('token.decoded', 'success', { created_by: tokenData.created_by });
    
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

    logStep('payload.normalized', 'success', {
      items: itemsForInsert.length,
      accessories: accessoriesForInsert.length,
      specifications: specificationsForInsert.length
    });
    
    const hasAccessoriesArray = accessoriesForInsert.length > 0;
    const hasSpecificationsArray = specificationsForInsert.length > 0;
    
    if (itemsForInsert.length > 0) {
      const validation = await repository.validateComponenProductIds(itemsForInsert);
      if (!validation.isValid) {
        logStep('validation.items', 'error', { invalidIds: validation.invalidIds });
        const invalidIdsList = validation.invalidIds.join(', ');
        const response = mappingError(
          `Componen product dengan ID berikut tidak ditemukan: ${invalidIdsList}`,
          400
        );
        response.data.logs = processLogs;
        return baseResponse(res, response);
      }
      logStep('validation.items', 'success', { validatedCount: itemsForInsert.length });
    } else {
      logStep('validation.items', 'skipped', { reason: 'no items provided' });
    }
    
    if (hasAccessoriesArray) {
      const validation = await repository.validateAccessoryIds(accessoriesForInsert);
      if (!validation.isValid) {
        logStep('validation.accessories', 'error', { invalidIds: validation.invalidIds });
        const invalidIdsList = validation.invalidIds.join(', ');
        const response = mappingError(
          `Accessory dengan ID berikut tidak ditemukan: ${invalidIdsList}`,
          400
        );
        response.data.logs = processLogs;
        return baseResponse(res, response);
      }
      logStep('validation.accessories', 'success', { validatedCount: accessoriesForInsert.length });
    } else {
      logStep('validation.accessories', 'skipped', { reason: 'no accessories provided' });
    }

    if (hasSpecificationsArray) {
      const validation = await repository.validateSpecificationComponenProductIds(specificationsForInsert);
      if (!validation.isValid) {
        logStep('validation.specifications', 'error', { invalidIds: validation.invalidIds });
        const invalidIdsList = validation.invalidIds.join(', ');
        const response = mappingError(
          `Componen product pada specification dengan ID berikut tidak ditemukan: ${invalidIdsList}`,
          400
        );
        response.data.logs = processLogs;
        return baseResponse(res, response);
      }
      logStep('validation.specifications', 'success', { validatedCount: specificationsForInsert.length });
    } else {
      logStep('validation.specifications', 'skipped', { reason: 'no specifications provided' });
    }
    
    quotationData.created_by = tokenData.created_by;
    if (term_content_id !== undefined) {
      quotationData.term_content_id = term_content_id || null;
    }

    await db.transaction(async (trx) => {
      createdQuotation = await repository.create(quotationData, trx);
      logStep('transaction.createQuotation', 'success', {
        manage_quotation_id: createdQuotation.manage_quotation_id,
        manage_quotation_no: createdQuotation.manage_quotation_no
      });

      if (term_content_directory !== undefined && term_content_directory !== null && term_content_directory !== '') {
        relativePath = await writeJsonFile(
          createdQuotation.manage_quotation_no || 'term_content',
          createdQuotation.manage_quotation_id,
          term_content_directory
        );
        logStep('transaction.termContent.write', 'success', { relativePath });

        await repository.update(createdQuotation.manage_quotation_id, {
          term_content_directory: relativePath
        }, trx);

        createdQuotation.term_content_directory = relativePath;
      } else {
        logStep('transaction.termContent.write', 'skipped', { reason: 'no term_content_directory provided' });
      }
      
      if (itemsForInsert.length > 0) {
        await repository.createItems(createdQuotation.manage_quotation_id, itemsForInsert, tokenData.created_by, trx);
        logStep('transaction.items.create', 'success', { count: itemsForInsert.length });
      } else {
        logStep('transaction.items.create', 'skipped', { reason: 'no items to insert' });
      }
      
      if (accessoriesForInsert.length > 0) {
        await repository.createAccessories(createdQuotation.manage_quotation_id, accessoriesForInsert, tokenData.created_by, trx);
        logStep('transaction.accessories.create', 'success', { count: accessoriesForInsert.length });
      } else {
        logStep('transaction.accessories.create', 'skipped', { reason: 'no accessories to insert' });
      }

      if (specificationsForInsert.length > 0) {
        await repository.createSpecifications(createdQuotation.manage_quotation_id, specificationsForInsert, tokenData.created_by, trx);
        logStep('transaction.specifications.create', 'success', { count: specificationsForInsert.length });
      } else {
        logStep('transaction.specifications.create', 'skipped', { reason: 'no specifications to insert' });
      }
    });
    
    if (createdQuotation?.term_content_directory) {
      const payload = await readJsonFile(createdQuotation.term_content_directory);
      createdQuotation.term_content_payload = extractTermContentPayload(payload);
      logStep('postProcess.termContent.read', 'success', { hasPayload: Boolean(payload) });
    }
    
    const response = mappingSuccess('Data berhasil dibuat', createdQuotation, 201);
    response.data.logs = processLogs;
    return baseResponse(res, response);
  } catch (error) {
    logStep('process.failed', 'error', { message: error.message });

    if (relativePath) {
      try {
        await deleteJsonFile(relativePath);
        logStep('rollback.termContent.delete', 'success', { relativePath });
      } catch (cleanupError) {
        logStep('rollback.termContent.delete', 'error', { message: cleanupError.message });
        console.error('Gagal menghapus file term content saat rollback create:', cleanupError);
      }
    }
    
    const response = mappingError(error);
    response.data.logs = processLogs;
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
    
    // Log request start
    if (process.env.NODE_ENV === 'development') {
      Logger.info('[manage-quotation:update] request received', {
        id,
        bodyKeys: Object.keys(req.body || {}),
        hasItems: Array.isArray(req.body?.manage_quotation_items)
      });
    }
    
    // Get user info from token
    const tokenData = decodeToken('updated', req);
    
    // Validate token data
    if (!tokenData.updated_by || tokenData.updated_by === '') {
      Logger.error('[manage-quotation:update] invalid token data', { tokenData });
      const response = mappingError('Token tidak valid atau tidak memiliki informasi user', 401);
      return baseResponse(res, response);
    }
    
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
      data.term_content_payload = extractTermContentPayload(payload);
    }
    
    const response = mappingSuccess('Data berhasil diupdate', data);
    
    // Log success
    if (process.env.NODE_ENV === 'development') {
      Logger.info('[manage-quotation:update] update successful', { id });
    }
    
    return baseResponse(res, response);
  } catch (error) {
    // Log error details
    Logger.error('[manage-quotation:update] update failed', {
      id: req.params?.id,
      error: error.message,
      stack: error.stack,
      bodyKeys: Object.keys(req.body || {})
    });
    
    // Cleanup new file if error occurred
    if (newRelativePath && existing && existing.term_content_directory !== newRelativePath) {
      try {
        await deleteJsonFile(newRelativePath);
      } catch (cleanupError) {
        Logger.error('[manage-quotation:update] cleanup failed', {
          error: cleanupError.message,
          relativePath: newRelativePath
        });
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
  getPdfById,
  create,
  update,
  remove,
  restore
};

