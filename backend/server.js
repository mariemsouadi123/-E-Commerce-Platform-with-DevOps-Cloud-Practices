// Import required modules
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Database connection
let db;

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Connect to MySQL
async function connectToDatabase() {
  try {
    console.log('Connecting to MySQL database...');
    
    // Create connection
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    await db.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Database '${process.env.DB_NAME}' ready`);

    // Use the database
    await db.query(`USE ${process.env.DB_NAME}`);

    // Create tables
    await createTables();
    
    // Insert sample data
    await insertSampleData();

    console.log('🎉 Database setup completed!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('💡 Please check:');
    console.error('   1. Is MySQL running?');
    console.error('   2. Check your password in .env file');
    process.exit(1);
  }
}

// Create tables function
async function createTables() {
  console.log('🔄 Creating tables...');

  // Users table for authentication
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('customer', 'admin') DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Products table
  await db.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      image_url VARCHAR(500),
      category VARCHAR(100),
      stock INT DEFAULT 10,
      rating DECIMAL(3, 2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Orders table
  await db.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      total_amount DECIMAL(10, 2) NOT NULL,
      shipping_address TEXT,
      status ENUM('pending', 'processing', 'shipped', 'delivered') DEFAULT 'pending',
      payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
      payment_method ENUM('card', 'paypal', 'cash') DEFAULT 'card',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Order items table
  await db.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT PRIMARY KEY AUTO_INCREMENT,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Payments table for tracking
  await db.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      order_id INT NOT NULL,
      payment_method VARCHAR(100) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      status VARCHAR(50) NOT NULL,
      transaction_id VARCHAR(255),
      card_last4 VARCHAR(4),
      card_brand VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);

  console.log('✅ Tables created successfully');
}

// Insert sample data function
async function insertSampleData() {
  try {
    // Check if users table is empty
    const [users] = await db.query('SELECT COUNT(*) as count FROM users');
    
    if (users[0].count === 0) {
      console.log('📝 Inserting sample user...');
      
      // Hash password for sample user
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      // Insert sample admin user
      await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin User', 'admin@example.com', hashedPassword, 'admin']
      );
      
      // Insert sample customer user
      await db.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        ['John Doe', 'john@example.com', hashedPassword]
      );
      
      console.log('✅ Sample users inserted successfully');
    }

    // Check if products table is empty
    const [products] = await db.query('SELECT COUNT(*) as count FROM products');
    
    if (products[0].count === 0) {
      console.log('📝 Inserting sample products...');
      
      // Sample products data
      const sampleProducts = [
        {
          name: "Wireless Bluetooth Headphones",
          description: "Noise cancelling headphones with 30hr battery life",
          price: 89.99,
          image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
          category: "Electronics",
          stock: 25,
          rating: 4.5
        },
        {
          name: "Classic Leather Watch",
          description: "Men's leather strap watch with date display",
          price: 129.99,
          image_url: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400",
          category: "Fashion",
          stock: 15,
          rating: 4.7
        },
        {
          name: "Organic Cotton T-Shirt",
          description: "100% organic cotton, comfortable fit",
          price: 24.99,
          image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
          category: "Clothing",
          stock: 50,
          rating: 4.3
        },
        {
          name: "Stainless Steel Water Bottle",
          description: "Insulated 1L bottle, keeps drinks cold for 24hrs",
          price: 34.99,
          image_url: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400",
          category: "Home",
          stock: 30,
          rating: 4.6
        },
        {
          name: "Running Shoes",
          description: "Lightweight running shoes with cushion technology",
          price: 79.99,
          image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
          category: "Sports",
          stock: 20,
          rating: 4.4
        },
        {
          name: "Smartphone Case",
          description: "Shockproof case for latest smartphone models",
          price: 19.99,
          image_url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400",
          category: "Accessories",
          stock: 100,
          rating: 4.2
        },
        {
          name: "Coffee Maker",
          description: "Programmable coffee maker with thermal carafe",
          price: 69.99,
          image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
          category: "Kitchen",
          stock: 12,
          rating: 4.8
        },
        {
          name: "Yoga Mat",
          description: "Non-slip yoga mat with carrying strap",
          price: 29.99,
          image_url: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400",
          category: "Fitness",
          stock: 40,
          rating: 4.5
        }
      ];

      // Insert all sample products
      for (const product of sampleProducts) {
        await db.query(
          'INSERT INTO products (name, description, price, image_url, category, stock, rating) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [product.name, product.description, product.price, product.image_url, product.category, product.stock, product.rating]
        );
      }

      console.log('✅ Sample products inserted successfully');
    }
  } catch (error) {
    console.error('❌ Error inserting sample data:', error.message);
  }
}

// ==================== MIDDLEWARE ====================

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};

// ==================== API ROUTES ====================

// 1. Authentication Routes

// Register user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }
    
    // Check if user already exists
    const [existingUser] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { id: result.insertId, email, name, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: result.insertId,
          name,
          email,
          role: 'customer'
        }
      }
    });
    
    console.log(`✅ User registered: ${email}`);
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Registration failed' 
    });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    // Find user
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    const user = users[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
    
    console.log(`✅ User logged in: ${email}`);
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Login failed' 
    });
  }
});

// Get current user profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get profile' 
    });
  }
});

// 2. Product Routes (Public)

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch products' 
    });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    
    if (products.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }
    
    res.json({
      success: true,
      data: products[0]
    });
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch product' 
    });
  }
});

// 3. Order Routes (Protected)

// Create new order (without payment) - Updated to include user_id
app.post('/api/orders/create', authenticateToken, async (req, res) => {
  try {
    const { customer_name, customer_email, items, total_amount, shipping_address } = req.body;
    
    console.log('📦 Creating order with data:', { customer_name, customer_email, items, total_amount, shipping_address });
    
    // Start transaction
    await db.query('START TRANSACTION');
    
    // Create order with pending payment - Include user_id
    const [orderResult] = await db.query(
      'INSERT INTO orders (user_id, customer_name, customer_email, total_amount, shipping_address, payment_status) VALUES (?, ?, ?, ?, ?, "pending")',
      [req.user.id, customer_name, customer_email, total_amount, shipping_address]
    );
    
    const orderId = orderResult.insertId;
    
    console.log(`✅ Order #${orderId} created`);
    
    // Add order items
    for (const item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }
    
    // Commit transaction (don't update stock until payment is successful)
    await db.query('COMMIT');
    
    res.json({
      success: true,
      data: {
        order_id: orderId,
        message: 'Order created successfully! Please proceed to payment.'
      }
    });
    
    console.log(`✅ Order #${orderId} completed for ${customer_name}`);
  } catch (error) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    console.error('❌ Error creating order:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create order: ' + error.message 
    });
  }
});

