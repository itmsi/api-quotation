const { body, param } = require('express-validator');

/**
 * Validation rules for creating componen product
 */
const createValidation = [
  body('product_dimensi_id')
    .optional()
    .isUUID()
    .withMessage('Product dimensi ID harus berupa UUID yang valid'),
  body('componen_type')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('Componen type harus berupa angka 1, 2, atau 3 (1: OFF ROAD REGULAR, 2: ON ROAD REGULAR, 3: OFF ROAD IRREGULAR)'),
  body('code_unique')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Code unique maksimal 255 karakter')
    .trim(),
  body('segment')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Segment maksimal 255 karakter')
    .trim(),
  body('msi_model')
    .optional()
    .isLength({ max: 255 })
    .withMessage('MSI model maksimal 255 karakter')
    .trim(),
  body('wheel_no')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Wheel no maksimal 255 karakter')
    .trim(),
  body('engine')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Engine maksimal 255 karakter')
    .trim(),
  body('horse_power')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Horse power maksimal 255 karakter')
    .trim(),
  body('market_price')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Market price maksimal 255 karakter')
    .trim(),
  body('selling_price_star_1')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Selling price star 1 maksimal 255 karakter')
    .trim(),
  body('selling_price_star_2')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Selling price star 2 maksimal 255 karakter')
    .trim(),
  body('selling_price_star_3')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Selling price star 3 maksimal 255 karakter')
    .trim(),
  body('selling_price_star_4')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Selling price star 4 maksimal 255 karakter')
    .trim(),
  body('selling_price_star_5')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Selling price star 5 maksimal 255 karakter')
    .trim(),
  body('image')
    .optional()
    .isString()
    .withMessage('Image harus berupa string (URL)'),
  body('componen_product_description')
    .optional()
    .isString()
    .withMessage('Componen product description harus berupa string')
];

/**
 * Validation rules for updating componen product
 */
const updateValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID wajib diisi')
    .isUUID()
    .withMessage('Format ID tidak valid'),
  body('product_dimensi_id')
    .optional()
    .isUUID()
    .withMessage('Product dimensi ID harus berupa UUID yang valid'),
  body('componen_type')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('Componen type harus berupa angka 1, 2, atau 3 (1: OFF ROAD REGULAR, 2: ON ROAD REGULAR, 3: OFF ROAD IRREGULAR)'),
  body('code_unique')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Code unique maksimal 255 karakter')
    .trim(),
  body('segment')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Segment maksimal 255 karakter')
    .trim(),
  body('msi_model')
    .optional()
    .isLength({ max: 255 })
    .withMessage('MSI model maksimal 255 karakter')
    .trim(),
  body('wheel_no')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Wheel no maksimal 255 karakter')
    .trim(),
  body('engine')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Engine maksimal 255 karakter')
    .trim(),
  body('horse_power')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Horse power maksimal 255 karakter')
    .trim(),
  body('market_price')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Market price maksimal 255 karakter')
    .trim(),
  body('selling_price_star_1')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Selling price star 1 maksimal 255 karakter')
    .trim(),
  body('selling_price_star_2')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Selling price star 2 maksimal 255 karakter')
    .trim(),
  body('selling_price_star_3')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Selling price star 3 maksimal 255 karakter')
    .trim(),
  body('selling_price_star_4')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Selling price star 4 maksimal 255 karakter')
    .trim(),
  body('selling_price_star_5')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Selling price star 5 maksimal 255 karakter')
    .trim(),
  body('image')
    .optional()
    .isString()
    .withMessage('Image harus berupa string (URL)'),
  body('componen_product_description')
    .optional()
    .isString()
    .withMessage('Componen product description harus berupa string')
];

/**
 * Validation rules for getting componen product by ID
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
    .isIn(['created_at', 'code_unique', 'segment', 'msi_model'])
    .withMessage('Sort by harus salah satu dari: created_at, code_unique, segment, msi_model'),
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

