const path = require('path');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
const repository = require('./postgre_repository');
const { baseResponse, mappingError, mappingSuccess } = require('../../utils');
const { decodeToken } = require('../../utils/auth');
const { uploadToMinio, isMinioEnabled } = require('../../config/minio');
const { generateFolder } = require('../../utils/folder');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images only
const imageFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diizinkan (jpg, jpeg, png, gif, webp)'), false);
  }
};

// Configure multer for images
const upload = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware for single image upload (backward compatibility)
const uploadImage = upload.single('image');

// Middleware for multiple images upload
// Support both formats: 'images' (multiple with same name) and 'images[0]', 'images[1]', etc.
const uploadImages = upload.any();

// Helper function to upload image to MinIO
const uploadImageToStorage = async (file, folderPath = 'componen_products') => {
  if (!file || !isMinioEnabled) {
    return null;
  }

  try {
    const bucketName = process.env.S3_BUCKET || process.env.MINIO_BUCKET;
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const fileName = `componen-product-${timestamp}${extension}`;
    
    const { pathForDatabase } = generateFolder(folderPath);
    const objectName = `${pathForDatabase}${fileName}`;
    
    const uploadResult = await uploadToMinio(objectName, file.buffer, file.mimetype, bucketName);
    
    if (uploadResult.success) {
      return uploadResult.url;
    }
    
    return null;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

// Helper function to upload multiple images to MinIO
const uploadMultipleImagesToStorage = async (files, folderPath = 'componen_products') => {
  if (!files || !Array.isArray(files) || files.length === 0 || !isMinioEnabled) {
    return [];
  }

  const uploadPromises = files.map((file) => uploadImageToStorage(file, folderPath));
  const results = await Promise.all(uploadPromises);
  
  // Filter out null results (failed uploads)
  return results.filter(url => url !== null);
};

// Middleware wrapper to handle multer errors for single image
const handleImageUpload = (req, res, next) => {
  uploadImage(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File terlalu besar. Maksimal 5MB.',
          error: err.message
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Error upload file',
        error: err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Error validasi file',
        error: err.message
      });
    }
    next();
  });
};

// Middleware wrapper to handle multer errors for multiple images
const handleMultipleImagesUpload = (req, res, next) => {
  uploadImages(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File terlalu besar. Maksimal 5MB per file.',
          error: err.message
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Terlalu banyak file. Maksimal 50 file.',
          error: err.message
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Error upload file',
        error: err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Error validasi file',
        error: err.message
      });
    }
    
    // Process files to support both formats: 'images' and 'images[0]', 'images[1]', etc.
    if (req.files && Array.isArray(req.files)) {
      // Filter and organize image files
      const imageFiles = req.files.filter(file => {
        // Support both 'images' and 'images[0]', 'images[1]', etc.
        return file.fieldname === 'images' || /^images\[\d+\]$/.test(file.fieldname);
      });
      
      // Sort by fieldname if using indexed format (images[0], images[1], etc.)
      imageFiles.sort((a, b) => {
        const aMatch = a.fieldname.match(/\[(\d+)\]/);
        const bMatch = b.fieldname.match(/\[(\d+)\]/);
        if (aMatch && bMatch) {
          return parseInt(aMatch[1]) - parseInt(bMatch[1]);
        }
        return 0;
      });
      
      // Organize into req.files.images for backward compatibility
      if (imageFiles.length > 0) {
        req.files.images = imageFiles;
      }
    }
    
    next();
  });
};

/**
 * Map sort_by from API format to database column format
 */
const mapSortBy = (sortBy) => {
  const mapping = {
    'created_at': 'created_at',
    'code_unique': 'code_unique',
    'componen_product_name': 'componen_product_name',
    'segment': 'segment',
    'msi_model': 'msi_model',
    'msi_product': 'msi_product',
    'volume': 'volume',
    'componen_product_unit_model': 'componen_product_unit_model',
    'product_type': 'product_type'
  };
  return mapping[sortBy] || 'created_at';
};

/**
 * Generate componen_product_name based on format:
 * code_unique - msi_product wheel_no engine msi_model volume - segment
 */
