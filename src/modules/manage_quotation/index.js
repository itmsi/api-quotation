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
 * @route   POST /api/quotation/manage-quotation/get
 * @desc    Get all manage quotations with pagination
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
 * @route   GET /api/quotation/manage-quotation/:id
 * @desc    Get manage quotation by ID
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
 * @route   POST /api/quotation/manage-quotation
 * @desc    Create new manage quotation
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
 * @route   PUT /api/quotation/manage-quotation/:id
 * @desc    Update manage quotation
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
 * @route   DELETE /api/quotation/manage-quotation/:id
 * @desc    Soft delete manage quotation
 * @access  Protected
 */
router.delete(
  '/:id',
  getByIdValidation,
  validateMiddleware,
  verifyToken,
  handler.remove
);

/**
 * @route   POST /api/quotation/manage-quotation/:id/restore
 * @desc    Restore soft deleted manage quotation
 * @access  Protected
 */
router.post(
  '/:id/restore',
  getByIdValidation,
  validateMiddleware,
  verifyToken,
  handler.restore
);

module.exports = router;

