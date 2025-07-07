#!/bin/bash
# complete-setup.sh

echo "🚀 Setting up DealMind with Firebase config..."

# Create all .env files with your actual values
cat > functions/.env << 'EOF'
# SerpAPI Configuration
SERP_API_KEY=ad3ea889e5afc5cab2629866475c5132fee266d8024aaa63fcf48ecb492a214d

# Firebase Configuration
FIREBASE_PROJECT_ID=dealmind-bccf0

# Affiliate Programs
AMAZON_AFFILIATE_TAG=dealmind-20
EOF

cat > web/.env << 'EOF'
# Firebase Web Config
REACT_APP_FIREBASE_API_KEY=AIzaSyCnI2ahxXRHuGNk-HAm2CNLxvtcl6Ph1vs
REACT_APP_FIREBASE_AUTH_DOMAIN=dealmind-bccf0.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=dealmind-bccf0
REACT_APP_FIREBASE_STORAGE_BUCKET=dealmind-bccf0.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=260606126562
REACT_APP_FIREBASE_APP_ID=1:260606126562:web:d3f3a594e76e7ce27d71bb
REACT_APP_FIREBASE_MEASUREMENT_ID=G-FZBRGFX7L1

# API Endpoints
REACT_APP_API_URL=http://localhost:5001/dealmind-bccf0/us-central1/api
EOF

mkdir -p mcp-server
cat > mcp-server/.env << 'EOF'
# SerpAPI for product searches
SERP_API_KEY=ad3ea889e5afc5cab2629866475c5132fee266d8024aaa63fcf48ecb492a214d

# Firebase Functions URL
FIREBASE_FUNCTIONS_URL=http://localhost:5001/dealmind-bccf0/us-central1/api

# Affiliate Tags
AMAZON_AFFILIATE_TAG=dealmind-20
EOF

echo "✅ All environment files created with your Firebase config!"
