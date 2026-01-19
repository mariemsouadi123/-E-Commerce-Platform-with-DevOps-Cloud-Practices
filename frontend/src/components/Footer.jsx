import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaShoppingCart, 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin,
  FaCreditCard,
  FaPaypal,
  FaMoneyBill,
  FaShieldAlt,
  FaHeadset,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa';

function Footer({ isAuthenticated, user, onNavigate }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <div className="footer-logo">
              <FaShoppingCart className="logo-icon" />
              <h2>ShopEasy</h2>
            </div>
            <p className="footer-description">
              Your one-stop shop for all your needs. Quality products, secure shopping, and fast delivery.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <FaFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <FaInstagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <FaLinkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li>
                <Link to="/" onClick={() => onNavigate('/')}>Home</Link>
              </li>
              <li>
                <Link to="/products" onClick={() => onNavigate('/products')}>Products</Link>
              </li>
              <li>
                <a href="#about" onClick={(e) => { e.preventDefault(); alert('About page coming soon!'); }}>
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => { e.preventDefault(); alert('Contact page coming soon!'); }}>
                  Contact
                </a>
              </li>
              <li>
                <a href="#faq" onClick={(e) => { e.preventDefault(); alert('FAQ page coming soon!'); }}>
                  FAQ
                </a>
              </li>
              <li>
                <a href="#shipping" onClick={(e) => { e.preventDefault(); alert('Shipping info coming soon!'); }}>
                  Shipping Info
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4>Contact Us</h4>
            <ul className="contact-info">
              <li>
                <FaMapMarkerAlt className="contact-icon" />
                <span>1234 Street Name, City, State 12345</span>
              </li>
              <li>
                <FaPhone className="contact-icon" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li>
                <FaEnvelope className="contact-icon" />
                <span>info@shopeasy.com</span>
              </li>
              <li>
                <FaHeadset className="contact-icon" />
                <span>24/7 Customer Support</span>
              </li>
            </ul>
          </div>

          {/* Account & Security */}
          <div className="footer-section">
            <h4>Account & Security</h4>
            {isAuthenticated ? (
              <>
                <div className="user-welcome-box">
                  <p>Welcome, <strong>{user?.name?.split(' ')[0]}</strong>!</p>
                  <p>Your account is secure with us.</p>
                </div>
                <div className="footer-actions">
                  <button className="footer-logout-btn" onClick={() => {
                    // Handle logout - you'll need to pass onLogout from parent
                    alert('Logout functionality handled by parent component');
                  }}>
                    Logout
                  </button>
                  <Link to="/orders" className="footer-btn" onClick={() => onNavigate('/orders')}>
                    My Orders
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p>Create an account for better shopping experience</p>
                <div className="footer-actions">
                  <button className="footer-login-btn" onClick={() => onNavigate('/login')}>
                    Login
                  </button>
                  <button className="footer-register-btn" onClick={() => onNavigate('/register')}>
                    Register
                  </button>
                </div>
              </>
            )}
            
            <div className="security-info">
              <FaShieldAlt className="security-icon" />
              <span>100% Secure Shopping</span>
            </div>
            
            <div className="payment-methods">
              <h5>We Accept</h5>
              <div className="payment-icons">
                <FaCreditCard /> 
                <FaPaypal /> 
                <FaMoneyBill />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} ShopEasy. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Privacy Policy'); }}>
                Privacy Policy
              </a>
              <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Terms of Service'); }}>
                Terms of Service
              </a>
              <a href="#refund" onClick={(e) => { e.preventDefault(); alert('Refund Policy'); }}>
                Refund Policy
              </a>
            </div>
          </div>
          {isAuthenticated && (
            <p className="user-status">
              You are logged in as <strong>{user?.email}</strong>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;