const generateComponenProductName = (data) => {
  const parts = [];
  
  // code_unique
  const codeUnique = data.code_unique ? String(data.code_unique).trim() : null;
  
  // Middle parts: msi_product wheel_no engine msi_model volume
  const middleParts = [];
  if (data.msi_product) middleParts.push(String(data.msi_product).trim());
  if (data.wheel_no) middleParts.push(String(data.wheel_no).trim());
  if (data.engine) middleParts.push(String(data.engine).trim());
  if (data.msi_model) middleParts.push(String(data.msi_model).trim());
  if (data.volume) middleParts.push(String(data.volume).trim());
  
  // segment
  const segment = data.segment ? String(data.segment).trim() : null;
  
  // Build the name according to format: code_unique - msi_product wheel_no engine msi_model volume - segment
  if (codeUnique) {
    parts.push(codeUnique);
  }
  
  if (middleParts.length > 0) {
    if (parts.length > 0) {
      parts.push('-');
    }
    parts.push(middleParts.join(' '));
  }
  
  if (segment) {
    if (parts.length > 0) {
      parts.push('-');
    }
    parts.push(segment);
  }
  
  const result = parts.join(' ').trim();
  
  // Return empty string if no valid parts, otherwise return the formatted name
  return result || null;
};

/**
 * Parse and normalize specifications payload from request body
 */
const parseSpecificationsInput = (rawInput) => {
  if (rawInput === undefined) {
    return {
      provided: false,
      items: []
    };
  }

  let parsedInput = rawInput;

  if (typeof parsedInput === 'string') {
    const trimmed = parsedInput.trim();

    if (trimmed === '') {
      return {
        provided: true,
        items: []
      };
    }

    try {
      parsedInput = JSON.parse(trimmed);
    } catch (error) {
      const formatError = new Error('Format componen_product_specifications harus berupa JSON yang valid');
      formatError.statusCode = 400;
      throw formatError;
    }
  }

  if (!Array.isArray(parsedInput)) {
    parsedInput = [parsedInput];
  }

  const normalized = parsedInput
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const labelRaw = item.componen_product_specification_label ?? item.label ?? null;
      const valueRaw = item.componen_product_specification_value ?? item.value ?? null;
      const descriptionRaw = item.componen_product_specification_description ?? item.description ?? null;

      return {
        componen_product_specification_label: labelRaw !== null && labelRaw !== undefined ? String(labelRaw).trim() || null : null,
        componen_product_specification_value: valueRaw !== null && valueRaw !== undefined ? String(valueRaw).trim() || null : null,
        componen_product_specification_description: descriptionRaw !== null && descriptionRaw !== undefined ? String(descriptionRaw).trim() || null : null
      };
    })
    .filter(
      (item) =>
        item.componen_product_specification_label !== null ||
        item.componen_product_specification_value !== null ||
        item.componen_product_specification_description !== null
    );

  return {
    provided: true,
    items: normalized
  };
};

/**
 * Get all componen products with pagination, search, and sort
 */
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sort_by = 'created_at', sort_order = 'desc', company_name } = req.body;
    
    const offset = (page - 1) * limit;
    
    // Normalize company_name
    let normalizedCompanyName = null;
    if (company_name !== undefined && company_name !== null && company_name !== '') {
      const companyNameStr = String(company_name).trim();
      if (companyNameStr !== '' && companyNameStr !== 'NaN' && companyNameStr !== 'null') {
        normalizedCompanyName = companyNameStr;
      }
    }
    
    const params = {
      page,
      limit,
      offset,
      search,
      sortBy: mapSortBy(sort_by),
      sortOrder: sort_order,
      companyName: normalizedCompanyName
    };
    
    const data = await repository.findAll(params);
    const response = mappingSuccess('Data componen product berhasil diambil', data);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Get single componen product by ID
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await repository.findById(id);
    
    if (!data) {
      const response = mappingError('Data componen product tidak ditemukan', 404);
      return baseResponse(res, response);
    }
    
    const response = mappingSuccess('Data componen product berhasil diambil', data);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Create new componen product
 */
