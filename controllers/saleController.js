const Sale = require('../models/Sale');

// @desc    Get all sales with optional filters
// @route   GET /api/sales
// @access  Public
exports.getSales = async (req, res) => {
  try {
    const { date, paymentMode, category, search } = req.query;
    const query = {};

    if (date) {
      query.date = date;
    }

    if (paymentMode) {
      query.paymentMode = paymentMode;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { cloth: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { billNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const sales = await Sale.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: sales.length, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a new sale record or batch of items
// @route   POST /api/sales
// @access  Public
exports.createSale = async (req, res) => {
  try {
    const now = new Date();
    const defaultDate = now.toISOString().split('T')[0];
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const defaultTime = `${hours}:${minutes}`;

    // Helper to sanitize and format a single sale item
    const formatItem = (item, billNum) => {
      const cloth = item.cloth || item.productName || 'Clothing Item';
      const price = Number(item.price !== undefined ? item.price : item.unitPrice) || 0;
      let discount = Number(item.discount) || 0;

      if (price < 0) {
        throw new Error(`Price cannot be negative for item: ${cloth}`);
      }
      if (discount < 0) {
        throw new Error(`Discount cannot be negative for item: ${cloth}`);
      }
      if (discount > price) {
        throw new Error(`Discount (₹${discount}) cannot exceed price (₹${price}) for item: ${cloth}`);
      }

      const totalAmount = Math.max(0, price - discount);

      return {
        billNumber: item.billNumber || billNum,
        cloth,
        productName: cloth,
        price,
        unitPrice: price,
        discount,
        totalAmount,
        quantity: Number(item.quantity) || 1,
        category: item.category || 'Clothing',
        paymentMode: item.paymentMode || req.body.paymentMode || 'UPI',
        customerName: item.customerName !== undefined ? item.customerName : (req.body.customerName || ''),
        phone: item.phone !== undefined ? item.phone : (req.body.phone || ''),
        date: item.date || req.body.date || defaultDate,
        time: item.time || req.body.time || defaultTime
      };
    };

    // If request body is an array of items (full bill checkout)
    if (Array.isArray(req.body)) {
      if (req.body.length === 0) {
        return res.status(400).json({ success: false, error: 'No items provided in bill' });
      }
      const generatedBillNumber = `SMSW-${Date.now().toString().slice(-6)}`;
      const formattedItems = req.body.map(item => formatItem(item, generatedBillNumber));
      const createdSales = await Sale.insertMany(formattedItems);
      return res.status(201).json({ success: true, count: createdSales.length, data: createdSales });
    }

    // If request body contains an items array: { items: [...], customerName, phone, paymentMode, date }
    if (req.body.items && Array.isArray(req.body.items)) {
      if (req.body.items.length === 0) {
        return res.status(400).json({ success: false, error: 'No items provided in bill' });
      }
      const generatedBillNumber = req.body.billNumber || `SMSW-${Date.now().toString().slice(-6)}`;
      const formattedItems = req.body.items.map(item => formatItem({
        ...item,
        customerName: req.body.customerName,
        phone: req.body.phone,
        paymentMode: req.body.paymentMode,
        date: req.body.date
      }, generatedBillNumber));
      const createdSales = await Sale.insertMany(formattedItems);
      return res.status(201).json({ success: true, count: createdSales.length, data: createdSales });
    }

    // Single item creation
    const generatedBillNumber = req.body.billNumber || `SMSW-${Date.now().toString().slice(-6)}`;
    const formattedData = formatItem(req.body, generatedBillNumber);
    const sale = await Sale.create(formattedData);
    res.status(201).json({ success: true, data: sale });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update a sale record
// @route   PUT /api/sales/:id
// @access  Public
exports.updateSale = async (req, res) => {
  try {
    const {
      cloth,
      productName,
      price,
      unitPrice,
      discount,
      paymentMode,
      customerName,
      phone,
      quantity,
      date,
      time
    } = req.body;

    let sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ success: false, error: 'Sale record not found' });
    }

    if (cloth !== undefined || productName !== undefined) {
      const name = cloth || productName;
      sale.cloth = name;
      sale.productName = name;
    }

    const itemPrice = price !== undefined ? Number(price) : (unitPrice !== undefined ? Number(unitPrice) : sale.price);
    const itemDiscount = discount !== undefined ? Number(discount) : sale.discount;

    if (itemPrice < 0) {
      return res.status(400).json({ success: false, error: 'Price cannot be negative' });
    }
    if (itemDiscount < 0) {
      return res.status(400).json({ success: false, error: 'Discount cannot be negative' });
    }
    if (itemDiscount > itemPrice) {
      return res.status(400).json({ success: false, error: 'Discount cannot exceed item price' });
    }

    sale.price = itemPrice;
    sale.unitPrice = itemPrice;
    sale.discount = itemDiscount;
    sale.totalAmount = Math.max(0, itemPrice - itemDiscount);

    if (quantity !== undefined) sale.quantity = Number(quantity);
    if (paymentMode !== undefined) sale.paymentMode = paymentMode;
    if (customerName !== undefined) sale.customerName = customerName;
    if (phone !== undefined) sale.phone = phone;
    if (date !== undefined) sale.date = date;
    if (time !== undefined) sale.time = time;

    await sale.save();

    res.status(200).json({ success: true, data: sale });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete a sale record
// @route   DELETE /api/sales/:id
// @access  Public
exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ success: false, error: 'Sale record not found' });
    }

    await sale.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
