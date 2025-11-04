const express = require('express');
const router = express.Router();
const handler = require('./handler');
const {
  createValidation,
  updateValidation,
  getByIdValidation,
  listValidation
} = require('./validation');
const { verifyToken } = require('../../middlewares');
const { validateMiddleware } = require('../../middlewares/validation');

/**
 * @route   POST /api/quotation/item_product/get
 * @desc    Get all item products with pagination
 * @access  Protected
 */
router.post(
  '/get',
  listValidation,
  validateMiddleware,
  verifyToken,
  handler.getAll
);

/**
 * @route   GET /api/quotation/item_product/:id
 * @desc    Get item product by ID
 * @access  Protected
 */
router.get(
  '/:id',
  getByIdValidation,
  validateMiddleware,
  verifyToken,
  handler.getById
);

/**
 * @route   POST /api/quotation/item_product
 * @desc    Create new item product
 * @access  Protected
 */
router.post(
  '/',
  verifyToken,
  handler.handleImageUpload,
  createValidation,
  validateMiddleware,
  handler.create
);

/**
 * @route   PUT /api/quotation/item_product/:id
 * @desc    Update item product
 * @access  Protected
 */
router.put(
  '/:id',
  verifyToken,
  handler.handleImageUpload,
  updateValidation,
  validateMiddleware,
  handler.update
);

/**
 * @route   DELETE /api/quotation/item_product/:id
 * @desc    Soft delete item product
 * @access  Protected
 */
router.delete(
  '/:id',
  getByIdValidation,
  validateMiddleware,
  verifyToken,
  handler.remove
);

module.exports = router;

