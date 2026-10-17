const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Cloth/Product name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    default: 'Shirts',
    enum: ['Shirts', 'Jeans', 'T-Shirts', 'Hoodies', 'Footwear', 'Accessories', 'Trousers', 'Jackets', 'Others']
  },
  price: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  },
  // Available sizes (e.g. S, M, L, XL, XXL, 30, 32, 34, 36)
  sizes: [
    { type: String }
  ],
  // Available colors (e.g. Black, White, Navy, Olive)
  colors: [
    { type: String }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);
