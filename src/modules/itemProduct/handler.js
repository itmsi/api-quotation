const path = require('path');
const multer = require('multer');
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

// Middleware for single image upload
const uploadImage = upload.single('item_product_image');

// Helper function to upload image to MinIO
const uploadImageToStorage = async (file, folderPath = 'item_products') => {
  if (!file || !isMinioEnabled) {
    return null;
  }

  try {
    const bucketName = process.env.S3_BUCKET || process.env.MINIO_BUCKET;
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const fileName = `item-product-${timestamp}${extension}`;
    
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

// Middleware wrapper to handle multer errors
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

/**
 * Map sort_by from API format to database column format
 */
const mapSortBy = (sortBy) => {
  const mapping = {
    'created_at': 'created_at',
    'item_product_code': 'item_product_code',
    'item_product_model': 'item_product_model',
    'item_product_segment': 'item_product_segment'
  };
  return mapping[sortBy] || 'created_at';
};

/**
 * Get all item products with pagination, search, and sort
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
    const response = mappingSuccess('Data item product berhasil diambil', data);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Get single item product by ID
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await repository.findById(id);
    
    if (!data) {
      const response = mappingError('Data item product tidak ditemukan', 404);
      return baseResponse(res, response);
    }
    
    const response = mappingSuccess('Data item product berhasil diambil', data);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Create new item product
 */
const create = async (req, res) => {
  try {
    // Get user info from token
    const tokenData = decodeToken('created', req);
    
    // Upload image if provided
    let imageUrl = null;
    if (req.file) {
      console.log('Uploading image to MinIO...');
      imageUrl = await uploadImageToStorage(req.file);
      if (!imageUrl) {
        console.warn('Failed to upload image to MinIO, but continuing with create');
      } else {
        console.log('Image uploaded successfully:', imageUrl);
      }
    } else if (req.body.item_product_image !== undefined) {
      // If image URL is provided directly (optional)
      imageUrl = req.body.item_product_image || null;
    }
    
    const itemProductData = {
      item_product_code: req.body.item_product_code || null,
      item_product_model: req.body.item_product_model || null,
      item_product_segment: req.body.item_product_segment || null,
      item_product_msi_model: req.body.item_product_msi_model || null,
      item_product_wheel_no: req.body.item_product_wheel_no || null,
      item_product_engine: req.body.item_product_engine || null,
      item_product_horse_power: req.body.item_product_horse_power || null,
      item_product_market_price: req.body.item_product_market_price || null,
      item_product_selling_price_star_1: req.body.item_product_selling_price_star_1 || null,
      item_product_selling_price_star_2: req.body.item_product_selling_price_star_2 || null,
      item_product_selling_price_star_3: req.body.item_product_selling_price_star_3 || null,
      item_product_selling_price_star_4: req.body.item_product_selling_price_star_4 || null,
      item_product_selling_price_star_5: req.body.item_product_selling_price_star_5 || null,
      item_product_description: req.body.item_product_description || null,
      item_product_image: imageUrl,
      created_by: tokenData.created_by
    };
    
    const data = await repository.create(itemProductData);
    const response = mappingSuccess('Data item product berhasil dibuat', data, 201);
    return baseResponse(res, response);
  } catch (error) {
    console.error('Error creating item product:', error);
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Update existing item product
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user info from token
    const tokenData = decodeToken('updated', req);
    
    // Get existing data
    const existing = await repository.findById(id);
    if (!existing) {
      const response = mappingError('Data item product tidak ditemukan', 404);
      return baseResponse(res, response);
    }
    
    // Upload new image if provided
    let imageUrl = existing.item_product_image; // Keep existing image by default
    if (req.file) {
      console.log('Uploading new image to MinIO...');
      imageUrl = await uploadImageToStorage(req.file);
      if (!imageUrl) {
        console.warn('Failed to upload image to MinIO, keeping existing image');
        imageUrl = existing.item_product_image; // Keep existing if upload fails
      } else {
        console.log('New image uploaded successfully:', imageUrl);
      }
    } else if (req.body.item_product_image !== undefined) {
      // If image field is explicitly provided in body (can be empty string to remove)
      imageUrl = req.body.item_product_image === '' ? null : req.body.item_product_image;
    }
    
    const itemProductData = {
      item_product_code: req.body.item_product_code,
      item_product_model: req.body.item_product_model,
      item_product_segment: req.body.item_product_segment,
      item_product_msi_model: req.body.item_product_msi_model,
      item_product_wheel_no: req.body.item_product_wheel_no,
      item_product_engine: req.body.item_product_engine,
      item_product_horse_power: req.body.item_product_horse_power,
      item_product_market_price: req.body.item_product_market_price,
      item_product_selling_price_star_1: req.body.item_product_selling_price_star_1,
      item_product_selling_price_star_2: req.body.item_product_selling_price_star_2,
      item_product_selling_price_star_3: req.body.item_product_selling_price_star_3,
      item_product_selling_price_star_4: req.body.item_product_selling_price_star_4,
      item_product_selling_price_star_5: req.body.item_product_selling_price_star_5,
      item_product_description: req.body.item_product_description,
      item_product_image: imageUrl,
      updated_by: tokenData.updated_by
    };
    
    const data = await repository.update(id, itemProductData);
    
    if (!data) {
      const response = mappingError('Data item product tidak ditemukan', 404);
      return baseResponse(res, response);
    }
    
    const response = mappingSuccess('Data item product berhasil diupdate', data);
    return baseResponse(res, response);
  } catch (error) {
    console.error('Error updating item product:', error);
    const response = mappingError(error);
    return baseResponse(res, response);
  }
};

/**
 * Soft delete item product
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
      const response = mappingError('Data item product tidak ditemukan', 404);
      return baseResponse(res, response);
    }
    
    const response = mappingSuccess('Data item product berhasil dihapus', result);
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
  handleImageUpload
};

