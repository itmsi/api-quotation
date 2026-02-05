const { body, param } = require('express-validator');

/**
 * Validation rules for creating bank account
 */
const createValidation = [
  body('bank_account_name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Nama bank account maksimal 255 karakter')
    .trim(),
  body('bank_account_number')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Nomor bank account maksimal 255 karakter')
    .trim(),
  body('bank_account_type')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Tipe bank account maksimal 255 karakter')
    .trim(),
  body('bank_account_balance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Saldo bank account harus berupa angka positif'),
];

/**
 * Validation rules for updating bank account
 */
const updateValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID wajib diisi')
    .isUUID()
    .withMessage('Format ID tidak valid'),
  body('bank_account_name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Nama bank account maksimal 255 karakter')
    .trim(),
  body('bank_account_number')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Nomor bank account maksimal 255 karakter')
    .trim(),
  body('bank_account_type')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Tipe bank account maksimal 255 karakter')
    .trim(),
  body('bank_account_balance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Saldo bank account harus berupa angka positif'),
];

/**
 * Validation rules for getting bank account by ID
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
    .isInt({ min: 1, max: 9999 })
    .withMessage('Limit harus antara 1-9999'),
  body('search')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Search maksimal 255 karakter')
    .trim(),
  body('sort_by')
    .optional()
    .isIn(['created_at', 'bank_account_name', 'bank_account_number', 'bank_account_type'])
    .withMessage('Sort by harus salah satu dari: created_at, bank_account_name, bank_account_number, bank_account_type'),
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

