const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    trim: true,
    default: ''
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  cloth: {
    type: String,
    required: [true, 'Clothing item name/description is required'],
    trim: true
  },
  // Keep productName as virtual or alias for backward compatibility with frontend/reports
  productName: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    default: 'Clothing',
    trim: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  unitPrice: {
    type: Number,
    min: [0, 'Unit price cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  paymentMode: {
    type: String,
    required: [true, 'Payment mode is required'],
    enum: ['Cash', 'UPI', 'Card', 'Other'],
    default: 'UPI'
  },
  customerName: {
    type: String,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  date: {
    type: String, // format YYYY-MM-DD
    required: [true, 'Sale date is required']
  },
  time: {
    type: String, // format HH:MM
    required: [true, 'Sale time is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to ensure productName and unitPrice match cloth and price
SaleSchema.pre('save', function (next) {
  if (!this.cloth && this.productName) {
    this.cloth = this.productName;
  }
  if (!this.productName && this.cloth) {
    this.productName = this.cloth;
  }
  if (this.price !== undefined && this.unitPrice === undefined) {
    this.unitPrice = this.price;
  }
  if (this.unitPrice !== undefined && this.price === undefined) {
    this.price = this.unitPrice;
  }
  next();
});

module.exports = mongoose.model('Sale', SaleSchema);
