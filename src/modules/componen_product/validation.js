const { body, param } = require('express-validator');

/**
 * Validation rules for creating componen product
 */
const createValidation = [
  body('componen_type')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('Componen type harus berupa angka 1, 2, atau 3 (1: OFF ROAD REGULAR, 2: ON ROAD REGULAR, 3: OFF ROAD IRREGULAR)'),
  body('componen_product_name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Componen product name maksimal 255 karakter')
    .trim(),
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
  body('msi_product')
    .optional()
    .isLength({ max: 255 })
    .withMessage('MSI product maksimal 255 karakter')
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
  body('componen_product_unit_model')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Componen product unit model maksimal 255 karakter')
    .trim(),
  body('volume')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Volume maksimal 255 karakter')
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
    .withMessage('Componen product description harus berupa string'),
  body('componen_product_specifications')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') {
        return true;
      }

      let parsed = value;

      if (typeof parsed === 'string') {
        const trimmed = parsed.trim();
        if (trimmed === '') {
          return true;
        }
        try {
          parsed = JSON.parse(trimmed);
        } catch (error) {
          throw new Error('Format componen_product_specifications harus berupa JSON yang valid');
        }
      }

      if (!Array.isArray(parsed)) {
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('componen_product_specifications harus berupa objek atau array objek');
        }
        parsed = [parsed];
      }

      parsed.forEach((item) => {
        if (typeof item !== 'object' || item === null) {
          throw new Error('Setiap item componen_product_specifications harus berupa objek');
        }
      });

      return true;
    })
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
  body('componen_type')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('Componen type harus berupa angka 1, 2, atau 3 (1: OFF ROAD REGULAR, 2: ON ROAD REGULAR, 3: OFF ROAD IRREGULAR)'),
  body('componen_product_name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Componen product name maksimal 255 karakter')
    .trim(),
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
  body('msi_product')
    .optional()
    .isLength({ max: 255 })
    .withMessage('MSI product maksimal 255 karakter')
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
  body('componen_product_unit_model')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Componen product unit model maksimal 255 karakter')
    .trim(),
  body('volume')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Volume maksimal 255 karakter')
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
    .withMessage('Componen product description harus berupa string'),
  body('componen_product_specifications')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') {
        return true;
      }

      let parsed = value;

      if (typeof parsed === 'string') {
        const trimmed = parsed.trim();
        if (trimmed === '') {
          return true;
        }
        try {
          parsed = JSON.parse(trimmed);
        } catch (error) {
          throw new Error('Format componen_product_specifications harus berupa JSON yang valid');
        }
      }

      if (!Array.isArray(parsed)) {
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('componen_product_specifications harus berupa objek atau array objek');
        }
        parsed = [parsed];
      }

      parsed.forEach((item) => {
        if (typeof item !== 'object' || item === null) {
          throw new Error('Setiap item componen_product_specifications harus berupa objek');
        }
      });

      return true;
    })
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
    .isIn(['created_at', 'code_unique', 'componen_product_name', 'segment', 'msi_model', 'msi_product', 'volume', 'componen_product_unit_model'])
    .withMessage('Sort by harus salah satu dari: created_at, code_unique, componen_product_name, segment, msi_model, msi_product, volume, componen_product_unit_model'),
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

