const { body, param } = require('express-validator');

/**
 * Validation rules for creating componen product specification
 */
const createValidation = [
  body('componen_product_id')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Componen product ID harus berupa UUID'),
  body('componen_product_specification_label')
    .optional({ nullable: true })
    .isLength({ max: 255 })
    .withMessage('Label maksimal 255 karakter')
    .trim(),
  body('componen_product_specification_value')
    .optional({ nullable: true })
    .isLength({ max: 255 })
    .withMessage('Value maksimal 255 karakter')
    .trim(),
  body('componen_product_specification_description')
    .optional({ nullable: true })
    .isString()
    .withMessage('Deskripsi harus berupa string')
];

/**
 * Validation rules for updating componen product specification
 */
const updateValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID wajib diisi')
    .isUUID()
    .withMessage('Format ID tidak valid'),
  body('componen_product_id')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Componen product ID harus berupa UUID'),
  body('componen_product_specification_label')
    .optional({ nullable: true })
    .isLength({ max: 255 })
    .withMessage('Label maksimal 255 karakter')
    .trim(),
  body('componen_product_specification_value')
    .optional({ nullable: true })
    .isLength({ max: 255 })
    .withMessage('Value maksimal 255 karakter')
    .trim(),
  body('componen_product_specification_description')
    .optional({ nullable: true })
    .isString()
    .withMessage('Deskripsi harus berupa string')
];

/**
 * Validation rules for getting specification by ID
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
    .optional({ nullable: true })
    .isLength({ max: 255 })
    .withMessage('Search maksimal 255 karakter')
    .trim(),
  body('sort_by')
    .optional()
    .isIn(['created_at', 'componen_product_specification_label', 'componen_product_specification_value'])
    .withMessage('Sort by tidak valid'),
  body('sort_order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order harus asc atau desc'),
  body('componen_product_id')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Componen product ID harus berupa UUID')
];

module.exports = {
  createValidation,
  updateValidation,
  getByIdValidation,
  listValidation
};


