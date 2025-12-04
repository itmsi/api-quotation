const { body, param } = require('express-validator');

/**
 * Validation rules for creating manage quotation
 */
const createValidation = [
  // manage_quotation_no tidak perlu di-validate karena akan di-generate otomatis
  // jika status = submit, dan tidak akan di-generate jika status = draft
  body('customer_id')
    .optional()
    .isUUID()
    .withMessage('Format customer_id tidak valid'),
  body('employee_id')
    .optional()
    .isUUID()
    .withMessage('Format employee_id tidak valid'),
  body('island_id')
    .optional()
    .isUUID()
    .withMessage('Format island_id tidak valid'),
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
  body('manage_quotation_shipping_term')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Shipping term maksimal 255 karakter')
    .trim(),
  body('manage_quotation_franco')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Franco maksimal 255 karakter')
    .trim(),
  body('manage_quotation_lead_time')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Lead time maksimal 255 karakter')
    .trim(),
  body('bank_account_name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Bank account name maksimal 255 karakter')
    .trim(),
  body('bank_account_number')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Bank account number maksimal 255 karakter')
    .trim(),
  body('bank_account_bank_name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Bank name maksimal 255 karakter')
    .trim(),
  body('term_content_id')
    .optional()
    .custom((value) => {
      // Allow null, undefined, empty string, NaN, or valid UUID
      if (value === null || value === undefined || value === '') {
        return true;
      }
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '' || trimmed === 'NaN' || trimmed === 'null') {
          return true;
        }
        // If not empty, must be valid UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(trimmed);
      }
      // Allow NaN
      if (typeof value === 'number' && isNaN(value)) {
        return true;
      }
      return false;
    })
    .withMessage('Format term_content_id tidak valid'),
  body('term_content_directory')
    .optional()
    .custom((value) => {
      // Allow null, empty string, object, or any string (JSON or plain string)
      if (value === null || value === undefined || value === '') {
        return true;
      }
      if (typeof value === 'object') {
        return true;
      }
      if (typeof value === 'string') {
        // Allow any string - handler will handle JSON parsing or use as plain string
        return true;
      }
      return false;
    })
    .withMessage('term_content_directory harus berupa object atau string'),
  body('status')
    .optional()
    .isIn(['draft', 'submit'])
    .withMessage('Status harus salah satu dari: draft, submit'),
  body('include_aftersales_page')
    .optional()
    .isBoolean()
    .withMessage('include_aftersales_page harus berupa boolean')
    .toBoolean(),
  body('include_msf_page')
    .optional()
    .isBoolean()
    .withMessage('include_msf_page harus berupa boolean')
    .toBoolean(),
  body('manage_quotation_items')
    .optional()
    .isArray({ min: 0 })
    .withMessage('Manage quotation items harus berupa array'),
  body('manage_quotation_items.*.componen_product_id')
    .optional()
    .isUUID()
    .withMessage('Format componen_product_id tidak valid'),
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
  body('manage_quotation_items.*.code_unique')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Code unique maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.segment')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Segment maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.msi_model')
    .optional()
    .isLength({ max: 255 })
    .withMessage('MSI model maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.msi_product')
    .optional()
    .isLength({ max: 255 })
    .withMessage('MSI product maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.wheel_no')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Wheel no maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.engine')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Engine maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.volume')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Volume maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.horse_power')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Horse power maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.market_price')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Market price maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.componen_product_name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Componen product name maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.description')
    .optional()
    .trim(),
  body('manage_quotation_items.*.order_number')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order number harus berupa angka bulat non-negatif'),
  body('manage_quotation_items.*.manage_quotation_item_accessories')
    .optional()
    .isArray({ min: 0 })
    .withMessage('Manage quotation item accessories harus berupa array'),
  body('manage_quotation_items.*.manage_quotation_item_accessories.*.accessory_id')
    .optional()
    .isUUID()
    .withMessage('Format accessory_id tidak valid'),
  body('manage_quotation_items.*.manage_quotation_item_accessories.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity harus berupa angka positif'),
  body('manage_quotation_items.*.manage_quotation_item_accessories.*.description')
    .optional()
    .trim(),
  body('manage_quotation_items.*.manage_quotation_item_accessories.*.accessory_part_number')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory part number maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.manage_quotation_item_accessories.*.accessory_part_name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory part name maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.manage_quotation_item_accessories.*.accessory_specification')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory specification maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.manage_quotation_item_accessories.*.accessory_brand')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory brand maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.manage_quotation_item_accessories.*.accessory_remark')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory remark maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.manage_quotation_item_accessories.*.accessory_region')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory region maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.manage_quotation_item_accessories.*.accessory_description')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory description maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.manage_quotation_item_accessories.*.componen_product_id')
    .optional()
    .isUUID()
    .withMessage('Format componen_product_id pada accessory tidak valid'),
  body('manage_quotation_items.*.manage_quotation_item_specifications')
    .optional()
    .isArray({ min: 0 })
    .withMessage('Manage quotation item specifications harus berupa array'),
  body('manage_quotation_items.*.manage_quotation_item_specifications.*.componen_product_id')
    .optional()
    .isUUID()
    .withMessage('Format componen_product_id pada specification tidak valid'),
  body('manage_quotation_items.*.manage_quotation_item_specifications.*.manage_quotation_item_specification_label')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Label specification maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.manage_quotation_item_specifications.*.manage_quotation_item_specification_value')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Value specification maksimal 255 karakter')
    .trim(),
  // Validation for manage_quotation_item_accessories at root level
  body('manage_quotation_item_accessories')
    .optional()
    .isArray({ min: 0 })
    .withMessage('Manage quotation item accessories harus berupa array'),
  body('manage_quotation_item_accessories.*.accessory_id')
    .optional()
    .isUUID()
    .withMessage('Format accessory_id tidak valid'),
  body('manage_quotation_item_accessories.*.quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity harus berupa angka integer positif'),
  body('manage_quotation_item_accessories.*.description')
    .optional()
    .isString()
    .withMessage('Description harus berupa string')
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
  // manage_quotation_no tidak perlu di-validate karena akan di-generate otomatis
  // jika status berubah ke submit dan belum ada nomor
  body('customer_id')
    .optional()
    .isUUID()
    .withMessage('Format customer_id tidak valid'),
  body('employee_id')
    .optional()
    .isUUID()
    .withMessage('Format employee_id tidak valid'),
  body('island_id')
    .optional()
    .isUUID()
    .withMessage('Format island_id tidak valid'),
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
  body('manage_quotation_shipping_term')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Shipping term maksimal 255 karakter')
    .trim(),
  body('manage_quotation_franco')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Franco maksimal 255 karakter')
    .trim(),
  body('manage_quotation_lead_time')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Lead time maksimal 255 karakter')
    .trim(),
  body('bank_account_name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Bank account name maksimal 255 karakter')
    .trim(),
  body('bank_account_number')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Bank account number maksimal 255 karakter')
    .trim(),
  body('bank_account_bank_name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Bank name maksimal 255 karakter')
    .trim(),
  body('term_content_id')
    .optional()
    .custom((value) => {
      // Allow null, undefined, empty string, NaN, or valid UUID
      if (value === null || value === undefined || value === '') {
        return true;
      }
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '' || trimmed === 'NaN' || trimmed === 'null') {
          return true;
        }
        // If not empty, must be valid UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(trimmed);
      }
      // Allow NaN
      if (typeof value === 'number' && isNaN(value)) {
        return true;
      }
      return false;
    })
    .withMessage('Format term_content_id tidak valid'),
  body('term_content_directory')
    .optional()
    .custom((value) => {
      // Allow null, empty string, object, or any string (JSON or plain string)
      if (value === null || value === undefined || value === '') {
        return true;
      }
      if (typeof value === 'object') {
        return true;
      }
      if (typeof value === 'string') {
        // Allow any string - handler will handle JSON parsing or use as plain string
        return true;
      }
      return false;
    })
    .withMessage('term_content_directory harus berupa object atau string'),
  body('status')
    .optional()
    .isIn(['draft', 'submit'])
    .withMessage('Status harus salah satu dari: draft, submit'),
  body('include_aftersales_page')
    .optional()
    .isBoolean()
    .withMessage('include_aftersales_page harus berupa boolean')
    .toBoolean(),
  body('include_msf_page')
    .optional()
    .isBoolean()
    .withMessage('include_msf_page harus berupa boolean')
    .toBoolean(),
  body('manage_quotation_items')
    .optional()
    .isArray({ min: 0 })
    .withMessage('Manage quotation items harus berupa array'),
  body('manage_quotation_items.*.componen_product_id')
    .optional()
    .isUUID()
    .withMessage('Format componen_product_id tidak valid'),
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
  body('manage_quotation_items.*.code_unique')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Code unique maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.segment')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Segment maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.msi_model')
    .optional()
    .isLength({ max: 255 })
    .withMessage('MSI model maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.msi_product')
    .optional()
    .isLength({ max: 255 })
    .withMessage('MSI product maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.wheel_no')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Wheel no maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.engine')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Engine maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.volume')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Volume maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.horse_power')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Horse power maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.market_price')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Market price maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.componen_product_name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Componen product name maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.description')
    .optional()
    .trim(),
  body('manage_quotation_items.*.order_number')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order number harus berupa angka bulat non-negatif'),
  body('manage_quotation_items.*.manage_quotation_item_accessories')
    .optional()
    .isArray({ min: 0 })
    .withMessage('Manage quotation item accessories harus berupa array'),
  body('manage_quotation_items.*.manage_quotation_item_accessories.*.accessory_id')
    .optional()
    .isUUID()
    .withMessage('Format accessory_id tidak valid'),
  body('manage_quotation_items.*.manage_quotation_item_accessories.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity harus berupa angka positif'),
  body('manage_quotation_items.*.manage_quotation_item_accessories.*.description')
    .optional()
    .trim(),
  body('manage_quotation_items.*.manage_quotation_item_accessories.*.accessory_part_number')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory part number maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.manage_quotation_item_accessories.*.accessory_part_name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory part name maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.manage_quotation_item_accessories.*.accessory_specification')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory specification maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.manage_quotation_item_accessories.*.accessory_brand')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory brand maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.manage_quotation_item_accessories.*.accessory_remark')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory remark maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.manage_quotation_item_accessories.*.accessory_region')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory region maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.manage_quotation_item_accessories.*.accessory_description')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Accessory description maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.manage_quotation_item_accessories.*.componen_product_id')
    .optional()
    .isUUID()
    .withMessage('Format componen_product_id pada accessory tidak valid'),
  body('manage_quotation_items.*.manage_quotation_item_specifications')
    .optional()
    .isArray({ min: 0 })
    .withMessage('Manage quotation item specifications harus berupa array'),
  body('manage_quotation_items.*.manage_quotation_item_specifications.*.componen_product_id')
    .optional()
    .isUUID()
    .withMessage('Format componen_product_id pada specification tidak valid'),
  body('manage_quotation_items.*.manage_quotation_item_specifications.*.manage_quotation_item_specification_label')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Label specification maksimal 255 karakter')
    .trim(),
  body('manage_quotation_items.*.manage_quotation_item_specifications.*.manage_quotation_item_specification_value')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Value specification maksimal 255 karakter')
    .trim(),
  // Validation for manage_quotation_item_accessories at root level
  body('manage_quotation_item_accessories')
    .optional()
    .isArray({ min: 0 })
    .withMessage('Manage quotation item accessories harus berupa array'),
  body('manage_quotation_item_accessories.*.accessory_id')
    .optional()
    .isUUID()
    .withMessage('Format accessory_id tidak valid'),
  body('manage_quotation_item_accessories.*.quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity harus berupa angka integer positif'),
  body('manage_quotation_item_accessories.*.description')
    .optional()
    .isString()
    .withMessage('Description harus berupa string')
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
  body('status')
    .optional()
    .custom((value) => {
      // Allow empty string, null, undefined, or valid status values
      if (value === null || value === undefined || value === '') {
        return true;
      }
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') {
          return true;
        }
        return ['draft', 'submit', 'reject'].includes(trimmed.toLowerCase());
      }
      return false;
    })
    .withMessage('Status harus salah satu dari: draft, submit, reject atau kosong'),
  body('island_id')
    .optional()
    .custom((value) => {
      // Allow empty string, null, undefined, NaN, or valid UUID
      if (value === null || value === undefined || value === '') {
        return true;
      }
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '' || trimmed === 'NaN' || trimmed === 'null') {
          return true;
        }
        // If not empty, must be valid UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(trimmed);
      }
      // Allow NaN
      if (typeof value === 'number' && isNaN(value)) {
        return true;
      }
      return false;
    })
    .withMessage('island_id harus berupa UUID yang valid, string kosong, null, atau NaN'),
];

/**
 * Validation rules for duplicating manage quotation
 */
const duplikatValidation = [
  param('manage_quotation_id')
    .notEmpty()
    .withMessage('manage_quotation_id wajib diisi')
    .isUUID()
    .withMessage('Format manage_quotation_id tidak valid'),
];

module.exports = {
  createValidation,
  updateValidation,
  getByIdValidation,
  listValidation,
  duplikatValidation
};

