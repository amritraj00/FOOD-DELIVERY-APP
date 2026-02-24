import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const UserRegister = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(formData);
      setUser(data);
      toast.success('Account created! Welcome 🎉');
      navigate('/restaurants');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <img
          className="auth-visual-img"
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80"
          alt="Restaurant"
        />
        <div className="auth-visual-overlay" />
        <div className="auth-visual-content">
          <div className="auth-logo" style={{ color: 'white' }}>🍔 FoodieHub</div>
          <h2 className="auth-visual-title">Join Thousands of<br />Happy Foodies</h2>
          <p className="auth-visual-subtitle">
            Create your account and start exploring the best restaurants in your city.
            Fresh food delivered to your door.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '32px' }}>
            {['Free delivery on your first order', 'Track your order in real-time', 'Exclusive deals & discounts', '500+ restaurant choices'].map((feat) => (
              <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.85)', fontSize: '15px' }}>
                <span style={{ color: '#2ed573', fontWeight: 700 }}>✓</span> {feat}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-inner">
          <div className="auth-logo">🍔 FoodieHub</div>
          <h1 className="auth-heading">Create account</h1>
          <p className="auth-subheading">Start your food journey today — it's free!</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-group">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

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
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? '⏳ Creating account...' : '🚀 Create Account'}
            </button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/user/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;

