const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const express = require('express');

admin.initializeApp();

const app = express();
app.use(cors);
app.use(express.json());

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'DealMind API is running!',
    endpoints: {
      'POST /track': 'Track a new product',
      'GET /products': 'Get tracked products',
      'DELETE /products/:id': 'Remove a product'
    }
  });
});

// Track a product
app.post('/track', async (req, res) => {
  const { productUrl, targetPrice } = req.body;
  
  res.json({
    success: true,
    message: 'Product tracked!',
    trackingId: Date.now().toString(),
    productUrl,
    targetPrice,
    currentPrice: Math.floor(Math.random() * 200) + 50
  });
});

// Get products
app.get('/products', async (req, res) => {
  res.json({
    products: [
      {
        id: '1',
        productUrl: 'https://amazon.com/sample',
        targetPrice: 99,
        currentPrice: 120,
        title: 'Sample Product'
      }
    ]
  });
});

exports.api = functions.https.onRequest(app);