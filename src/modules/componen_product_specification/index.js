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
 * @route   POST /api/quotation/componen_product/specification/get
 * @desc    Get all componen product specifications with pagination
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
 * @route   GET /api/quotation/componen_product/specification/:id
 * @desc    Get componen product specification by ID
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
 * @route   POST /api/quotation/componen_product/specification/create
 * @desc    Create new componen product specification
 * @access  Protected
 */
router.post(
  '/',
  createValidation,
  validateMiddleware,
  verifyToken,
  handler.create
);

/**
 * @route   PUT /api/quotation/componen_product/specification/:id
 * @desc    Update componen product specification
 * @access  Protected
 */
router.put(
  '/:id',
  updateValidation,
  validateMiddleware,
  verifyToken,
  handler.update
);

/**
 * @route   DELETE /api/quotation/componen_product/specification/:id
 * @desc    Soft delete componen product specification
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


