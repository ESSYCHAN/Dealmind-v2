#!/bin/bash

echo "🔧 Setting up DealMind environment files..."

# Create functions/.env
cat > functions/.env << EOL
# SerpAPI Configuration
SERP_API_KEY=ad3ea889e5afc5cab2629866475c5132fee266d8024aaa63fcf48ecb492a214d

# Firebase Configuration
FIREBASE_PROJECT_ID=dealmind-bccf0

# Affiliate Programs
AMAZON_AFFILIATE_TAG=dealmind-20
EOL

# Create mcp-server/.env
mkdir -p mcp-server
cat > mcp-server/.env << EOL
# SerpAPI for product searches
SERP_API_KEY=ad3ea889e5afc5cab2629866475c5132fee266d8024aaa63fcf48ecb492a214d

# Firebase Functions URL
FIREBASE_FUNCTIONS_URL=http://localhost:5001/dealmind-bccf0/us-central1/api

# Affiliate Tags
AMAZON_AFFILIATE_TAG=dealmind-20
EOL

# Create web/.env (placeholder - needs Firebase config)
cat > web/.env << EOL
# Firebase Web Config - UPDATE THESE VALUES!
REACT_APP_FIREBASE_API_KEY=your-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=dealmind-bccf0.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=dealmind-bccf0
REACT_APP_FIREBASE_STORAGE_BUCKET=dealmind-bccf0.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=260606126562
REACT_APP_FIREBASE_APP_ID=your-app-id-here

# API Endpoints
REACT_APP_API_URL=http://localhost:5001/dealmind-bccf0/us-central1/api
EOL

echo "✅ Environment files created!"
echo ""
echo "📁 Created files:"
echo "  - functions/.env"
echo "  - mcp-server/.env"
echo "  - web/.env"
echo ""
echo "⚠️  IMPORTANT: You need to update web/.env with your Firebase config!"
