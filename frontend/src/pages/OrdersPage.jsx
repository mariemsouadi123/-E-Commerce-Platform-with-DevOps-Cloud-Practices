import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaShoppingCart, 
  FaHistory, 
  FaArrowLeft, 
  FaBox, 
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle
} from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
      fetchOrders();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/orders/my-orders`);
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <FaClock className="status-icon pending" />;
      case 'processing': return <FaBox className="status-icon processing" />;
      case 'shipped': return <FaTruck className="status-icon shipped" />;
      case 'delivered': return <FaCheckCircle className="status-icon delivered" />;
      default: return <FaExclamationCircle className="status-icon" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentStatusClass = (status) => {
    switch(status) {
      case 'paid': return 'paid';
      case 'pending': return 'pending';
      case 'failed': return 'failed';
      default: return '';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="orders-page">
      <Header 
        isAuthenticated={isAuthenticated}
        user={user}
        onNavigate={navigate}
      />

      <div className="container">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/')}>
            <FaArrowLeft /> Back to Shop
          </button>
          <h1><FaHistory /> My Orders</h1>
          <p>View your order history and track shipments</p>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">
              <FaShoppingCart size={64} />
            </div>
            <h2>No Orders Yet</h2>
            <p>You haven't placed any orders yet. Start shopping now!</p>
            <button className="shop-btn" onClick={() => navigate('/')}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-id">
                    <h3>Order #{order.id}</h3>
                    <span className="order-date">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="order-status">
                    {getStatusIcon(order.status)}
                    <span className={`status-badge ${order.status}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="order-body">
                  <div className="order-info">
                    <div className="info-row">
                      <span className="info-label">Total Amount:</span>
                      <span className="info-value">${order.total_amount}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Items:</span>
                      <span className="info-value">{order.item_count} items ({order.total_items} units)</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Payment Status:</span>
                      <span className={`payment-status ${getPaymentStatusClass(order.payment_status)}`}>
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="order-shipping">
                    <h4>Shipping Address</h4>
                    <p>{order.shipping_address}</p>
                  </div>
                </div>

                <div className="order-footer">
                  <button 
                    className="view-details-btn"
                    onClick={() => alert(`Order details for #${order.id} would show here`)}
                  >
                    View Details
                  </button>
                  {order.status === 'shipped' && (
                    <button className="track-btn">
                      Track Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer isAuthenticated={isAuthenticated} user={user} onNavigate={navigate} />
    </div>
  );
}

export default OrdersPage;