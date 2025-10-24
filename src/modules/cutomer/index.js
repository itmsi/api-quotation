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
 * @route   POST /api/catalogs/cutomer/get
 * @desc    Get all customers with pagination
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
 * @route   GET /api/catalogs/cutomer/:id
 * @desc    Get customer by ID
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
 * @route   POST /api/catalogs/cutomer
 * @desc    Create new customer
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
 * @route   PUT /api/catalogs/cutomer/:id
 * @desc    Update customer
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
 * @route   DELETE /api/catalogs/cutomer/:id
 * @desc    Soft delete customer
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
 * @route   POST /api/catalogs/cutomer/:id/restore
 * @desc    Restore soft deleted customer
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

