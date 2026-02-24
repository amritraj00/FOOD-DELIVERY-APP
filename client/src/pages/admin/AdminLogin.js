import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminLogin } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const AdminLogin = () => {
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
      const data = await adminLogin(formData);
      setUser(data);
      toast.success('Welcome, Admin! 🎉');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual" style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #2d1b69 100%)' }}>
        <img
          className="auth-visual-img"
          src="https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80"
          alt="Admin"
          style={{ opacity: 0.15 }}
        />
        <div className="auth-visual-overlay" />
        <div className="auth-visual-content">
          <div className="auth-logo" style={{ color: 'white' }}>⚙️ Admin Panel</div>
          <h2 className="auth-visual-title">
            Restaurant<br />Management Hub
          </h2>
          <p className="auth-visual-subtitle">
            Manage your restaurant network, menus, and operations from one powerful dashboard.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '32px' }}>
            {['Add & manage restaurants', 'Control menu items & pricing', 'Monitor orders & revenue', 'Full admin control'].map((feat) => (
              <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.85)', fontSize: '15px' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>⚡</span> {feat}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '32px', padding: '16px', background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: '12px', marginBottom: '6px' }}>Demo credentials:</p>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: 600 }}>admin@food.com / admin123</p>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-inner">
          <div className="auth-logo">⚙️ Admin Panel</div>
          <h1 className="auth-heading">Admin Sign In</h1>
          <p className="auth-subheading">Access your restaurant management dashboard</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <div className="input-group">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="admin@food.com"
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
                  placeholder="Enter admin password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ marginTop: '8px', background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)' }}
              disabled={loading}
            >
              {loading ? '⏳ Signing in...' : '⚙️ Access Dashboard'}
            </button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Are you a customer?{' '}
            <Link to="/user/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
              User Login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

