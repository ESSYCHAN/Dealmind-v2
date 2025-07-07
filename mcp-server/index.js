#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// Initialize MCP server
const server = new Server(
  {
    name: 'dealmind-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Your Firebase Functions URL
const API_BASE = process.env.FIREBASE_FUNCTIONS_URL || 'http://localhost:5001/dealmind/us-central1/api';
const AFFILIATE_TAG = process.env.AMAZON_AFFILIATE_TAG || 'dealmind-20';

// Helper to add affiliate tags
function addAffiliateTag(url) {
  if (url.includes('amazon.com') || url.includes('amazon.co.uk')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}tag=${AFFILIATE_TAG}`;
  }
  // Add other affiliate programs here
  return url;
}

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'track_price',
      description: 'Start tracking a product price and get alerts when it drops',
      inputSchema: {
        type: 'object',
        properties: {
          product_url: {
            type: 'string',
            description: 'The product URL to track'
          },
          target_price: {
            type: 'number',
            description: 'Desired price to trigger alert'
          },
          email: {
            type: 'string',
            description: 'Email for price drop alerts'
          }
        },
        required: ['product_url', 'target_price']
      }
    },
    {
      name: 'find_best_price',
      description: 'Search for the best price of a product across multiple stores',
      inputSchema: {
        type: 'object',
        properties: {
          product_name: {
            type: 'string',
            description: 'Name or description of the product'
          },
          max_results: {
            type: 'number',
            description: 'Maximum number of results to return',
            default: 5
          }
        },
        required: ['product_name']
      }
    },
    {
      name: 'predict_price_drop',
      description: 'Get ML prediction on when a product price might drop',
      inputSchema: {
        type: 'object',
        properties: {
          product_url: {
            type: 'string',
            description: 'Product URL to analyze'
          }
        },
        required: ['product_url']
      }
    },
    {
      name: 'get_price_history',
      description: 'Get historical price data for a tracked product',
      inputSchema: {
        type: 'object',
        properties: {
          product_url: {
            type: 'string',
            description: 'Product URL'
          },
          days: {
            type: 'number',
            description: 'Number of days of history',
            default: 30
          }
        },
        required: ['product_url']
      }
    },
    {
      name: 'find_deals',
      description: 'Find current deals and discounts in a category',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Product category (electronics, home, fashion, etc.)'
          },
          min_discount: {
            type: 'number',
            description: 'Minimum discount percentage',
            default: 20
          }
        },
        required: ['category']
      }
    }
  ]
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'track_price': {
        // Call your Firebase function to start tracking
        const response = await fetch(`${API_BASE}/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productUrl: args.product_url,
            targetPrice: args.target_price,
            email: args.email || 'user@example.com'
          })
        });
        
        const data = await response.json();
        
        // Add affiliate link for user convenience
        const affiliateUrl = addAffiliateTag(args.product_url);
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Now tracking price for this product!\n\n` +
                    `Tracking ID: ${data.trackingId}\n` +
                    `Current Price: $${data.currentPrice}\n` +
                    `Target Price: $${args.target_price}\n\n` +
                    `You'll get an alert when the price drops!\n\n` +
                    `💰 Ready to buy now? Use this link to support DealMind:\n${affiliateUrl}`
            }
          ]
        };
      }

      case 'find_best_price': {
        // Simulate searching multiple stores (replace with real implementation)
        const results = await searchMultipleStores(args.product_name);
        
        // Add affiliate tags and sort by price
        const dealsWithAffiliates = results
          .map(deal => ({
            ...deal,
            affiliateUrl: addAffiliateTag(deal.url),
            savings: deal.originalPrice - deal.currentPrice
          }))
          .sort((a, b) => a.currentPrice - b.currentPrice);
        
        const text = dealsWithAffiliates
          .map((deal, i) => 
            `${i + 1}. ${deal.store} - $${deal.currentPrice} ` +
            `(Save $${deal.savings.toFixed(2)})\n` +
            `   ${deal.affiliateUrl}`
          )
          .join('\n\n');
        
        return {
          content: [
            {
              type: 'text',
              text: `🔍 Best prices for "${args.product_name}":\n\n${text}\n\n` +
                    `💡 Tip: I can track any of these for you with the track_price tool!`
            }
          ]
        };
      }

      case 'predict_price_drop': {
        // Call your ML service
        const mlResponse = await fetch('http://localhost:5000/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_url: args.product_url,
            current_price: 100 // You'd fetch this from your scraper
          })
        });
        
        const prediction = await mlResponse.json();
        const affiliateUrl = addAffiliateTag(args.product_url);
        
        return {
          content: [
            {
              type: 'text',
              text: `🔮 Price Prediction Analysis:\n\n` +
                    `Current Price: $${prediction.current_price}\n` +
                    `Predicted Price (7 days): $${prediction.predicted_price_7d}\n` +
                    `Trend: ${prediction.trend}\n` +
                    `Confidence: ${(prediction.confidence * 100).toFixed(0)}%\n` +
                    `Best Time to Buy: ${prediction.best_time_to_buy}\n\n` +
                    `${prediction.trend === 'decreasing' ? 
                      '📉 Good news! Price likely to drop. Set up tracking to get alerted!' : 
                      '📈 Price may increase. Consider buying now:'}\n` +
                    `${affiliateUrl}`
            }
          ]
        };
      }

      case 'get_price_history': {
        // Fetch from your Firebase function
        const response = await fetch(`${API_BASE}/history?url=${encodeURIComponent(args.product_url)}&days=${args.days}`);
        const history = await response.json();
        
        // Simple ASCII chart
        const chart = generatePriceChart(history.prices);
        
        return {
          content: [
            {
              type: 'text',
              text: `📊 Price History (Last ${args.days} days):\n\n${chart}\n\n` +
                    `Highest: $${history.highest}\n` +
                    `Lowest: $${history.lowest}\n` +
                    `Average: $${history.average}\n` +
                    `Current: $${history.current}`
            }
          ]
        };
      }

      case 'find_deals': {
        const deals = await findCategoryDeals(args.category, args.min_discount);
        
        const dealsList = deals
          .map((deal, i) => 
            `${i + 1}. ${deal.title}\n` +
            `   💰 $${deal.salePrice} (was $${deal.originalPrice})\n` +
            `   🏷️ ${deal.discount}% OFF\n` +
            `   🔗 ${addAffiliateTag(deal.url)}`
          )
          .join('\n\n');
        
        return {
          content: [
            {
              type: 'text',
              text: `🎯 Hot Deals in ${args.category} (>${args.min_discount}% off):\n\n${dealsList}\n\n` +
                    `💡 Want to track any of these? Just give me the URL!`
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ]
    };
  }
});

