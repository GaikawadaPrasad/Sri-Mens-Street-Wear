require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const User = require('../models/User');

const products = [
  // Shirts
  {
    name: 'Oxford Cotton Casual Shirt',
    category: 'Shirts',
    price: 999,
    description: '100% pure combed cotton casual button-down shirt for effortless street style.',
    active: true,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Navy Blue', 'Olive']
  },
  {
    name: 'Vintage Check Flannel Shirt',
    category: 'Shirts',
    price: 1199,
    description: 'Rugged vintage check pattern with brushed warm cotton finish.',
    active: true,
    sizes: ['M', 'L', 'XL'],
    colors: ['Red/Black', 'Brown/Beige']
  },
  {
    name: 'Cuban Collar Printed Shirt',
    category: 'Shirts',
    price: 899,
    description: 'Relaxed resort style cuban collar shirt with modern abstract prints.',
    active: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Monochrome', 'Tropical Dark']
  },

  // Jeans
  {
    name: 'Distressed Slim Fit Denim Jeans',
    category: 'Jeans',
    price: 1599,
    description: 'Comfort stretch denim with handcrafted knee distress and whiskers.',
    active: true,
    sizes: ['30', '32', '34', '36'],
    colors: ['Medium Wash Blue', 'Washed Grey']
  },
  {
    name: 'Jet Black Clean Tapered Jeans',
    category: 'Jeans',
    price: 1499,
    description: 'Deep black stay-color stretch denim with modern tapered leg.',
    active: true,
    sizes: ['30', '32', '34', '36'],
    colors: ['Jet Black']
  },
  {
    name: 'Wide Leg Streetwear Denim',
    category: 'Jeans',
    price: 1799,
    description: 'Retro 90s baggy fit with heavy 14oz rigid raw cotton feel.',
    active: true,
    sizes: ['30', '32', '34'],
    colors: ['Light Vintage Blue']
  },

  // T-Shirts
  {
    name: 'Oversized Heavyweight Graphic Tee',
    category: 'T-Shirts',
    price: 699,
    description: '240 GSM French terry cotton with high-density puff street graphic print.',
    active: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Acid Wash Black', 'Off White']
  },
  {
    name: 'Drop Shoulder Boxy Tee',
    category: 'T-Shirts',
    price: 599,
    description: 'Minimalist street essential featuring seamless drop shoulders.',
    active: true,
    sizes: ['M', 'L', 'XL'],
    colors: ['Sage Green', 'Charcoal', 'Sand']
  },

  // Hoodies
  {
    name: 'Urban Streetwear Fleece Hoodie',
    category: 'Hoodies',
    price: 1899,
    description: 'Ultra-warm 380 GSM fleece pullover hoodie with double layered hood.',
    active: true,
    sizes: ['M', 'L', 'XL'],
    colors: ['Heather Grey', 'Obsidian Black']
  },
  {
    name: 'Acid Wash Zip-Up Sweatshirt',
    category: 'Hoodies',
    price: 1699,
    description: 'Heavy duty YKK zipper with ribbed cuffs and vintage pigment dye.',
    active: true,
    sizes: ['L', 'XL'],
    colors: ['Washed Charcoal']
  },

  // Footwear & Accessories
  {
    name: 'Classic Street Low-Top Sneakers',
    category: 'Footwear',
    price: 2499,
    description: 'Cushioned vulcanized sole with premium vegan leather contrast stripes.',
    active: true,
    sizes: ['7', '8', '9', '10'],
    colors: ['White/Black']
  },
  {
    name: 'Embroidered Crown Streetwear Cap',
    category: 'Accessories',
    price: 499,
    description: 'Structured 6-panel cotton twill cap with metallic gold crown embroidery.',
    active: true,
    sizes: ['Adjustable'],
    colors: ['Midnight Black']
  }
];

