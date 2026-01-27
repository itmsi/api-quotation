const db = require('../../config/database');
const repository = require('./postgre_repository');
const customerRepository = require('../cutomer/postgre_repository');
const employeeRepository = require('../sales/postgre_repository');
const termContentRepository = require('../term_content/postgre_repository');
const { baseResponse, mappingError, mappingSuccess, Logger } = require('../../utils');
const { decodeToken } = require('../../utils/auth');

/**
 * Normalize image untuk response API
 * Convert JSON string to array of objects with image_id and image_url
 * Supports both old format (array of strings) and new format (array of objects)
 */
const mapImageResponse = (image) => {
  if (!image) {
    return [];
  }

  // If already an array, check format and normalize
  if (Array.isArray(image)) {
    // Check if it's new format (array of objects) or old format (array of strings)
    return image.map(item => {
      if (typeof item === 'object' && item !== null && item.image_id && item.image_url) {
        // New format: already has image_id and image_url
        return item;
      } else if (typeof item === 'string') {
        // Old format: convert string URL to object format
        return {
          image_id: null, // Old format doesn't have image_id
          image_url: item
        };
      }
      return item;
    });
  }

  // If string, try to parse as JSON
  if (typeof image === 'string') {
    try {
      const parsed = JSON.parse(image);
      if (Array.isArray(parsed)) {
        // Normalize array items
        return parsed.map(item => {
          if (typeof item === 'object' && item !== null && item.image_id && item.image_url) {
            return item;
          } else if (typeof item === 'string') {
            return {
              image_id: null,
              image_url: item
            };
          }
          return item;
        });
      }
      // If parsed is not array, treat as single URL (old format)
      if (typeof parsed === 'string') {
        return [{
          image_id: null,
          image_url: parsed
        }];
      }
      // If parsed is object with image_id and image_url
      if (typeof parsed === 'object' && parsed !== null && parsed.image_id && parsed.image_url) {
        return [parsed];
      }
    } catch (e) {
      // If not JSON, treat as single URL string (old format)
      return [{
        image_id: null,
        image_url: image
      }];
    }
  }

  // Fallback: return empty array
  return [];
};

const DBLINK_NAME = 'gate_sso_dblink';
const DB_LINK_CONNECTION = `dbname=${process.env.DB_GATE_SSO_NAME} user=${process.env.DB_GATE_SSO_USER} password=${process.env.DB_GATE_SSO_PASSWORD} host=${process.env.DB_GATE_SSO_HOST} port=${process.env.DB_GATE_SSO_PORT}`;

/**
 * Get islands by IDs from gate_sso using dblink
 */