const create = async (req, res) => {
  try {
    // Get user info from token
    const tokenData = decodeToken('created', req);
    
    // Handle multiple images upload
    let imageUrls = null;
    
    // Check for multiple images (new format)
    if (req.files && req.files.images && Array.isArray(req.files.images) && req.files.images.length > 0) {
      console.log(`Uploading ${req.files.images.length} images to MinIO...`);
      const uploadedUrls = await uploadMultipleImagesToStorage(req.files.images);
      
      if (uploadedUrls.length > 0) {
        imageUrls = uploadedUrls;
        console.log(`${uploadedUrls.length} images uploaded successfully`);
      } else {
        console.warn('Failed to upload images to MinIO, but continuing with create');
      }
      
      // Validate image_count if provided
      if (req.body.image_count !== undefined) {
        const expectedCount = parseInt(req.body.image_count, 10);
        if (!isNaN(expectedCount) && uploadedUrls.length !== expectedCount) {
          console.warn(`Image count mismatch: expected ${expectedCount}, uploaded ${uploadedUrls.length}`);
        }
      }
    }
    // Backward compatibility: check for single image (old format)
    else if (req.file) {
      console.log('Uploading single image to MinIO...');
      const imageUrl = await uploadImageToStorage(req.file);
      if (imageUrl) {
        imageUrls = [imageUrl];
        console.log('Image uploaded successfully:', imageUrl);
      } else {
        console.warn('Failed to upload image to MinIO, but continuing with create');
      }
    }
    // If image URL(s) provided directly as string or JSON array
    else if (req.body.image !== undefined) {
      try {
        // Try to parse as JSON array
        const parsed = typeof req.body.image === 'string' ? JSON.parse(req.body.image) : req.body.image;
        if (Array.isArray(parsed)) {
          imageUrls = parsed;
        } else {
          imageUrls = [req.body.image];
        }
      } catch (e) {
        // If not JSON, treat as single URL string
        imageUrls = [req.body.image];
      }
    }
    
    // Normalize company_name
    let normalizedCompanyName = null;
    if (req.body.company_name && req.body.company_name !== '' && req.body.company_name !== null && req.body.company_name !== undefined) {
      const companyNameStr = String(req.body.company_name).trim();
      if (companyNameStr !== '') {
        normalizedCompanyName = companyNameStr;
      }
    }

    // Normalize product_type
    let normalizedProductType = null;
    if (req.body.product_type && req.body.product_type !== '' && req.body.product_type !== null && req.body.product_type !== undefined) {
      const productTypeStr = String(req.body.product_type).trim();
      if (productTypeStr !== '' && productTypeStr !== 'NaN' && productTypeStr !== 'null') {
        normalizedProductType = productTypeStr;
      }
    }

    // Convert imageUrls array to JSON string for database storage
    const imageData = imageUrls && imageUrls.length > 0 ? JSON.stringify(imageUrls) : null;
    
    const componenProductData = {
      componen_type: req.body.componen_type ? parseInt(req.body.componen_type) : null,
      company_name: normalizedCompanyName,
      product_type: normalizedProductType,
      code_unique: req.body.code_unique || null,
      segment: req.body.segment || null,
      msi_model: req.body.msi_model || null,
      msi_product: req.body.msi_product || null,
      wheel_no: req.body.wheel_no || null,
      engine: req.body.engine || null,
      horse_power: req.body.horse_power || null,
      componen_product_unit_model: req.body.componen_product_unit_model || null,
      volume: req.body.volume || null,
      market_price: req.body.market_price || null,
      selling_price_star_1: req.body.selling_price_star_1 || null,
      selling_price_star_2: req.body.selling_price_star_2 || null,
      selling_price_star_3: req.body.selling_price_star_3 || null,
      selling_price_star_4: req.body.selling_price_star_4 || null,
      selling_price_star_5: req.body.selling_price_star_5 || null,
      image: imageData,
      componen_product_description: req.body.componen_product_description || null,
      created_by: tokenData.created_by
    };
    
    // Generate componen_product_name if not provided
    if (req.body.componen_product_name) {
      componenProductData.componen_product_name = req.body.componen_product_name;
    } else {
      componenProductData.componen_product_name = generateComponenProductName(componenProductData) || null;
    }

    const specificationsPayload = parseSpecificationsInput(req.body.componen_product_specifications);
    
    const data = await repository.create(componenProductData, specificationsPayload.items);
    const response = mappingSuccess('Data componen product berhasil dibuat', data, 201);
    return baseResponse(res, response);
  } catch (error) {
    console.error('Error creating componen product:', error);
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Update existing componen product
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user info from token
    const tokenData = decodeToken('updated', req);
    
    // Get existing data
    const existing = await repository.findById(id);
    if (!existing) {
      const response = mappingError('Data componen product tidak ditemukan', 404);
      return baseResponse(res, response);
    }
    
    // Handle multiple images upload
    let imageUrls = undefined;
    
    // Check for multiple images (new format)
    if (req.files && req.files.images && Array.isArray(req.files.images) && req.files.images.length > 0) {
      console.log(`Uploading ${req.files.images.length} new images to MinIO...`);
      const uploadedUrls = await uploadMultipleImagesToStorage(req.files.images);
      
      if (uploadedUrls.length > 0) {
        imageUrls = uploadedUrls;
        console.log(`${uploadedUrls.length} images uploaded successfully`);
      } else {
        console.warn('Failed to upload images to MinIO, keeping existing images');
        imageUrls = undefined;
      }
      
      // Validate image_count if provided
      if (req.body.image_count !== undefined) {
        const expectedCount = parseInt(req.body.image_count, 10);
        if (!isNaN(expectedCount) && uploadedUrls.length !== expectedCount) {
          console.warn(`Image count mismatch: expected ${expectedCount}, uploaded ${uploadedUrls.length}`);
        }
      }
    }
    // Backward compatibility: check for single image (old format)
    else if (req.file) {
      console.log('Uploading new single image to MinIO...');
      const imageUrl = await uploadImageToStorage(req.file);
      if (imageUrl) {
        imageUrls = [imageUrl];
        console.log('New image uploaded successfully:', imageUrl);
      } else {
        console.warn('Failed to upload image to MinIO, keeping existing image');
        imageUrls = undefined;
      }
    }
    // If image URL(s) provided directly as string or JSON array
    else if (req.body.image !== undefined) {
      try {
        // Try to parse as JSON array
        const parsed = typeof req.body.image === 'string' ? JSON.parse(req.body.image) : req.body.image;
        if (Array.isArray(parsed)) {
          imageUrls = parsed;
        } else {
          imageUrls = [req.body.image];
        }
      } catch (e) {
        // If not JSON, treat as single URL string
        imageUrls = [req.body.image];
      }
    }
    
    // Normalize company_name if provided
    let normalizedCompanyName = undefined;
    if (req.body.company_name !== undefined) {
      if (req.body.company_name && req.body.company_name !== '' && req.body.company_name !== null) {
        const companyNameStr = String(req.body.company_name).trim();
        if (companyNameStr !== '') {
          normalizedCompanyName = companyNameStr;
        } else {
          normalizedCompanyName = null;
        }
      } else {
        normalizedCompanyName = null;
      }
    }

    // Normalize product_type if provided
    let normalizedProductType = undefined;
    if (req.body.product_type !== undefined) {
      if (req.body.product_type && req.body.product_type !== '' && req.body.product_type !== null) {
        const productTypeStr = String(req.body.product_type).trim();
        if (productTypeStr !== '' && productTypeStr !== 'NaN' && productTypeStr !== 'null') {
          normalizedProductType = productTypeStr;
        } else {
          normalizedProductType = null;
        }
      } else {
        normalizedProductType = null;
      }
    }

    // Convert imageUrls array to JSON string for database storage if provided
    let imageData = undefined;
    if (imageUrls !== undefined) {
      imageData = imageUrls && imageUrls.length > 0 ? JSON.stringify(imageUrls) : null;
    }
    
    const componenProductData = {
      componen_type: req.body.componen_type !== undefined ? (req.body.componen_type ? parseInt(req.body.componen_type) : null) : undefined,
      company_name: normalizedCompanyName,
      product_type: normalizedProductType,
      code_unique: req.body.code_unique,
      segment: req.body.segment,
      msi_model: req.body.msi_model,
      msi_product: req.body.msi_product,
      wheel_no: req.body.wheel_no,
      engine: req.body.engine,
      horse_power: req.body.horse_power,
      componen_product_unit_model: req.body.componen_product_unit_model,
      volume: req.body.volume,
      market_price: req.body.market_price,
      selling_price_star_1: req.body.selling_price_star_1,
      selling_price_star_2: req.body.selling_price_star_2,
      selling_price_star_3: req.body.selling_price_star_3,
      selling_price_star_4: req.body.selling_price_star_4,
      selling_price_star_5: req.body.selling_price_star_5,
      componen_product_description: req.body.componen_product_description,
      updated_by: tokenData.updated_by
    };
    
    // Generate componen_product_name if not provided or if relevant fields are updated
    if (req.body.componen_product_name !== undefined) {
      // If explicitly provided, use it
      if (req.body.componen_product_name === null || req.body.componen_product_name === '') {
        // If set to null/empty, generate from current data
        const dataForGeneration = {
          code_unique: req.body.code_unique !== undefined ? req.body.code_unique : existing.code_unique,
          msi_product: req.body.msi_product !== undefined ? req.body.msi_product : existing.msi_product,
          wheel_no: req.body.wheel_no !== undefined ? req.body.wheel_no : existing.wheel_no,
          engine: req.body.engine !== undefined ? req.body.engine : existing.engine,
          msi_model: req.body.msi_model !== undefined ? req.body.msi_model : existing.msi_model,
          volume: req.body.volume !== undefined ? req.body.volume : existing.volume,
          segment: req.body.segment !== undefined ? req.body.segment : existing.segment
        };
        componenProductData.componen_product_name = generateComponenProductName(dataForGeneration) || null;
      } else {
        componenProductData.componen_product_name = req.body.componen_product_name;
      }
    } else {
      // If not provided, check if any relevant field is being updated
      const relevantFields = ['code_unique', 'msi_product', 'wheel_no', 'engine', 'msi_model', 'volume', 'segment'];
      const isRelevantFieldUpdated = relevantFields.some(field => req.body[field] !== undefined);
      
      if (isRelevantFieldUpdated) {
        // Generate from updated data, using existing values for fields not updated
        const dataForGeneration = {
          code_unique: req.body.code_unique !== undefined ? req.body.code_unique : existing.code_unique,
          msi_product: req.body.msi_product !== undefined ? req.body.msi_product : existing.msi_product,
          wheel_no: req.body.wheel_no !== undefined ? req.body.wheel_no : existing.wheel_no,
          engine: req.body.engine !== undefined ? req.body.engine : existing.engine,
          msi_model: req.body.msi_model !== undefined ? req.body.msi_model : existing.msi_model,
          volume: req.body.volume !== undefined ? req.body.volume : existing.volume,
          segment: req.body.segment !== undefined ? req.body.segment : existing.segment
        };
        componenProductData.componen_product_name = generateComponenProductName(dataForGeneration) || null;
      }
      // If no relevant fields updated, don't update componen_product_name
    }
    
    // Hanya masukkan image jika ada file baru yang berhasil diupload
    if (imageData !== undefined) {
      componenProductData.image = imageData;
    }

    const specificationsPayload = parseSpecificationsInput(req.body.componen_product_specifications);
    
    const data = await repository.update(id, componenProductData, {
      specifications: specificationsPayload.items,
      specificationsProvided: specificationsPayload.provided
    });
    
    if (!data) {
      const response = mappingError('Data componen product tidak ditemukan', 404);
      return baseResponse(res, response);
    }
    
    const response = mappingSuccess('Data componen product berhasil diupdate', data);
    return baseResponse(res, response);
  } catch (error) {
    console.error('Error updating componen product:', error);
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Soft delete componen product
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
      const response = mappingError('Data componen product tidak ditemukan', 404);
      return baseResponse(res, response);
    }
    
    const response = mappingSuccess('Data componen product berhasil dihapus', result);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Map truck_type to componen_type
 */
const mapTruckTypeToComponenType = (truckType) => {
  if (!truckType) return null;
  
  const normalizedType = String(truckType).trim().toUpperCase();
  
  if (normalizedType === 'OFF ROAD REGULAR') {
    return 1;
  } else if (normalizedType === 'ON ROAD REGULAR') {
    return 2;
  } else if (normalizedType === 'OFF ROAD IRREGULAR') {
    return 3;
  }
  
  return null;
};

/**
 * Clean market_price by removing commas and dots, returning only numeric value
 */
const cleanMarketPrice = (marketPrice) => {
  if (!marketPrice) return null;
  
  // Convert to string and remove all commas and dots
  const cleaned = String(marketPrice).replace(/,/g, '').replace(/\./g, '').trim();
  
  // If empty after cleaning, return null
  if (cleaned === '') return null;
  
  // Convert to number
  const numericValue = parseFloat(cleaned);
  
  // Return null if not a valid number, otherwise return the numeric value as string
  return isNaN(numericValue) ? null : String(numericValue);
};

/**
 * Parse CSV file and return array of objects
 */
const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());
    
    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