const sampleSalesHistory = [
  // Today's Sales
  {
    cloth: 'Oxford Cotton Casual Shirt',
    price: 999,
    discount: 100,
    paymentMode: 'UPI',
    customerName: 'Karthik Raja',
    phone: '9840123456',
    daysAgo: 0,
    time: '11:15'
  },
  {
    cloth: 'Distressed Slim Fit Denim Jeans',
    price: 1599,
    discount: 150,
    paymentMode: 'Cash',
    customerName: 'Vignesh M',
    phone: '9790456123',
    daysAgo: 0,
    time: '12:30'
  },
  {
    cloth: 'Oversized Heavyweight Graphic Tee',
    price: 699,
    discount: 50,
    paymentMode: 'UPI',
    customerName: 'Rahul Kumar',
    phone: '9944112233',
    daysAgo: 0,
    time: '14:20'
  },
  {
    cloth: 'Urban Streetwear Fleece Hoodie',
    price: 1899,
    discount: 200,
    paymentMode: 'Card',
    customerName: 'Deepak S',
    phone: '',
    daysAgo: 0,
    time: '16:05'
  },
  {
    cloth: 'Classic Street Low-Top Sneakers',
    price: 2499,
    discount: 300,
    paymentMode: 'UPI',
    customerName: 'Praveen Chandran',
    phone: '9841556677',
    daysAgo: 0,
    time: '17:45'
  },
  // Yesterday's Sales
  {
    cloth: 'Vintage Check Flannel Shirt',
    price: 1199,
    discount: 100,
    paymentMode: 'UPI',
    customerName: 'Manoj',
    phone: '9884012987',
    daysAgo: 1,
    time: '11:00'
  },
  {
    cloth: 'Jet Black Clean Tapered Jeans',
    price: 1499,
    discount: 150,
    paymentMode: 'Cash',
    customerName: 'Sanjay R',
    phone: '',
    daysAgo: 1,
    time: '13:40'
  },
  {
    cloth: 'Drop Shoulder Boxy Tee',
    price: 599,
    discount: 0,
    paymentMode: 'UPI',
    customerName: 'Aravind',
    phone: '9710334455',
    daysAgo: 1,
    time: '16:15'
  },
  {
    cloth: 'Embroidered Crown Streetwear Cap',
    price: 499,
    discount: 50,
    paymentMode: 'UPI',
    customerName: 'Suresh Kumar',
    phone: '',
    daysAgo: 1,
    time: '18:10'
  },
  // Day -2
  {
    cloth: 'Distressed Slim Fit Denim Jeans',
    price: 1599,
    discount: 200,
    paymentMode: 'UPI',
    customerName: 'Vijay V',
    phone: '9840223344',
    daysAgo: 2,
    time: '12:10'
  },
  {
    cloth: 'Oxford Cotton Casual Shirt',
    price: 999,
    discount: 100,
    paymentMode: 'Card',
    customerName: 'Dinesh',
    phone: '',
    daysAgo: 2,
    time: '15:25'
  },
  // Day -3
  {
    cloth: 'Urban Streetwear Fleece Hoodie',
    price: 1899,
    discount: 200,
    paymentMode: 'UPI',
    customerName: 'Ajith',
    phone: '9884556677',
    daysAgo: 3,
    time: '14:00'
  },
  {
    cloth: 'Cuban Collar Printed Shirt',
    price: 899,
    discount: 50,
    paymentMode: 'Cash',
    customerName: 'Surya',
    phone: '',
    daysAgo: 3,
    time: '17:30'
  },
  // Day -4
  {
    cloth: 'Classic Street Low-Top Sneakers',
    price: 2499,
    discount: 250,
    paymentMode: 'UPI',
    customerName: 'Harish',
    phone: '9940112233',
    daysAgo: 4,
    time: '13:15'
  },
  // Day -5
  {
    cloth: 'Wide Leg Streetwear Denim',
    price: 1799,
    discount: 200,
    paymentMode: 'Card',
    customerName: 'Gowtham',
    phone: '',
    daysAgo: 5,
    time: '16:45'
  },
  // Day -6
  {
    cloth: 'Oversized Heavyweight Graphic Tee',
    price: 699,
    discount: 50,
    paymentMode: 'UPI',
    customerName: 'Ashwin',
    phone: '9840332211',
    daysAgo: 6,
    time: '15:00'
  }
];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sri_mens_streetwear';
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB at ${mongoUri}`);

    // Seed Admin User
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        approved: true
      });
      console.log('Admin user created (admin / admin123)');
    } else {
      console.log('Admin user already exists');
    }

    // Clear old products & sales
    await Product.deleteMany({});
    await Sale.deleteMany({});
    console.log('Cleared existing products and sales records.');

    // Insert sample clothing catalog
    const insertedProducts = await Product.insertMany(products);
    console.log(`Successfully seeded ${insertedProducts.length} clothing items.`);

    // Build and insert sales
    const now = new Date();
    const formattedSales = sampleSalesHistory.map((item, idx) => {
      const d = new Date(now);
      d.setDate(d.getDate() - item.daysAgo);
      const dateStr = d.toISOString().split('T')[0];

      const price = item.price;
      const discount = item.discount || 0;
      const totalAmount = Math.max(0, price - discount);

      return {
        billNumber: `SMSW-${dateStr.replace(/-/g, '').slice(2)}-${String(idx + 1).padStart(3, '0')}`,
        cloth: item.cloth,
        productName: item.cloth,
        price,
        unitPrice: price,
        discount,
        totalAmount,
        quantity: 1,
        category: 'Clothing',
        paymentMode: item.paymentMode,
        customerName: item.customerName,
        phone: item.phone,
        date: dateStr,
        time: item.time,
        createdAt: d
      };
    });

    const insertedSales = await Sale.insertMany(formattedSales);
    console.log(`Successfully seeded ${insertedSales.length} historical sales records.`);

    console.log('Sri Mens Street Wear database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
