const { body, param } = require('express-validator');

const createValidation = [
  body('term_content_title')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Term content title maksimal 255 karakter')
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
  body('term_content_title')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Term content title maksimal 255 karakter')
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
    .isInt({ min: 1, max: 9999 })
    .withMessage('Limit harus antara 1-9999'),
  body('search')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Search maksimal 255 karakter')
    .trim(),
  body('sort_by')
    .optional()
    .isIn(['created_at', 'term_content_title'])
    .withMessage('Sort by harus salah satu dari: created_at, term_content_title'),
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


