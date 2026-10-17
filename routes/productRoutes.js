const express = require('express');
const router = express.Router();
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { admin } = require('../utils/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(admin, createProduct);

router.route('/:id')
  .put(admin, updateProduct)
  .delete(admin, deleteProduct);

module.exports = router;
