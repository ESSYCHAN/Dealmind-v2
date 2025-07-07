import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [productUrl, setProductUrl] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Your backend URL
  const API_URL = 'http://localhost:5001/dealmind-bccf0/us-central1/api';

  // Load products when page loads
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const trackProduct = async () => {
    if (!productUrl || !targetPrice) {
      setMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productUrl,
          targetPrice: parseFloat(targetPrice)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Tracking! Current price: $${data.currentPrice}`);
        setProductUrl('');
        setTargetPrice('');
        loadProducts(); // Reload the list
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🎯 Price Tracker</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Product URL"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          style={{ marginRight: '10px', padding: '8px', width: '400px' }}
        />
        
        <input
          type="number"
          placeholder="Target Price"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          style={{ marginRight: '10px', padding: '8px', width: '100px' }}
        />
        
        <button 
          onClick={trackProduct}
          disabled={loading}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Tracking...' : 'Start Tracking'}
        </button>
      </div>

      {message && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {message}
        </div>
      )}

      <h2>📦 Tracked Products ({products.length})</h2>
      
      {products.length === 0 ? (
        <p>No products tracked yet. Add one above!</p>
      ) : (
        <div>
          {products.map(product => (
            <div key={product.id} style={{
              border: '1px solid #ddd',
              padding: '15px',
              marginBottom: '10px',
              borderRadius: '5px'
            }}>
              <h3>{product.title || 'Product'}</h3>
              <p>🔗 URL: {product.productUrl}</p>
              <p>💰 Current: ${product.currentPrice} | Target: ${product.targetPrice}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;