const { body, param } = require('express-validator');

/**
 * Validation rules for creating accessory
 */
const createValidation = [
  body('accessory_part_number')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory part number maksimal 255 karakter')
    .trim(),
  body('accessory_part_name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory part name maksimal 255 karakter')
    .trim(),
  body('accessory_specification')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory specification maksimal 255 karakter')
    .trim(),
  body('accessory_brand')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory brand maksimal 255 karakter')
    .trim(),
  body('accessory_remark')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory remark maksimal 255 karakter')
    .trim(),
  body('accessory_region')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory region maksimal 255 karakter')
    .trim(),
  body('accessory_description')
    .optional()
    .isString()
    .withMessage('Accessory description harus berupa string')
];

/**
 * Validation rules for updating accessory
 */
const updateValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID wajib diisi')
    .isUUID()
    .withMessage('Format ID tidak valid'),
  body('accessory_part_number')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory part number maksimal 255 karakter')
    .trim(),
  body('accessory_part_name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory part name maksimal 255 karakter')
    .trim(),
  body('accessory_specification')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory specification maksimal 255 karakter')
    .trim(),
  body('accessory_brand')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory brand maksimal 255 karakter')
    .trim(),
  body('accessory_remark')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory remark maksimal 255 karakter')
    .trim(),
  body('accessory_region')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory region maksimal 255 karakter')
    .trim(),
  body('accessory_description')
    .optional()
    .isString()
    .withMessage('Accessory description harus berupa string')
];

/**
 * Validation rules for getting accessory by ID
 */
const getByIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID wajib diisi')
    .isUUID()
    .withMessage('Format ID tidak valid')
];

/**
 * Validation rules for list with pagination
 */
const listValidation = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page harus berupa angka positif'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit harus antara 1-100'),
  body('search')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Search maksimal 255 karakter')
    .trim(),
  body('sort_by')
    .optional()
    .isIn(['created_at', 'accessory_part_number', 'accessory_part_name', 'accessory_brand'])
    .withMessage('Sort by harus salah satu dari: created_at, accessory_part_number, accessory_part_name, accessory_brand'),
  body('sort_order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order harus asc atau desc')
];

module.exports = {
  createValidation,
  updateValidation,
  getByIdValidation,
  listValidation
};