// Get user's orders - FIXED: Properly handle orders with no items
app.get('/api/orders/my-orders', authenticateToken, async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT 
        o.*,
        IFNULL(COUNT(oi.id), 0) as item_count,
        IFNULL(SUM(oi.quantity), 0) as total_items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [req.user.id]);
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('❌ Error fetching user orders:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch orders' 
    });
  }
});

// Get order details (user can only see their own orders)
app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, req.user.id]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }
    
    // Get order items
    const [items] = await db.query(`
      SELECT oi.*, p.name, p.image_url 
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);
    
    res.json({
      success: true,
      data: {
        order: orders[0],
        items: items
      }
    });
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch order' 
    });
  }
});

// Admin only - Get all orders
app.get('/api/admin/orders', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      });
    }
    
    const [orders] = await db.query(`
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email,
        IFNULL(COUNT(oi.id), 0) as item_count,
        IFNULL(SUM(oi.quantity), 0) as total_items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('❌ Error fetching all orders:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch orders' 
    });
  }
});

// 4. Process payment (Protected)
app.post('/api/payments/process', authenticateToken, async (req, res) => {
  try {
    const { order_id, payment_method, card_details } = req.body;
    
    // Verify order belongs to user
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [order_id, req.user.id]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    // Validate card details (simulated)
    if (payment_method === 'card' && (!card_details || !card_details.cardNumber || !card_details.expiry || !card_details.cvc)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid card details'
      });
    }
    
    // Simulate payment processing
    const isPaymentSuccessful = Math.random() > 0.1; // 90% success rate for demo
    
    if (isPaymentSuccessful) {
      // Start transaction
      await db.query('START TRANSACTION');
      
      // Update order payment status
      await db.query(
        'UPDATE orders SET payment_status = "paid", payment_method = ?, status = "processing" WHERE id = ?',
        [payment_method, order_id]
      );
      
      // Get order items to update stock
      const [orderItems] = await db.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [order_id]
      );
      
      // Update product stock
      for (const item of orderItems) {
        await db.query(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
      
      // Create payment record
      const transactionId = 'PAY-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      
      await db.query(
        'INSERT INTO payments (order_id, payment_method, amount, status, transaction_id, card_last4, card_brand) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          order_id,
          payment_method,
          orders[0].total_amount,
          'succeeded',
          transactionId,
          card_details ? card_details.cardNumber.slice(-4) : null,
          'visa' // Simulated
        ]
      );
      
      // Commit transaction
      await db.query('COMMIT');
      
      res.json({
        success: true,
        data: {
          transaction_id: transactionId,
          message: 'Payment successful! Your order is being processed.',
          order_id: order_id
        }
      });
      
      console.log(`✅ Payment successful for order #${order_id}`);
    } else {
      // Payment failed
      await db.query(
        'UPDATE orders SET payment_status = "failed" WHERE id = ?',
        [order_id]
      );
      
      await db.query(
        'INSERT INTO payments (order_id, payment_method, amount, status) VALUES (?, ?, ?, ?)',
        [order_id, payment_method, 0, 'failed']
      );
      
      res.status(402).json({
        success: false,
        error: 'Payment failed. Please try again or use a different payment method.'
      });
    }
  } catch (error) {
    console.error('❌ Error processing payment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Payment processing failed' 
    });
  }
});

