import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUser, 
  FaEnvelope, 
  FaCalendar, 
  FaArrowLeft,
  FaShoppingCart,
  FaSignOutAlt,
  FaEdit
} from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: ''
  });
  
  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
      fetchUserProfile();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      if (response.data.success) {
        setUser(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        setEditData({
          name: response.data.data.name,
          email: response.data.data.email
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // Note: In a real app, you would have an update profile endpoint
    alert('Profile update functionality would be implemented here');
    setShowEditForm(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
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
          <h1><FaUser /> My Profile</h1>
          <p>Manage your account information</p>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                <FaUser size={80} />
              </div>
              <div className="profile-info">
                <h2>{user?.name}</h2>
                <p className="profile-email">{user?.email}</p>
                <p className="profile-role">
                  {user?.role === 'admin' ? 'Administrator' : 'Customer'}
                </p>
              </div>
              <button 
                className="edit-profile-btn"
                onClick={() => setShowEditForm(!showEditForm)}
              >
                <FaEdit /> Edit Profile
              </button>
            </div>

            {showEditForm ? (
              <form onSubmit={handleEditSubmit} className="edit-profile-form">
                <div className="form-group">
                  <label>
                    <FaUser /> Full Name
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    <FaEnvelope /> Email
                  </label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-btn">
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setShowEditForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <div className="detail-item">
                  <FaUser className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Full Name</span>
                    <span className="detail-value">{user?.name}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <FaEnvelope className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Email Address</span>
                    <span className="detail-value">{user?.email}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <FaCalendar className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Member Since</span>
                    <span className="detail-value">
                      {new Date(user?.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="profile-actions">
              <button className="logout-btn" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer isAuthenticated={isAuthenticated} user={user} onNavigate={navigate} />
    </div>
  );
}

export default ProfilePage;