const path = require('path');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
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

/**
 * Get accessories by island ID
 */
const getByIslandId = async (req, res) => {
  try {
    const { idisland } = req.params;
    
    const data = await repository.findByIslandId(idisland);
    
    const response = mappingSuccess('Data accessory berhasil diambil berdasarkan island', data);
    return baseResponse(res, response);
  } catch (error) {
    const response = mappingError(error);
    return baseResponse(res, response);
  }
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
 * Island mapping for accessories_island_detail
 */
const ISLAND_MAPPING = {
  sumatera: {
    island_id: '0b234105-e006-445b-9b00-7b8d060950ce',
    description: 'Description Accessories Sumatera'
  },
  kalimantan: {
    island_id: 'efb440a3-4c51-46c3-9c2b-5de7313d7751',
    description: 'Description Accessories Kalimantan'
  },
  sulawesi: {
    island_id: 'a09bcb8b-3035-47ba-89c2-915c1c057ae4',
    description: 'Description Accessories Sulawesi'
  },
  maluku: {
    island_id: '52fe3eff-4610-4a6b-a9fa-866105073384',
    description: 'Description Accessories Maluku'
  },
  otr: {
    island_id: '9e9fec2b-a316-4c2b-a88e-2bde66a84218',
    description: 'Description Accessories OTR'
  }
};

/**
 * Import accessories from CSV
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
      'accessories_name',
      'specification',
      'brand',
      'remarks',
      'sumatera',
      'kalimantan',
      'sulawesi',
      'maluku',
      'otr'
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
        // Prepare accessory data
        const accessoryData = {
          accessory_part_number: row.msi_code || null,
          accessory_part_name: row.accessories_name || null,
          accessory_specification: row.specification || null,
          accessory_brand: row.brand || null,
          accessory_remark: row.remarks || null,
          accessory_region: null,
          accessory_description: null,
          created_by: tokenData.created_by
        };
        
        // Create accessory
        const createdAccessory = await repository.create(accessoryData);
        
        // Prepare accessories_island_detail data
        const islandDetails = [];
        
        // Process each island column
        Object.keys(ISLAND_MAPPING).forEach(islandKey => {
          const quantity = row[islandKey];
          const islandInfo = ISLAND_MAPPING[islandKey];
          
          // Only add if quantity exists and is not empty
          if (quantity !== undefined && quantity !== null && String(quantity).trim() !== '') {
            const qty = parseInt(quantity, 10);
            if (!isNaN(qty) && qty > 0) {
              islandDetails.push({
                island_id: islandInfo.island_id,
                accessories_island_detail_quantity: qty,
                accessories_island_detail_description: islandInfo.description
              });
            }
          }
        });
        
        // Insert accessories_island_detail if any
        if (islandDetails.length > 0) {
          await accessoriesIslandDetailRepository.createMultiple(
            islandDetails,
            createdAccessory.accessory_id,
            tokenData.created_by
          );
        }
        
        results.success.push({
          row: rowNumber,
          msi_code: row.msi_code,
          accessory_id: createdAccessory.accessory_id
        });
      } catch (error) {
        results.failed.push({
          row: rowNumber,
          msi_code: row.msi_code || 'N/A',
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
  getByIslandId,
  importCSV,
  handleCSVUpload
};

