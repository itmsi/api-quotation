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
 * @route   POST /api/quotation/bank-account/get
 * @desc    Get all bank accounts with pagination
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
 * @route   GET /api/quotation/bank-account/:id
 * @desc    Get bank account by ID
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
 * @route   POST /api/quotation/bank-account
 * @desc    Create new bank account
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
 * @route   PUT /api/quotation/bank-account/:id
 * @desc    Update bank account
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
 * @route   DELETE /api/quotation/bank-account/:id
 * @desc    Soft delete bank account
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
 * @route   POST /api/quotation/bank-account/:id/restore
 * @desc    Restore soft deleted bank account
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

