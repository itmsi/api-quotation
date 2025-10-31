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
 * @route   POST /api/quotation/term_content/get
 * @desc    Mendapatkan daftar term content dengan paginasi
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
 * @route   GET /api/quotation/term_content/:id
 * @desc    Mendapatkan detail term content berdasarkan ID
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
 * @route   POST /api/quotation/term_content
 * @desc    Membuat data term content baru
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
 * @route   PUT /api/quotation/term_content/:id
 * @desc    Memperbarui data term content
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
 * @route   DELETE /api/quotation/term_content/:id
 * @desc    Menghapus (soft delete) data term content
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