// 5. Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'E-commerce API is running 🚀',
    timestamp: new Date().toISOString()
  });
});

// 6. Reset database (for development only) - IMPORTANT: USE THIS TO FIX YOUR ISSUE
app.post('/api/reset-db', async (req, res) => {
  try {
    // WARNING: This will drop all tables and recreate them
    console.log('🔄 Resetting database...');
    
    await db.query('DROP TABLE IF EXISTS payments');
    await db.query('DROP TABLE IF EXISTS order_items');
    await db.query('DROP TABLE IF EXISTS orders');
    await db.query('DROP TABLE IF EXISTS products');
    await db.query('DROP TABLE IF EXISTS users');
    
    // Recreate tables
    await createTables();
    await insertSampleData();
    
    res.json({
      success: true,
      message: 'Database reset successfully'
    });
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reset database' 
    });
  }
});

// ==================== START SERVER ====================
async function startServer() {
  // Connect to database first
  await connectToDatabase();
  
  // Start Express server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔐 Authentication Endpoints:`);
    console.log(`   POST http://localhost:${PORT}/api/auth/register`);
    console.log(`   POST http://localhost:${PORT}/api/auth/login`);
    console.log(`   GET  http://localhost:${PORT}/api/auth/me (Protected)`);
    console.log(`💳 Order Endpoints:`);
    console.log(`   POST http://localhost:${PORT}/api/orders/create (Protected)`);
    console.log(`   GET  http://localhost:${PORT}/api/orders/my-orders (Protected)`);
    console.log(`   POST http://localhost:${PORT}/api/payments/process (Protected)`);
    console.log(`🔄 Reset DB (Dev only):`);
    console.log(`   POST http://localhost:${PORT}/api/reset-db`);
    console.log('\n⚠️  IMPORTANT: If you have database errors, run:');
    console.log(`   curl -X POST http://localhost:${PORT}/api/reset-db`);
  });
}

// Start the application
startServer();