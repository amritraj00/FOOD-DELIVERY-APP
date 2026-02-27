import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const UserLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(formData);
      setUser(data);
      toast.success('Welcome back! 🎉');
      navigate('/restaurants');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <img
          className="auth-visual-img"
          src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80"
          alt="Food"
        />
        <div className="auth-visual-overlay" />
        <div className="auth-visual-content">
          <div className="auth-logo">�️ BiteBuddy</div>
          <h2 className="auth-visual-title">
            Fresh Food From The
            <br />Best Spots Near You
          </h2>
          <p className="auth-visual-subtitle">
            Order from hundreds of curated restaurants with live tracking,
            great deals, and lightning-fast delivery.
          </p>
          <div className="hero-stats" style={{ marginTop: '40px' }}>
            <div className="hero-stat">
              <div className="hero-stat-number">300+</div>
              <div className="hero-stat-label">Restaurants</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">25min</div>
              <div className="hero-stat-label">Avg. Delivery</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">4.8★</div>
              <div className="hero-stat-label">App Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-inner">
          <div className="auth-logo">�️ BiteBuddy</div>
          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-subheading">Sign in to continue your food journey</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-group">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? '⏳ Signing in...' : '🚀 Sign In'}
            </button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link
              to="/user/register"
              style={{ color: 'var(--primary)', fontWeight: '600' }}
            >
              Create account →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;

