const { body, param } = require('express-validator');

/**
 * Validation rules for creating item product
 */
const createValidation = [
  body('item_product_code')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product code maksimal 255 karakter')
    .trim(),
  body('item_product_model')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product model maksimal 255 karakter')
    .trim(),
  body('item_product_segment')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product segment maksimal 255 karakter')
    .trim(),
  body('item_product_msi_model')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product MSI model maksimal 255 karakter')
    .trim(),
  body('item_product_wheel_no')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product wheel no maksimal 255 karakter')
    .trim(),
  body('item_product_engine')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product engine maksimal 255 karakter')
    .trim(),
  body('item_product_horse_power')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product horse power maksimal 255 karakter')
    .trim(),
  body('item_product_market_price')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product market price maksimal 255 karakter')
    .trim(),
  body('item_product_selling_price_star_1')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product selling price star 1 maksimal 255 karakter')
    .trim(),
  body('item_product_selling_price_star_2')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product selling price star 2 maksimal 255 karakter')
    .trim(),
  body('item_product_selling_price_star_3')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product selling price star 3 maksimal 255 karakter')
    .trim(),
  body('item_product_selling_price_star_4')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product selling price star 4 maksimal 255 karakter')
    .trim(),
  body('item_product_selling_price_star_5')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product selling price star 5 maksimal 255 karakter')
    .trim(),
  body('item_product_description')
    .optional()
    .isString()
    .withMessage('Item product description harus berupa string'),
  body('item_product_image')
    .optional()
    .isString()
    .withMessage('Item product image harus berupa string (URL)')
];

/**
 * Validation rules for updating item product
 */
const updateValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID wajib diisi')
    .isUUID()
    .withMessage('Format ID tidak valid'),
  body('item_product_code')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product code maksimal 255 karakter')
    .trim(),
  body('item_product_model')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product model maksimal 255 karakter')
    .trim(),
  body('item_product_segment')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product segment maksimal 255 karakter')
    .trim(),
  body('item_product_msi_model')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product MSI model maksimal 255 karakter')
    .trim(),
  body('item_product_wheel_no')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product wheel no maksimal 255 karakter')
    .trim(),
  body('item_product_engine')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product engine maksimal 255 karakter')
    .trim(),
  body('item_product_horse_power')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product horse power maksimal 255 karakter')
    .trim(),
  body('item_product_market_price')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product market price maksimal 255 karakter')
    .trim(),
  body('item_product_selling_price_star_1')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product selling price star 1 maksimal 255 karakter')
    .trim(),
  body('item_product_selling_price_star_2')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product selling price star 2 maksimal 255 karakter')
    .trim(),
  body('item_product_selling_price_star_3')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product selling price star 3 maksimal 255 karakter')
    .trim(),
  body('item_product_selling_price_star_4')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product selling price star 4 maksimal 255 karakter')
    .trim(),
  body('item_product_selling_price_star_5')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Item product selling price star 5 maksimal 255 karakter')
    .trim(),
  body('item_product_description')
    .optional()
    .isString()
    .withMessage('Item product description harus berupa string'),
  body('item_product_image')
    .optional()
    .isString()
    .withMessage('Item product image harus berupa string (URL)')
];

/**
 * Validation rules for getting item product by ID
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
    .isIn(['created_at', 'item_product_code', 'item_product_model', 'item_product_segment'])
    .withMessage('Sort by harus salah satu dari: created_at, item_product_code, item_product_model, item_product_segment'),
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