// Helper functions
async function searchMultipleStores(productName) {
  // Implement real search across multiple stores
  // For now, return mock data
  return [
    {
      store: 'Amazon',
      url: 'https://amazon.com/product/12345',
      currentPrice: 99.99,
      originalPrice: 129.99
    },
    {
      store: 'BestBuy',
      url: 'https://bestbuy.com/product/67890',
      currentPrice: 104.99,
      originalPrice: 134.99
    }
  ];
}

async function findCategoryDeals(category, minDiscount) {
  // Implement real deal finding
  // Mock data for now
  return [
    {
      title: 'Premium Wireless Headphones',
      originalPrice: 299.99,
      salePrice: 199.99,
      discount: 33,
      url: 'https://amazon.com/headphones/abc123'
    }
  ];
}

function generatePriceChart(prices) {
  // Simple ASCII chart generator
  if (!prices || prices.length === 0) return 'No data available';
  
  const maxPrice = Math.max(...prices.map(p => p.price));
  const minPrice = Math.min(...prices.map(p => p.price));
  const range = maxPrice - minPrice;
  
  return prices.map(p => {
    const normalized = ((p.price - minPrice) / range) * 10;
    const bars = '█'.repeat(Math.round(normalized) || 1);
    return `${p.date}: ${bars} $${p.price}`;
  }).join('\n');
}

// Start the server
const transport = new StdioServerTransport();
server.connect(transport);

console.error('DealMind MCP Server started');