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
const uploadImage = upload.single('image');

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
    'code_unique': 'code_unique',
    'componen_product_name': 'componen_product_name',
    'segment': 'segment',
    'msi_model': 'msi_model',
    'volume': 'volume',
    'componen_product_unit_model': 'componen_product_unit_model'
  };
  return mapping[sortBy] || 'created_at';
};

/**
 * Get all componen products with pagination, search, and sort
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
    } else if (req.body.image !== undefined) {
      // If image URL is provided directly (optional)
      imageUrl = req.body.image || null;
    }
    
    const componenProductData = {
      product_dimensi_id: req.body.product_dimensi_id || null,
      componen_product_name: req.body.componen_product_name || null,
      componen_type: req.body.componen_type ? parseInt(req.body.componen_type) : null,
      code_unique: req.body.code_unique || null,
      segment: req.body.segment || null,
      msi_model: req.body.msi_model || null,
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
      image: imageUrl,
      componen_product_description: req.body.componen_product_description || null,
      created_by: tokenData.created_by
    };
    
    const data = await repository.create(componenProductData);
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
    
    // Upload new image if provided
    let imageUrl = undefined;
    if (req.file) {
      console.log('Uploading new image to MinIO...');
      imageUrl = await uploadImageToStorage(req.file);
      if (!imageUrl) {
        console.warn('Failed to upload image to MinIO, keeping existing image');
        imageUrl = undefined;
      } else {
        console.log('New image uploaded successfully:', imageUrl);
      }
    }
    
    const componenProductData = {
      product_dimensi_id: req.body.product_dimensi_id,
      componen_product_name: req.body.componen_product_name,
      componen_type: req.body.componen_type !== undefined ? (req.body.componen_type ? parseInt(req.body.componen_type) : null) : undefined,
      code_unique: req.body.code_unique,
      segment: req.body.segment,
      msi_model: req.body.msi_model,
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
    
    // Hanya masukkan image jika ada file baru yang berhasil diupload
    if (imageUrl !== undefined && imageUrl !== null) {
      componenProductData.image = imageUrl;
    }
    
    const data = await repository.update(id, componenProductData);
    
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

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  handleImageUpload
};

