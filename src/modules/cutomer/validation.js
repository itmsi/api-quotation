const { body, param, query } = require('express-validator');

/**
 * Validation rules for creating customer
 */
const createValidation = [
  body('name')
    .notEmpty()
    .withMessage('Nama wajib diisi')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nama harus antara 3-100 karakter')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Format email tidak valid')
    .trim(),
  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone maksimal 20 karakter')
    .trim(),
];

/**
 * Validation rules for updating customer
 */
const updateValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID wajib diisi')
    .isUUID()
    .withMessage('Format ID tidak valid'),
  body('name')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nama harus antara 3-100 karakter')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Format email tidak valid')
    .trim(),
  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone maksimal 20 karakter')
    .trim(),
];

/**
 * Validation rules for getting customer by ID
 */
const getByIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID wajib diisi')
    .isUUID()
    .withMessage('Format ID tidak valid'),
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
    .isLength({ max: 100 })
    .withMessage('Search maksimal 100 karakter')
    .trim(),
  body('sort_by')
    .optional()
    .isIn(['created_at', 'name', 'email', 'phone'])
    .withMessage('Sort by harus salah satu dari: created_at, name, email, phone'),
  body('sort_order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order harus asc atau desc'),
];

module.exports = {
  createValidation,
  updateValidation,
  getByIdValidation,
  listValidation
};