/**
 * Import componen products from CSV
 */
const importCSV = async (req, res) => {
  try {
    if (!req.file) {
      const response = mappingError('File CSV tidak ditemukan', 400);
      return baseResponse(res, response);
    }

    // Get user info from token
    const tokenData = decodeToken('created', req);
    
    // Parse CSV file
    const csvData = await parseCSV(req.file.buffer);
    
    if (!csvData || csvData.length === 0) {
      const response = mappingError('File CSV kosong atau tidak valid', 400);
      return baseResponse(res, response);
    }

    // Expected CSV columns
    const expectedColumns = [
      'msi_code',
      'truck_type',
      'segment',
      'segment_type',
      'msi_model',
      'unit_model',
      'engine',
      'horse_power',
      'wheel_number',
      'volume_cbm',
      'market_price',
      'gvw',
      'wheelbase',
      'engine_brand_model',
      'max_torque',
      'displacement',
      'emission_standard',
      'engine_guard',
      'gearbox_transmission',
      'fuel_tank',
      'Tyre'
    ];

    // Validate CSV columns (check first row)
    const firstRow = csvData[0];
    const missingColumns = expectedColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      const response = mappingError(
        `Kolom CSV tidak lengkap. Kolom yang hilang: ${missingColumns.join(', ')}`,
        400
      );
      return baseResponse(res, response);
    }

    const results = {
      success: [],
      failed: [],
      total: csvData.length
    };

    // Process each row
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const rowNumber = i + 2; // +2 because CSV has header and 0-indexed
      
      try {
        // Map segment_type to componen_type
        const componenType = mapTruckTypeToComponenType(row.segment_type);
        
        // Clean market_price (remove commas and dots)
        const cleanedMarketPrice = cleanMarketPrice(row.market_price);
        
        // Prepare componen product data
        const componenProductData = {
          code_unique: row.msi_code || null,
          msi_model: row.truck_type || null,
          segment: row.segment || null,
          componen_type: componenType,
          msi_product: row.msi_model || null,
          componen_product_unit_model: row.unit_model || null,
          engine: row.engine || null,
          horse_power: row.horse_power || null,
          wheel_no: row.wheel_number || null,
          volume: row.volume_cbm || null,
          market_price: cleanedMarketPrice,
          selling_price_star_1: '0',
          selling_price_star_2: '0',
          selling_price_star_3: '0',
          selling_price_star_4: '0',
          selling_price_star_5: '0',
          created_by: tokenData.created_by
        };
        
        // Generate componen_product_name based on format
        componenProductData.componen_product_name = generateComponenProductName(componenProductData) || null;

        // Prepare specifications data
        const specifications = [];
        
        // Helper function to add specification if value exists
        const addSpecification = (label, value) => {
          if (value && String(value).trim() !== '') {
            specifications.push({
              componen_product_specification_label: label,
              componen_product_specification_value: String(value).trim()
            });
          }
        };

        // Add all specifications
        addSpecification('GVW', row.gvw);
        addSpecification('Unit Model', row.unit_model);
        addSpecification('Horse Power', row.horse_power);
        addSpecification('Cargobox/Vessel', row.volume_cbm);
        addSpecification('Wheelbase', row.wheelbase);
        addSpecification('Engine Brand Model', row.engine_brand_model);
        addSpecification('Max Torque', row.max_torque);
        addSpecification('Displacement', row.displacement);
        addSpecification('Emission Standard', row.emission_standard);
        addSpecification('Engine Guard', row.engine_guard);
        addSpecification('Gearbox Transmission', row.gearbox_transmission);
        addSpecification('Fuel Tank', row.fuel_tank);
        addSpecification('Tyre', row.Tyre);

        // Create componen product with specifications
        const createdProduct = await repository.create(componenProductData, specifications);
        
        results.success.push({
          row: rowNumber,
          code_unique: row.msi_code,
          componen_product_id: createdProduct.componen_product_id
        });
      } catch (error) {
        results.failed.push({
          row: rowNumber,
          code_unique: row.msi_code || 'N/A',
          error: error.message || 'Unknown error'
        });
      }
    }

    const response = mappingSuccess(
      `Import CSV selesai. Berhasil: ${results.success.length}, Gagal: ${results.failed.length}`,
      {
        total: results.total,
        success: results.success.length,
        failed: results.failed.length,
        details: {
          success: results.success,
          failed: results.failed
        }
      },
      201
    );
    
    return baseResponse(res, response);
  } catch (error) {
    console.error('Error importing CSV:', error);
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Middleware for CSV file upload
 */
const handleCSVUpload = (req, res, next) => {
  const storage = multer.memoryStorage();
  
  const csvFilter = (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
    const allowedExtensions = ['.csv'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file CSV yang diizinkan'), false);
    }
  };
  
  const upload = multer({
    storage: storage,
    fileFilter: csvFilter,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    }
  });
  
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File terlalu besar. Maksimal 10MB.',
          error: err.message
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Error upload file',
        error: err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Error validasi file',
        error: err.message
      });
    }
    next();
  });
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  importCSV,
  handleImageUpload,
  handleMultipleImagesUpload,
  handleCSVUpload
};