const getIslandsByIds = async (ids = []) => {
  if (!ids || ids.length === 0) {
    return [];
  }

  try {
    await customerRepository.ensureConnection();

    const uniqueIds = [...new Set(ids.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return [];
    }

    // Escape IDs using PostgreSQL quote_literal
    const escapedIds = [];
    for (const id of uniqueIds) {
      const escapedIdResult = await db.raw(`SELECT quote_literal(?) as escaped`, [id]);
      const escapedId = escapedIdResult.rows[0]?.escaped;
      escapedIds.push(escapedId);
    }

    const idsList = escapedIds.join(', ');
    const innerQuery = `SELECT island_id, island_name FROM islands WHERE island_id IN (${idsList})`;

    // Escape the entire inner query
    const escapedQueryResult = await db.raw(`SELECT quote_literal(?) as escaped`, [innerQuery]);
    const escapedInnerQuery = escapedQueryResult.rows[0]?.escaped;

    const query = `
      SELECT * FROM dblink('${DBLINK_NAME}', 
        ${escapedInnerQuery}
      ) AS islands (
        island_id uuid,
        island_name varchar
      )
    `;

    const result = await db.raw(query);
    return result.rows || [];
  } catch (error) {
    Logger.error('[manage-quotation:getIslandsByIds] gagal memuat islands', {
      island_ids: ids,
      message: error?.message
    });
    return [];
  }
};

/**
 * Get map of accessory details by ID
 */
const getAccessoryDetailsMap = async (items) => {
  const ids = new Set();

  if (Array.isArray(items)) {
    for (const item of items) {
      if (item && Array.isArray(item.manage_quotation_item_accessories)) {
        item.manage_quotation_item_accessories.forEach(acc => {
          if (acc.accessory_id) ids.add(acc.accessory_id);
        });
      }
    }
  }

  if (ids.size === 0) return {};

  const accessories = await repository.getAccessoriesByIds(Array.from(ids));
  const map = {};
  for (const acc of accessories) {
    map[acc.accessory_id] = acc;
  }

  return map;
};

/**
 * Remove "MSI[number] - " prefix from componen_product_name
 * Handles patterns like: MSI001 - , MSI002 - , MSI003 - , MSI025 - , etc.
 * Also removes suffix: COAL, NICKEL, ALL SEGMENT, ON THE ROAD
 */
const cleanComponenProductName = (productName) => {
  if (!productName || typeof productName !== 'string') {
    return productName;
  }

  // Convert to string and trim
  let cleaned = String(productName).trim();

  // Remove "MSI[digits] - " from the beginning (case-insensitive)
  // Pattern matches: "MSI001 - ", "MSI002 -", "MSI003-", "msi025 - ", etc.
  // Matches MSI followed by one or more digits, then optional spaces, dash, and optional spaces
  const prefixPattern = /^MSI\d+\s*-\s*/i;

  if (prefixPattern.test(cleaned)) {
    cleaned = cleaned.replace(prefixPattern, '');
    cleaned = cleaned.trim(); // Trim again after removal
  }

  // Remove suffix if found at the end (case-insensitive)
  // Suffixes to remove: COAL, NICKEL, ALL SEGMENT, ON THE ROAD
  const suffixesToRemove = [
    'COAL',
    'NICKEL',
    'ALL SEGMENT',
    'ON THE ROAD'
  ];

  for (const suffix of suffixesToRemove) {
    // Create pattern that matches suffix at the end, with optional spaces/dashes before it
    // Pattern: optional spaces/dashes, then the suffix, then end of string
    const suffixPattern = new RegExp(`[\\s-]*${suffix.replace(/\s+/g, '\\s+')}\\s*$`, 'i');

    if (suffixPattern.test(cleaned)) {
      cleaned = cleaned.replace(suffixPattern, '').trim();
    }
  }

  return cleaned;
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
    const { page = 1, limit = 10, search = '', sort_by = 'created_at', sort_order = 'desc', status = '', island_id = '', quotation_for = '', start_date = '', end_date = '' } = req.body;

    const offset = (page - 1) * limit;

    // Validate and normalize island_id
    let normalizedIslandId = null;
    if (island_id && island_id !== '' && island_id !== null && island_id !== undefined) {
      const islandIdStr = String(island_id).trim();
      if (islandIdStr !== '' && islandIdStr !== 'NaN' && islandIdStr !== 'null') {
        normalizedIslandId = islandIdStr;
      }
    }

    // Validate and normalize quotation_for
    let normalizedQuotationFor = null;
    if (quotation_for && quotation_for !== '' && quotation_for !== null && quotation_for !== undefined) {
      const quotationForStr = String(quotation_for).trim();
      if (quotationForStr !== '' && quotationForStr !== 'NaN' && quotationForStr !== 'null') {
        normalizedQuotationFor = quotationForStr;
      }
    }

    // Validate and normalize start_date
    let normalizedStartDate = null;
    if (start_date !== undefined && start_date !== null && start_date !== '') {
      const startDateStr = String(start_date).trim();
      if (startDateStr !== '' && startDateStr !== 'NaN' && startDateStr !== 'null') {
        // Validate date format (YYYY-MM-DD or ISO format)
        const dateRegex = /^\d{4}-\d{2}-\d{2}/;
        if (dateRegex.test(startDateStr)) {
          const date = new Date(startDateStr);
          if (!isNaN(date.getTime())) {
            normalizedStartDate = startDateStr;
          }
        }
      }
    }

    // Validate and normalize end_date
    let normalizedEndDate = null;
    if (end_date !== undefined && end_date !== null && end_date !== '') {
      const endDateStr = String(end_date).trim();
      if (endDateStr !== '' && endDateStr !== 'NaN' && endDateStr !== 'null') {
        // Validate date format (YYYY-MM-DD or ISO format)
        const dateRegex = /^\d{4}-\d{2}-\d{2}/;
        if (dateRegex.test(endDateStr)) {
          const date = new Date(endDateStr);
          if (!isNaN(date.getTime())) {
            normalizedEndDate = endDateStr;
          }
        }
      }
    }

    const params = {
      page,
      limit,
      offset,
      search,
      sortBy: mapSortBy(sort_by),
      sortOrder: sort_order,
      status: status && status.trim() !== '' ? status.trim() : null,
      islandId: normalizedIslandId,
      quotationFor: normalizedQuotationFor,
      startDate: normalizedStartDate,
      endDate: normalizedEndDate
    };

    let data;
    try {
      data = await repository.findAll(params);
    } catch (error) {
      // Log error but don't fail the request
      Logger.error('[manage-quotation:getAll] Error in findAll', {
        error: error.message,
        stack: error.stack
      });

      // Return empty result instead of failing
      const response = mappingError(error);
      return baseResponse(res, response);
    }

    if (Array.isArray(data?.items) && data.items.length > 0) {
      const itemsNeedingCustomer = data.items.filter(
        (item) => item && item.customer_id && (item.customer_name === undefined || item.customer_name === null)
      );
      const itemsNeedingEmployee = data.items.filter(
        (item) => item && item.employee_id && (item.employee_name === undefined || item.employee_name === null)
      );
      // Always process items with island_id to ensure island_name is populated
      const itemsNeedingIsland = data.items.filter(
        (item) => item && item.island_id
      );

      let customerMap = {};
      let contactPersonMap = {};
      let employeeMap = {};
      let islandMap = {};

      // Get all unique customer IDs from all items (not just those needing customer)
      const allCustomerIds = [
        ...new Set(data.items
          .filter((item) => item && item.customer_id)
          .map((item) => item.customer_id)
          .filter(Boolean))
      ];

      // Debug: Log items to see what data we're getting
      if (itemsNeedingIsland.length > 0) {
        Logger.info('[manage-quotation:getAll] items dengan island_id', {
          count: itemsNeedingIsland.length,
          sample: itemsNeedingIsland[0] ? {
            island_id: itemsNeedingIsland[0].island_id,
            has_island_name: Object.prototype.hasOwnProperty.call(itemsNeedingIsland[0], 'island_name'),
            island_name: itemsNeedingIsland[0].island_name
          } : null
        });
      }

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
                  const customerName = customer.customer_name || '';
                  const contactPerson = customer.contact_person || '';
                  const combinedName = contactPerson
                    ? `${customerName} - ${contactPerson}`
                    : customerName;
                  acc[customer.customer_id] = combinedName || null;
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

      // Get contact_person for all items with customer_id (even if customer_name already exists)
      if (allCustomerIds.length > 0) {
        try {
          const customers = await customerRepository.findByIds(allCustomerIds);
          if (Array.isArray(customers)) {
            contactPersonMap = customers.reduce((acc, customer) => {
              if (customer?.customer_id) {
                acc[customer.customer_id] = customer.contact_person || null;
              }
              return acc;
            }, {});
          }
        } catch (error) {
          Logger.error('[manage-quotation:getAll] gagal memuat contact_person', {
            customer_ids: allCustomerIds,
            message: error?.message
          });
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

      if (itemsNeedingIsland.length > 0) {
        const uniqueIslandIds = [
          ...new Set(itemsNeedingIsland.map((item) => item.island_id).filter(Boolean))
        ];

        if (uniqueIslandIds.length > 0) {
          try {
            const islands = await getIslandsByIds(uniqueIslandIds);
            if (Array.isArray(islands)) {
              islandMap = islands.reduce((acc, island) => {
                if (island?.island_id) {
                  acc[island.island_id] = island.island_name || null;
                }
                return acc;
              }, {});
            }
          } catch (error) {
            Logger.error('[manage-quotation:getAll] gagal memuat island fallback', {
              island_ids: uniqueIslandIds,
              message: error?.message
            });
          }
        }
      }

      data.items = data.items.map((item) => {
        if (!item) {
          return item;
        }

        let customerName = Object.prototype.hasOwnProperty.call(item, 'customer_name')
          ? item.customer_name
          : (item.customer_id ? customerMap[item.customer_id] ?? null : null);

        // Get contact_person from item or from contactPersonMap
        const contactPerson = item.contact_person || (item.customer_id ? contactPersonMap[item.customer_id] ?? null : null);

        // Combine customer_name with contact_person if contact_person exists
        if (customerName && contactPerson) {
          customerName = `${customerName} - ${contactPerson}`;
        } else if (!customerName && contactPerson) {
          customerName = contactPerson;
        }

        const employeeName = Object.prototype.hasOwnProperty.call(item, 'employee_name')
          ? item.employee_name
          : (item.employee_id ? employeeMap[item.employee_id] ?? null : null);

        // Always try to get island_name from item first, then from map
        let islandName = null;
        if (item.island_id) {
          // First check if island_name exists in the item (from dblink join)
          if (item.island_name !== undefined && item.island_name !== null) {
            islandName = item.island_name;
          } else {
            // Fallback to map if not in item
            islandName = islandMap[item.island_id] ?? null;
          }
        }

        let result = insertFieldAfterKey(item, 'customer_id', 'customer_name', customerName);
        result = insertFieldAfterKey(result, 'employee_id', 'employee_name', employeeName);
        result = insertFieldAfterKey(result, 'island_id', 'island_name', islandName);
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

    if (data.customer_id) {
      try {
        const customer = await customerRepository.findById(data.customer_id);
        if (customer) {
          const customerName = data.customer_name || customer?.customer_name || '';
          const contactPerson = data.contact_person || customer?.contact_person || '';
          data.customer_name = contactPerson
            ? `${customerName} - ${contactPerson}`
            : customerName || null;
        } else if (data.customer_name) {
          // If customer not found but customer_name exists, keep it as is
          data.customer_name = data.customer_name;
        } else {
          data.customer_name = null;
        }
      } catch (error) {
        Logger.error('[manage-quotation:getById] gagal memuat customer', {
          customer_id: data.customer_id,
          message: error?.message
        });
        // If error but customer_name exists, keep it as is
        if (!data.customer_name) {
          data.customer_name = null;
        }
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

    if (data.island_id && (data.island_name === undefined || data.island_name === null)) {
      try {
        const islands = await getIslandsByIds([data.island_id]);
        data.island_name = islands?.[0]?.island_name || null;
      } catch (error) {
        Logger.error('[manage-quotation:getById] gagal memuat island', {
          island_id: data.island_id,
          message: error?.message
        });
        data.island_name = null;
      }
    }

    // Get detail data
    const items = await repository.getItemsByQuotationId(id);
    // DISABLED: Tabel manage_quotation_item_accessories dan manage_quotation_item_specifications sudah dihapus
    // Data sekarang diambil dari kolom accesories_properties dan specification_properties (JSONB) di manage_quotation_items
    // const accessories = await repository.getAccessoriesByQuotationId(id);
    // const specifications = await repository.getSpecificationsByQuotationId(id);

    const itemsWithRelations = items.map((item) => {
      let itemAccessories = [];
      let itemSpecifications = [];

      // ACCESSORIES STRATEGY: Use accesories_properties from item
      if (item.accesories_properties) {
        let props = item.accesories_properties;
        if (typeof props === 'string') {
          try {
            props = JSON.parse(props);
          } catch (e) {
            props = [];
          }
        }

        if (Array.isArray(props) && props.length > 0) {
          itemAccessories = props.map(prop => ({
            manage_quotation_item_accessory_id: null, // Identifiers not available in snapshot
            manage_quotation_id: item.manage_quotation_id,
            accessory_id: prop.accessory_id,
            componen_product_id: prop.componen_product_id,
            quantity: prop.quantity,
            description: prop.accessory_description || prop.description,
            created_by: item.created_by,
            updated_by: item.updated_by,
            deleted_by: null,
            created_at: item.created_at, // Use item timestamp as proxy
            updated_at: item.updated_at,
            deleted_at: null,
            is_delete: false,
            // Enhanced properties from snapshot
            accessory_part_number: prop.accessory_part_number,
            accessory_part_name: prop.accessory_part_name,
            accessory_specification: prop.accessory_specification,
            accessory_brand: prop.accessory_brand,
            accessory_remark: prop.accessory_remark,
            accessory_region: prop.accessory_region,
            accessory_description: prop.accessory_description
          }));
        }
      }

      // SPECIFICATIONS STRATEGY: Use specification_properties from item
      if (item.specification_properties) {
        let props = item.specification_properties;
        if (typeof props === 'string') {
          try {
            props = JSON.parse(props);
          } catch (e) {
            props = [];
          }
        }

        if (Array.isArray(props) && props.length > 0) {
          itemSpecifications = props.map(prop => ({
            manage_quotation_item_specification_id: null,
            manage_quotation_id: item.manage_quotation_id,
            componen_product_id: prop.componen_product_id,
            manage_quotation_item_specification_label: prop.manage_quotation_item_specification_label,
            manage_quotation_item_specification_value: prop.manage_quotation_item_specification_value,
            created_by: item.created_by,
            updated_by: item.updated_by,
            deleted_by: null,
            created_at: item.created_at,
            updated_at: item.updated_at,
            deleted_at: null,
            is_delete: false,
            // Snapshot doesn't typically have extended CP fields, but we mapping what we have
          }));
        }
      }

      // Process cp_image to images and image_count
      const mappedImages = mapImageResponse(item.cp_image || item.cp_images);
      const itemImages = mappedImages; // Array of objects with image_id and image_url
      const itemImageCount = mappedImages.length; // Calculate from images array

      // Create new object
      const itemWithRelations = {
        ...item,
        componen_type: mapProductType(item.cp_componen_type) || '', // Get directly from componen_products table
        product_type: item.cp_product_type, // Get dir
        manage_quotation_item_accessories: itemAccessories,
        manage_quotation_item_specifications: itemSpecifications
      };

      // Insert images and image_count after cp_image
      const itemWithImages = insertFieldAfterKey(itemWithRelations, 'cp_image', 'images', itemImages);
      const itemWithImageCount = insertFieldAfterKey(itemWithImages, 'images', 'image_count', itemImageCount);

      return itemWithImageCount;
    });

    data.manage_quotation_items = itemsWithRelations;

    // Get term_content_title if term_content_id exists
    let termContentTitle = null;
    if (data.term_content_id) {
      try {
        const termContent = await termContentRepository.findById(data.term_content_id);
        termContentTitle = termContent?.term_content_title || null;
      } catch (error) {
        Logger.error('[manage-quotation:getById] gagal memuat term_content', {
          term_content_id: data.term_content_id,
          message: error?.message
        });
        termContentTitle = null;
      }
    }

    // Insert term_content_title after term_content_id
    if (data.term_content_id !== undefined) {
      const dataWithTermContentTitle = insertFieldAfterKey(data, 'term_content_id', 'term_content_title', termContentTitle);
      Object.assign(data, dataWithTermContentTitle);
    }

    // Format numeric fields: remove trailing zeros if all decimals are zero
    const numericFields = [
      'manage_quotation_grand_total',
      'manage_quotation_payment_nominal',
      'manage_quotation_grand_total_before',
      'manage_quotation_mutation_nominal'
    ];

    numericFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null) {
        let strVal = String(data[field]);
        if (strVal.includes('.')) {
          // Remove trailing zeros
          strVal = strVal.replace(/0+$/, '');
          // Remove trailing decimal point if it exists (e.g. "100." -> "100")
          if (strVal.endsWith('.')) {
            strVal = strVal.slice(0, -1);
          }
          data[field] = strVal;
        }
      }
    });

    // Parse properties JSONB if string
    if (data.properties && typeof data.properties === 'string') {
      try {
        data.properties = JSON.parse(data.properties);
      } catch (e) {
        data.properties = {};
      }
    } else if (!data.properties) {
      data.properties = {};
    }

    // Populate bank account fields from properties if not present or to ensure consistency
    if (data.properties) {
      if (data.properties.bank_account_id) data.bank_account_id = data.properties.bank_account_id;
      if (data.properties.bank_account_name) data.bank_account_name = data.properties.bank_account_name;
      if (data.properties.bank_account_number) data.bank_account_number = data.properties.bank_account_number;
      if (data.properties.bank_account_bank_name) data.bank_account_bank_name = data.properties.bank_account_bank_name;
    }

    // Use term_content_payload from database
    if (data.term_content_payload) {
      try {
        const parsed = JSON.parse(data.term_content_payload);
        data.term_content_payload = extractTermContentPayload(parsed);
      } catch (e) {
        data.term_content_payload = data.term_content_payload;
      }
    } else if (data.properties && data.properties.term_content_directory) {
      // Fallback to properties if payload empty (historical)
      data.term_content_payload = data.properties.term_content_directory;
    } else {
      data.term_content_payload = null;
    }

    // Remove images and image_count from main data (only keep in items)
    if (data.images !== undefined) {
      delete data.images;
    }
    if (data.image_count !== undefined) {
      delete data.image_count;
    }
    if (data.image !== undefined) {
      delete data.image;
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

    if (data.island_id) {
      try {
        const islands = await getIslandsByIds([data.island_id]);
        if (islands && islands.length > 0) {
          if (data.island_name === undefined || data.island_name === null) {
            data.island_name = islands[0]?.island_name || null;
          }
        }
      } catch (error) {
        Logger.error('[manage-quotation:getPdfById] gagal memuat island', {
          island_id: data.island_id,
          message: error?.message
        });
        if (data.island_name === undefined || data.island_name === null) {
          data.island_name = null;
        }
      }
    }

    // Get detail data
    const items = await repository.getItemsByQuotationId(id);
    // DISABLED: Tabel manage_quotation_item_accessories dan manage_quotation_item_specifications sudah dihapus
    // Data sekarang diambil dari kolom accesories_properties dan specification_properties (JSONB) di manage_quotation_items
    // const accessories = await repository.getAccessoriesByQuotationId(id);
    // const specifications = await repository.getSpecificationsByQuotationId(id);

    const itemsWithRelations = items.map((item) => {
      let itemAccessories = [];
      let itemSpecifications = [];

      // ACCESSORIES STRATEGY: Use accesories_properties from item
      if (item.accesories_properties) {
        let props = item.accesories_properties;
        if (typeof props === 'string') {
          try {
            props = JSON.parse(props);
          } catch (e) {
            props = [];
          }
        }

        if (Array.isArray(props) && props.length > 0) {
          itemAccessories = props.map(prop => ({
            manage_quotation_item_accessory_id: null, // Identifiers not available in snapshot
            manage_quotation_id: item.manage_quotation_id,
            accessory_id: prop.accessory_id,
            componen_product_id: prop.componen_product_id,
            quantity: prop.quantity,
            description: prop.accessory_description || prop.description,
            created_by: item.created_by,
            updated_by: item.updated_by,
            deleted_by: null,
            created_at: item.created_at, // Use item timestamp as proxy
            updated_at: item.updated_at,
            deleted_at: null,
            is_delete: false,
            // Enhanced properties from snapshot
            accessory_part_number: prop.accessory_part_number,
            accessory_part_name: prop.accessory_part_name,
            accessory_specification: prop.accessory_specification,
            accessory_brand: prop.accessory_brand,
            accessory_remark: prop.accessory_remark,
            accessory_region: prop.accessory_region,
            accessory_description: prop.accessory_description
          }));
        }
      }

      // SPECIFICATIONS STRATEGY: Use specification_properties from item
      if (item.specification_properties) {
        let props = item.specification_properties;
        if (typeof props === 'string') {
          try {
            props = JSON.parse(props);
          } catch (e) {
            props = [];
          }
        }

        if (Array.isArray(props) && props.length > 0) {
          itemSpecifications = props.map(prop => ({
            manage_quotation_item_specification_id: null,
            manage_quotation_id: item.manage_quotation_id,
            componen_product_id: prop.componen_product_id,
            manage_quotation_item_specification_label: prop.manage_quotation_item_specification_label,
            manage_quotation_item_specification_value: prop.manage_quotation_item_specification_value,
            created_by: item.created_by,
            updated_by: item.updated_by,
            deleted_by: null,
            created_at: item.created_at,
            updated_at: item.updated_at,
            deleted_at: null,
            is_delete: false,
          }));
        }
      }

      // Clean componen_product_name by removing "MSI[number] - " prefix and suffix
      // Get original value from item
      let cleanedProductName = item.componen_product_name;

      // Clean the product name if it exists
      if (cleanedProductName && typeof cleanedProductName === 'string') {
        // Remove "MSI[number] - " prefix and suffix using helper function
        cleanedProductName = cleanComponenProductName(cleanedProductName);
      }

      // Process cp_image to images and image_count
      const mappedImages = mapImageResponse(item.cp_image || item.cp_images);
      const itemImages = mappedImages; // Array of objects with image_id and image_url
      const itemImageCount = mappedImages.length; // Calculate from images array

      // Create new object, explicitly setting componen_product_name to cleaned value
      const cleanedItem = {
        ...item,
        componen_product_name: cleanedProductName, // Always use cleaned value
        componen_product_unit_model: item.cp_componen_product_unit_model || null,
        componen_type: mapProductType(item.cp_componen_type) || '', // Get directly from componen_products table
        product_type: item.cp_product_type, // Get directly from componen_products.product_type, fallback to mapping
        manage_quotation_item_accessories: itemAccessories,
        manage_quotation_item_specifications: itemSpecifications
      };

      // Insert images and image_count after cp_image
      const itemWithImages = insertFieldAfterKey(cleanedItem, 'cp_image', 'images', itemImages);
      const itemWithImageCount = insertFieldAfterKey(itemWithImages, 'images', 'image_count', itemImageCount);

      return itemWithImageCount;
    });

    // Final cleanup: ensure all componen_product_name in items are cleaned
    // This is the last chance to clean before setting to response
    const finalItems = itemsWithRelations.map((item) => {
      // Get current componen_product_name value
      let productName = item.componen_product_name;
      const originalProductName = productName; // Keep original for debugging

      // Clean if it's a string and not null/undefined
      if (productName && typeof productName === 'string') {
        // Use helper function to clean prefix and suffix
        productName = cleanComponenProductName(productName);

        // Debug log (can be removed later)
        if (originalProductName !== productName) {
          Logger.info('[manage-quotation:getPdfById] Cleaned componen_product_name', {
            original: originalProductName,
            cleaned: productName
          });
        }
      }

      // Return new object with cleaned componen_product_name - MUST override original
      // Preserve images and image_count if they exist
      return {
        ...item,
        componen_product_name: productName // Explicitly set cleaned value
        // images and image_count are already in item from previous mapping, they will be preserved by spread operator
      };
    });

    // Set final items to data.manage_quotation_items
    data.manage_quotation_items = finalItems;

    // Final aggressive cleanup: ensure ALL items in manage_quotation_items have cleaned componen_product_name
    // This is the absolute last step before sending response
    if (data.manage_quotation_items && Array.isArray(data.manage_quotation_items)) {
      data.manage_quotation_items = data.manage_quotation_items.map((item) => {
        if (item && item.componen_product_name && typeof item.componen_product_name === 'string') {
          // Use helper function to clean prefix and suffix
          const productName = cleanComponenProductName(item.componen_product_name);

          return {
            ...item,
            componen_product_name: productName
          };
        }
        return item;
      });
    }

    // Debug: Verify finalItems has cleaned names
    Logger.info('[manage-quotation:getPdfById] Final cleanup completed', {
      itemsCount: data.manage_quotation_items?.length || 0,
      firstItemProductName: data.manage_quotation_items?.[0]?.componen_product_name || 'N/A'
    });

    // Parse properties JSONB if string
    if (data.properties && typeof data.properties === 'string') {
      try {
        data.properties = JSON.parse(data.properties);
      } catch (e) {
        data.properties = {};
      }
    } else if (!data.properties) {
      data.properties = {};
    }

    // Populate data from properties if available
    if (data.properties) {
      // Bank Account details
      if (data.properties.bank_account_id) data.bank_account_id = data.properties.bank_account_id;
      if (data.properties.bank_account_name) data.bank_account_name = data.properties.bank_account_name;
      if (data.properties.bank_account_number) data.bank_account_number = data.properties.bank_account_number;
      if (data.properties.bank_account_bank_name) data.bank_account_bank_name = data.properties.bank_account_bank_name;

      // Customer details preference from properties as it is historical snapshot
      if (data.properties.customer_phone) data.customer_phone = data.properties.customer_phone;
      if (data.properties.customer_address) data.customer_address = data.properties.customer_address;
      if (data.properties.contact_person) data.contact_person = data.properties.contact_person;

      // Employee details preference from properties
      if (data.properties.employee_phone) data.employee_phone = data.properties.employee_phone;
    }

    // Use term_content_directory from properties as term_content_payload if available (it contains HTML content)
    // Otherwise fall back to reading file
    // Use term_content_payload from database
    if (data.term_content_payload) {
      // It should be a string in DB (text column), but postgre driver might return it as is.
      // If it's a JSON string, extractTermContentPayload might need adjustment or usage.
      // Actually extractTermContentPayload handles parsing if it's already an object? 
      // No, extractTermContentPayload expects object or string and returns string. 
      // We want to return object to frontend usually? Or string?
      // Previous implementation: data.term_content_payload = extractTermContentPayload(payload);
      // payload comes from readJsonFile which does JSON.parse.
      // So payload is Object. extractTermContentPayload converts Object -> String/JSON String.
      // So validation/frontend expects String?
      // Let's check extractTermContentPayload implementation.
      // It returns a string.

      // If payload is already text in DB, we can just use it, or ensure it's in the right format.
      // If it was saved as JSON string, we might want to return it as is because frontend expects string (HTML or JSON string)?
      // Re-reading extractTermContentPayload:
      // if object has content prop, return content (string).
      // else JSON.stringify.

      let payload = data.term_content_payload;
      try {
        // Try to parse to see if it follows the {content: "..."} structure
        const parsed = JSON.parse(payload);
        data.term_content_payload = extractTermContentPayload(parsed);
      } catch (e) {
        // If not JSON, use as is
        data.term_content_payload = payload;
      }
    } else if (data.properties && data.properties.term_content_directory) {
      // Fallback to properties if payload empty (historical)
      // Note: we renamed/mapped properties.term_content_directory to payload in previous logic if it was simple string
      data.term_content_payload = data.properties.term_content_directory;
    }


    // Format numeric fields: remove trailing zeros if all decimals are zero
    const numericFields = [
      'manage_quotation_grand_total',
      'manage_quotation_payment_nominal',
      'manage_quotation_grand_total_before',
      'manage_quotation_mutation_nominal'
    ];

    numericFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null) {
        let strVal = String(data[field]);
        if (strVal.includes('.')) {
          // Remove trailing zeros
          strVal = strVal.replace(/0+$/, '');
          // Remove trailing decimal point if it exists (e.g. "100." -> "100")
          if (strVal.endsWith('.')) {
            strVal = strVal.slice(0, -1);
          }
          data[field] = strVal;
        }
      }
    });

    // Remove images and image_count from main data (only keep in items)
    if (data.images !== undefined) {
      delete data.images;
    }
    if (data.image_count !== undefined) {
      delete data.image_count;
    }
    if (data.image !== undefined) {
      delete data.image;
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

    // For properties generation, we'll keep using term_content_directory variable passed from body
    // But for DB insert we use term_content_payload, and set directory to null
    if (term_content_directory !== undefined && term_content_directory !== null) {
      const normalized = normalizeJsonPayload(term_content_directory);
      quotationData.term_content_payload = JSON.stringify(normalized);
      quotationData.term_content_directory = null;
    } else {
      quotationData.term_content_payload = null;
      quotationData.term_content_directory = null;
    }

    const hasItemsArray = Array.isArray(manage_quotation_items);
    const itemsForProcessing = hasItemsArray ? manage_quotation_items : [];
    const itemsForInsert = [];
    const accessoriesForInsert = [];
    const specificationsForInsert = [];

    // Pre-fetch accessories details for properties
    const accessoryDetailsMap = await getAccessoryDetailsMap(itemsForProcessing);

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

        // Prepare properties snapshots
        const specificationProperties = (itemSpecifications || []).map(spec => ({
          manage_quotation_id: null, // Will be injected in repository
          componen_product_id: spec.componen_product_id || itemFields.componen_product_id,
          manage_quotation_item_specification_label: spec.manage_quotation_item_specification_label,
          manage_quotation_item_specification_value: spec.manage_quotation_item_specification_value
        }));

        const accesoriesProperties = (itemAccessories || []).map(acc => {
          const detail = accessoryDetailsMap[acc.accessory_id] || {};
          return {
            manage_quotation_id: null, // Will be injected in repository
            accessory_id: acc.accessory_id,
            quantity: acc.quantity,
            accessory_part_number: detail.accessory_part_number,
            accessory_part_name: detail.accessory_part_name,
            accessory_specification: detail.accessory_specification,
            accessory_brand: detail.accessory_brand,
            accessory_remark: detail.accessory_remark,
            accessory_region: detail.accessory_region,
            accessory_description: detail.accessory_description,
            componen_product_id: acc.componen_product_id || itemFields.componen_product_id
          };
        });

        itemsForInsert.push({
          ...itemFields,
          specification_properties: specificationProperties,
          accesories_properties: accesoriesProperties
        });

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
      // Normalize term_content_id: convert empty string, "NaN", or null to null
      if (term_content_id === null || term_content_id === '' || term_content_id === 'NaN' || (typeof term_content_id === 'string' && term_content_id.trim() === '')) {
        quotationData.term_content_id = null;
      } else {
        quotationData.term_content_id = term_content_id;
      }
    }

    await db.transaction(async (trx) => {
      createdQuotation = await repository.create(quotationData, trx);
      logStep('transaction.createQuotation', 'success', {
        manage_quotation_id: createdQuotation.manage_quotation_id,
        manage_quotation_no: createdQuotation.manage_quotation_no
      });

      if (quotationData.term_content_payload) {
        logStep('transaction.termContent.write', 'success', { payloadLength: quotationData.term_content_payload.length });
      } else {
        logStep('transaction.termContent.write', 'skipped', { reason: 'no term_content_directory provided' });
      }

      if (itemsForInsert.length > 0) {
        await repository.createItems(createdQuotation.manage_quotation_id, itemsForInsert, tokenData.created_by, trx);
        logStep('transaction.items.create', 'success', { count: itemsForInsert.length });
      } else {
        logStep('transaction.items.create', 'skipped', { reason: 'no items to insert' });
      }

    });

    if (createdQuotation?.term_content_payload) {
      try {
        const parsed = JSON.parse(createdQuotation.term_content_payload);
        createdQuotation.term_content_payload = extractTermContentPayload(parsed);
      } catch (e) { }
      logStep('postProcess.termContent.read', 'success', { hasPayload: true });
    }

    const response = mappingSuccess('Data berhasil dibuat', createdQuotation, 201);
    response.data.logs = processLogs;
    return baseResponse(res, response);
  } catch (error) {
    logStep('process.failed', 'error', { message: error.message });

    const response = mappingError(error);
    response.data.logs = processLogs;
    return baseResponse(res, response);
  }
};

/**
 * Update existing manage quotation
 */
const update = async (req, res) => {
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

    // Pre-fetch accessories details for properties
    const accessoryDetailsMap = await getAccessoryDetailsMap(itemsForProcessing);

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

        // Prepare properties snapshots
        const specificationProperties = (itemSpecifications || []).map(spec => ({
          manage_quotation_id: null,
          componen_product_id: spec.componen_product_id || itemFields.componen_product_id,
          manage_quotation_item_specification_label: spec.manage_quotation_item_specification_label,
          manage_quotation_item_specification_value: spec.manage_quotation_item_specification_value
        }));

        const accesoriesProperties = (itemAccessories || []).map(acc => {
          const detail = accessoryDetailsMap[acc.accessory_id] || {};
          return {
            manage_quotation_id: null,
            accessory_id: acc.accessory_id,
            quantity: acc.quantity,
            accessory_part_number: detail.accessory_part_number,
            accessory_part_name: detail.accessory_part_name,
            accessory_specification: detail.accessory_specification,
            accessory_brand: detail.accessory_brand,
            accessory_remark: detail.accessory_remark,
            accessory_region: detail.accessory_region,
            accessory_description: detail.accessory_description,
            componen_product_id: acc.componen_product_id || itemFields.componen_product_id
          };
        });

        itemsForInsert.push({
          ...itemFields,
          specification_properties: specificationProperties,
          accesories_properties: accesoriesProperties
        });

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
      // Normalize term_content_id: convert empty string, "NaN", or null to null
      if (term_content_id === null || term_content_id === '' || term_content_id === 'NaN' || (typeof term_content_id === 'string' && term_content_id.trim() === '')) {
        quotationData.term_content_id = null;
      } else {
        quotationData.term_content_id = term_content_id;
      }
    }

    // Handle term_content_directory - convert to payload
    if (term_content_directory !== undefined) {
      // Store original content for properties generation (handled in repository if passed)
      quotationData.properties_term_content_directory = term_content_directory;

      if (term_content_directory !== null && term_content_directory !== '') {
        const normalized = normalizeJsonPayload(term_content_directory);
        quotationData.term_content_payload = JSON.stringify(normalized);
        quotationData.term_content_directory = null;
      } else {
        quotationData.term_content_payload = null;
        quotationData.term_content_directory = null;
      }
    } else if (quotationData.term_content_directory === undefined) {
      // If not provided in body, check if we need to preserve valid content or migration?
      // Actually if undefined, we don't update it. Repository handles `undefined`.
      // But if we want to ensure payload is set if only directory existed before?
      // Repository update logic:
      // if (data.term_content_payload !== undefined) updateFields.term_content_payload = data.term_content_payload;
      // So we are good.
    }

    // Add updated_by
    quotationData.updated_by = tokenData.updated_by;

    // Update quotation
    const data = await repository.update(id, quotationData);

    if (!data) {
      const response = mappingError('Data tidak ditemukan', 404);
      return baseResponse(res, response);
    }

    // Update items jika array disediakan (termasuk kosong untuk reset)
    if (itemsProvided) {
      await repository.replaceItems(id, itemsForInsert, tokenData.updated_by);
    }

    // Update accessories logic removed - using item properties instead

    // Return payload
    if (data.term_content_payload) {
      try {
        const parsed = JSON.parse(data.term_content_payload);
        data.term_content_payload = extractTermContentPayload(parsed);
      } catch (e) {
        // use as is
      }
    } else if (data.term_content_directory) {
      // Backward compatibility if payload null but directory exists (and we didn't migrate old files)
      // Since we removed readJsonFile, we can't read it.
      // Assuming we rely on payload from now on or the migration handled it?
      // The user didn't ask to migrate old files, but "di proses CRUD".
      // If we want to support old files, we'd need to keep readJsonFile. 
      // But user implied "dia masih membuat file json", implying we should stop.
      // I will assume for GET/Update response we return what we have in DB.
      data.term_content_payload = null;
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

/**
 * Duplicate manage quotation
 */
const duplikat = async (req, res) => {
  try {
    const { manage_quotation_id } = req.params;

    // Get user info from token
    const tokenData = decodeToken('created', req);

    // Validate token data
    if (!tokenData.created_by || tokenData.created_by === '') {
      Logger.error('[manage-quotation:duplikat] invalid token data', { tokenData });
      const response = mappingError('Token tidak valid atau tidak memiliki informasi user', 401);
      return baseResponse(res, response);
    }

    // Check if source quotation exists
    const sourceQuotation = await repository.findById(manage_quotation_id);
    if (!sourceQuotation) {
      const response = mappingError('Quotation tidak ditemukan', 404);
      return baseResponse(res, response);
    }

    // Duplicate quotation within transaction
    let duplicatedQuotation = null;
    await db.transaction(async (trx) => {
      duplicatedQuotation = await repository.duplicateQuotation(
        manage_quotation_id,
        tokenData.created_by,
        trx
      );
    });

    // Get full data with relations
    const data = await repository.findById(duplicatedQuotation.manage_quotation_id);

    // Get detail data
    const items = await repository.getItemsByQuotationId(duplicatedQuotation.manage_quotation_id);
    // DISABLED: Tabel manage_quotation_item_accessories dan manage_quotation_item_specifications sudah dihapus
    // Data sekarang diambil dari kolom accesories_properties dan specification_properties (JSONB) di manage_quotation_items
    // const accessories = await repository.getAccessoriesByQuotationId(duplicatedQuotation.manage_quotation_id);
    // const specifications = await repository.getSpecificationsByQuotationId(duplicatedQuotation.manage_quotation_id);

    const itemsWithRelations = items.map((item) => {
      let itemAccessories = [];
      let itemSpecifications = [];

      // ACCESSORIES STRATEGY: Use accesories_properties from item
      if (item.accesories_properties) {
        let props = item.accesories_properties;
        if (typeof props === 'string') {
          try {
            props = JSON.parse(props);
          } catch (e) {
            props = [];
          }
        }

        if (Array.isArray(props) && props.length > 0) {
          itemAccessories = props.map(prop => ({
            manage_quotation_item_accessory_id: null,
            manage_quotation_id: item.manage_quotation_id,
            accessory_id: prop.accessory_id,
            componen_product_id: prop.componen_product_id,
            quantity: prop.quantity,
            description: prop.accessory_description || prop.description,
            created_by: item.created_by,
            updated_by: item.updated_by,
            deleted_by: null,
            created_at: item.created_at,
            updated_at: item.updated_at,
            deleted_at: null,
            is_delete: false,
            accessory_part_number: prop.accessory_part_number,
            accessory_part_name: prop.accessory_part_name,
            accessory_specification: prop.accessory_specification,
            accessory_brand: prop.accessory_brand,
            accessory_remark: prop.accessory_remark,
            accessory_region: prop.accessory_region,
            accessory_description: prop.accessory_description
          }));
        }
      }

      // SPECIFICATIONS STRATEGY: Use specification_properties from item
      if (item.specification_properties) {
        let props = item.specification_properties;
        if (typeof props === 'string') {
          try {
            props = JSON.parse(props);
          } catch (e) {
            props = [];
          }
        }

        if (Array.isArray(props) && props.length > 0) {
          itemSpecifications = props.map(prop => ({
            manage_quotation_item_specification_id: null,
            manage_quotation_id: item.manage_quotation_id,
            componen_product_id: prop.componen_product_id,
            manage_quotation_item_specification_label: prop.manage_quotation_item_specification_label,
            manage_quotation_item_specification_value: prop.manage_quotation_item_specification_value,
            created_by: item.created_by,
            updated_by: item.updated_by,
            deleted_by: null,
            created_at: item.created_at,
            updated_at: item.updated_at,
            deleted_at: null,
            is_delete: false,
          }));
        }
      }

      const productType = mapProductType(item.cp_componen_type);

      return {
        ...item,
        product_type: productType,
        manage_quotation_item_accessories: itemAccessories,
        manage_quotation_item_specifications: itemSpecifications
      };
    });

    data.manage_quotation_items = itemsWithRelations;

    // Handle term content payload
    if (data.term_content_payload) {
      try {
        const parsed = JSON.parse(data.term_content_payload);
        data.term_content_payload = extractTermContentPayload(parsed);
      } catch (e) { }
    } else if (data.term_content_directory) {
      // Legacy file support removed, return null or try to read if fs was kept? 
      // We removed fs, so we return null.
      data.term_content_payload = null;
    }

    const response = mappingSuccess('Data berhasil diduplikat', data, 201);
    return baseResponse(res, response);
  } catch (error) {
    Logger.error('[manage-quotation:duplikat] duplikat failed', {
      manage_quotation_id: req.params?.manage_quotation_id,
      error: error.message,
      stack: error.stack
    });

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
  restore,
  duplikat
};
