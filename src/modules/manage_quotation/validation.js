const { body, param } = require('express-validator');

/**
 * Validation rules for creating manage quotation
 */
const createValidation = [
  body('manage_quotation_no')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Nomor quotation maksimal 100 karakter')
    .trim(),
  body('customer_id')
    .optional()
    .isUUID()
    .withMessage('Format customer_id tidak valid'),
  body('employee_id')
    .optional()
    .isUUID()
    .withMessage('Format employee_id tidak valid'),
  body('manage_quotation_date')
    .optional()
    .isISO8601()
    .withMessage('Format tanggal tidak valid')
    .trim(),
  body('manage_quotation_valid_date')
    .optional()
    .isISO8601()
    .withMessage('Format tanggal valid tidak valid')
    .trim(),
  body('manage_quotation_grand_total')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Grand total maksimal 100 karakter')
    .trim(),
  body('manage_quotation_ppn')
    .optional()
    .isLength({ max: 100 })
    .withMessage('PPN maksimal 100 karakter')
    .trim(),
  body('manage_quotation_delivery_fee')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Delivery fee maksimal 100 karakter')
    .trim(),
  body('manage_quotation_other')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Other maksimal 100 karakter')
    .trim(),
  body('manage_quotation_payment_presentase')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Payment presentase maksimal 100 karakter')
    .trim(),
  body('manage_quotation_payment_nominal')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Payment nominal maksimal 100 karakter')
    .trim(),
  body('manage_quotation_description')
    .optional()
    .trim(),
  body('manage_quotation_items')
    .optional()
    .isArray({ min: 0 })
    .withMessage('Manage quotation items harus berupa array'),
  body('manage_quotation_items.*.unit_code')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Unit code maksimal 100 karakter')
    .trim(),
  body('manage_quotation_items.*.unit_model')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Unit model maksimal 100 karakter')
    .trim(),
  body('manage_quotation_items.*.segment')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Segment maksimal 100 karakter')
    .trim(),
  body('manage_quotation_items.*.msi_model')
    .optional()
    .trim(),
  body('manage_quotation_items.*.wheel_no')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Wheel no maksimal 100 karakter')
    .trim(),
  body('manage_quotation_items.*.engine')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Engine maksimal 100 karakter')
    .trim(),
  body('manage_quotation_items.*.horse_power')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Horse power maksimal 100 karakter')
    .trim(),
  body('manage_quotation_items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity harus berupa angka positif'),
  body('manage_quotation_items.*.price')
    .optional()
    .notEmpty()
    .withMessage('Price tidak boleh kosong'),
  body('manage_quotation_items.*.total')
    .optional()
    .notEmpty()
    .withMessage('Total tidak boleh kosong'),
  body('manage_quotation_items.*.description')
    .optional()
    .trim(),
];

/**
 * Validation rules for updating manage quotation
 */
const updateValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID wajib diisi')
    .isUUID()
    .withMessage('Format ID tidak valid'),
  body('manage_quotation_no')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Nomor quotation maksimal 100 karakter')
    .trim(),
  body('customer_id')
    .optional()
    .isUUID()
    .withMessage('Format customer_id tidak valid'),
  body('employee_id')
    .optional()
    .isUUID()
    .withMessage('Format employee_id tidak valid'),
  body('manage_quotation_date')
    .optional()
    .isISO8601()
    .withMessage('Format tanggal tidak valid')
    .trim(),
  body('manage_quotation_valid_date')
    .optional()
    .isISO8601()
    .withMessage('Format tanggal valid tidak valid')
    .trim(),
  body('manage_quotation_grand_total')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Grand total maksimal 100 karakter')
    .trim(),
  body('manage_quotation_ppn')
    .optional()
    .isLength({ max: 100 })
    .withMessage('PPN maksimal 100 karakter')
    .trim(),
  body('manage_quotation_delivery_fee')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Delivery fee maksimal 100 karakter')
    .trim(),
  body('manage_quotation_other')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Other maksimal 100 karakter')
    .trim(),
  body('manage_quotation_payment_presentase')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Payment presentase maksimal 100 karakter')
    .trim(),
  body('manage_quotation_payment_nominal')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Payment nominal maksimal 100 karakter')
    .trim(),
  body('manage_quotation_description')
    .optional()
    .trim(),
  body('manage_quotation_items')
    .optional()
    .isArray({ min: 0 })
    .withMessage('Manage quotation items harus berupa array'),
  body('manage_quotation_items.*.unit_code')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Unit code maksimal 100 karakter')
    .trim(),
  body('manage_quotation_items.*.unit_model')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Unit model maksimal 100 karakter')
    .trim(),
  body('manage_quotation_items.*.segment')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Segment maksimal 100 karakter')
    .trim(),
  body('manage_quotation_items.*.msi_model')
    .optional()
    .trim(),
  body('manage_quotation_items.*.wheel_no')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Wheel no maksimal 100 karakter')
    .trim(),
  body('manage_quotation_items.*.engine')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Engine maksimal 100 karakter')
    .trim(),
  body('manage_quotation_items.*.horse_power')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Horse power maksimal 100 karakter')
    .trim(),
  body('manage_quotation_items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity harus berupa angka positif'),
  body('manage_quotation_items.*.price')
    .optional()
    .notEmpty()
    .withMessage('Price tidak boleh kosong'),
  body('manage_quotation_items.*.total')
    .optional()
    .notEmpty()
    .withMessage('Total tidak boleh kosong'),
  body('manage_quotation_items.*.description')
    .optional()
    .trim(),
];

/**
 * Validation rules for getting manage quotation by ID
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
    .isIn(['created_at', 'manage_quotation_no', 'manage_quotation_date', 'manage_quotation_valid_date'])
    .withMessage('Sort by harus salah satu dari: created_at, manage_quotation_no, manage_quotation_date, manage_quotation_valid_date'),
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

