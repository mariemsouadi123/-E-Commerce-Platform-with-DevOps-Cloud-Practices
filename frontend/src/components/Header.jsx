import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaShoppingCart, 
  FaUser, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes,
  FaHistory,
  FaHome
} from 'react-icons/fa';

function Header({ 
  isAuthenticated, 
  user, 
  cartCount, 
  cartTotal, 
  onLogout, 
  onNavigate,
  mobileMenuOpen,
  setMobileMenuOpen
}) {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          
          <div className="logo" onClick={() => navigate('/')}>
            <FaShoppingCart className="logo-icon" />
            <h1>ShopEasy</h1>
          </div>
          
          <nav className={`nav ${mobileMenuOpen ? 'open' : ''}`}>
            <Link 
              to="/" 
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaHome /> Home
            </Link>
            <Link 
              to="/products" 
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            {isAuthenticated && (
              <>
                <Link 
                  to="/orders" 
                  className="nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaHistory /> My Orders
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="nav-link admin-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
              </>
            )}
          </nav>
          
          <div className="header-actions">
            {isAuthenticated ? (
              <div className="user-menu">
                <button 
                  className="user-btn"
                  onClick={() => navigate('/profile')}
                >
                  <FaUser />
                  <span className="user-name">{user?.name?.split(' ')[0]}</span>
                </button>
                <button className="logout-btn" onClick={onLogout}>
                  <FaSignOutAlt />
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="login-btn" onClick={() => navigate('/login')}>
                  Login
                </button>
                <button className="register-btn" onClick={() => navigate('/register')}>
                  Register
                </button>
              </div>
            )}
            
            <div className="cart-summary">
              <button 
                className="cart-btn"
                onClick={() => cartCount > 0 && navigate('/checkout')}
                disabled={cartCount === 0}
              >
                <FaShoppingCart />
                {cartCount > 0 && (
                  <span className="cart-count">{cartCount}</span>
                )}
              </button>
              {cartCount > 0 && (
                <span className="cart-total">${cartTotal?.toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;