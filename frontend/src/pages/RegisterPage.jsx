import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaShoppingCart, FaUser, FaEnvelope, FaLock, FaArrowLeft } from 'react-icons/fa';

function RegisterPage() {
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!registerData.name || !registerData.email || !registerData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password
      });
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Save token and user info
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        alert('Registration successful! You are now logged in.');
        navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <button className="back-btn" onClick={() => navigate('/')}>
            <FaArrowLeft /> Back to Home
          </button>
          <div className="auth-logo">
            <FaShoppingCart className="logo-icon" />
            <h1>ShopEasy</h1>
          </div>
          <h2>Create Account</h2>
          <p>Join ShopEasy for the best shopping experience</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>
              <FaUser /> Full Name
            </label>
            <input
              type="text"
              value={registerData.name}
              onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
              placeholder="John Doe"
              required
            />
          </div>
          
          <div className="form-group">
            <label>
              <FaEnvelope /> Email Address
            </label>
            <input
              type="email"
              value={registerData.email}
              onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label>
              <FaLock /> Password
            </label>
            <input
              type="password"
              value={registerData.password}
              onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
              placeholder="••••••••"
              required
            />
            <small>Must be at least 6 characters</small>
          </div>
          
          <div className="form-group">
            <label>
              <FaLock /> Confirm Password
            </label>
            <input
              type="password"
              value={registerData.confirmPassword}
              onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          
          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign In
              </Link>
            </p>
            <p>
              <Link to="/" className="auth-link">
                Continue shopping without account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;