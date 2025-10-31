const { body, param } = require('express-validator');

const createValidation = [
  body('manage_quotation_no')
    .notEmpty()
    .withMessage('Manage quotation number wajib diisi')
    .isLength({ max: 100 })
    .withMessage('Manage quotation number maksimal 100 karakter')
    .trim(),
  body('term_content_directory')
    .notEmpty()
    .withMessage('Term content directory wajib diisi')
];

const updateValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID wajib diisi')
    .isUUID()
    .withMessage('Format ID tidak valid'),
  body('manage_quotation_no')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Manage quotation number maksimal 100 karakter')
    .trim(),
  body('term_content_directory')
    .optional()
    .notEmpty()
    .withMessage('Term content directory tidak boleh kosong')
];

const getByIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID wajib diisi')
    .isUUID()
    .withMessage('Format ID tidak valid')
];

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
    .isIn(['created_at', 'manage_quotation_no'])
    .withMessage('Sort by harus salah satu dari: created_at, manage_quotation_no'),
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


