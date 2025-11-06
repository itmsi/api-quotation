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
 * @route   POST /api/quotation/accessory/get
 * @desc    Get all accessories with pagination
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
 * @route   GET /api/quotation/accessory/:id
 * @desc    Get accessory by ID
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
 * @route   POST /api/quotation/accessory/create
 * @desc    Create new accessory
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
 * @route   PUT /api/quotation/accessory/:id
 * @desc    Update accessory
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
 * @route   DELETE /api/quotation/accessory/:id
 * @desc    Soft delete accessory
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

