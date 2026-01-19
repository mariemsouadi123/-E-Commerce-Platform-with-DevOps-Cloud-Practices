import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaShoppingCart, 
  FaStar, 
  FaTruck, 
  FaShieldAlt, 
  FaBars, 
  FaTimes,
  FaUser,
  FaSignInAlt,
  FaSignOutAlt,
  FaUserPlus,
  FaHistory,
  FaHome
} from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import Footer from '../components/Footer';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000/api';
  
  const categories = ['All', 'Electronics', 'Fashion', 'Clothing', 'Home', 'Sports', 'Accessories', 'Kitchen', 'Fitness'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
    
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
    setLoading(false);
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, { ...product, quantity: 1 }]);
      }
    }
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
    setCart([]);
    navigate('/');
  };

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    if (!isAuthenticated) {
      alert('Please login to proceed to checkout');
      navigate('/login');
      return;
    }
    
    // Save cart to localStorage for checkout page
    localStorage.setItem('cart', JSON.stringify(cart));
    navigate('/checkout');
  };

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={i < Math.floor(rating) ? 'star filled' : 'star'}
        style={{ 
          color: i < Math.floor(rating) ? '#fbbf24' : '#e2e8f0',
          fontSize: '0.9rem'
        }}
      />
    ));
  };

  return (
    <div className="home-page">
      <Header 
        isAuthenticated={isAuthenticated}
        user={user}
        cartCount={cart.length}
        cartTotal={cartTotal}
        onLogout={handleLogout}
        onNavigate={navigate}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to ShopEasy</h1>
            <p className="hero-subtitle">Discover amazing products at unbeatable prices</p>
            <div className="hero-cta">
              <button className="btn-primary" onClick={() => setSelectedCategory('All')}>
                Shop Now
              </button>
              {!isAuthenticated && (
                <button className="btn-secondary" onClick={() => navigate('/register')}>
                  Join Now
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose ShopEasy</h2>
            <p>We provide the best shopping experience</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <FaTruck className="feature-icon" />
              <h3>Free Shipping</h3>
              <p>On orders over $50</p>
            </div>
            <div className="feature-card">
              <FaShieldAlt className="feature-icon" />
              <h3>Secure Payment</h3>
              <p>100% secure transactions</p>
            </div>
            <div className="feature-card">
              <FaShoppingCart className="feature-icon" />
              <h3>Easy Returns</h3>
              <p>30-day return policy</p>
            </div>
            <div className="feature-card">
              <FaStar className="feature-icon" />
              <h3>Quality Products</h3>
              <p>Curated selection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <div className="category-filter">
              {categories.slice(0, 5).map(category => (
                <button
                  key={category}
                  className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  renderStars={renderStars}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="cart-summary-fixed">
          <div className="container">
            <div className="cart-summary-content">
              <div className="cart-info">
                <span className="cart-count">{cart.length} items</span>
                <span className="cart-total">Total: ${cartTotal.toFixed(2)}</span>
              </div>
              <button className="checkout-btn" onClick={proceedToCheckout}>
                <FaShoppingCart /> Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer isAuthenticated={isAuthenticated} user={user} onNavigate={navigate} />
    </div>
  );
}

export default HomePage;