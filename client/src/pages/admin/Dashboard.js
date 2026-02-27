import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRestaurants } from '../../services/restaurantService';

const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">⚙️ Control Centre</div>
      <div className="sidebar-label">Management</div>
      <Link to="/admin/dashboard" className={`sidebar-link${pathname === '/admin/dashboard' ? ' active' : ''}`}>
        <span className="icon">📊</span> Dashboard
      </Link>
      <Link to="/admin/restaurants" className={`sidebar-link${pathname.includes('restaurants') ? ' active' : ''}`}>
        <span className="icon">🏪</span> Restaurants
      </Link>
      <Link to="/admin/restaurant-details" className={`sidebar-link${pathname === '/admin/restaurant-details' ? ' active' : ''}`}>
        <span className="icon">💳</span> Payment Details
      </Link>
      <Link to="/admin/orders" className={`sidebar-link${pathname === '/admin/orders' ? ' active' : ''}`}>
        <span className="icon">📦</span> Orders
      </Link>
      <div className="sidebar-label" style={{ marginTop: '16px' }}>Quick Links</div>
      <button className="sidebar-link" style={{ width: '100%', textAlign: 'left' }} onClick={() => navigate('/')}>
        <span className="icon">🏠</span> View Site
      </button>
    </aside>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRestaurants()
      .then(setRestaurants)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      <div className="admin-layout">
        <Sidebar />
        <main className="admin-main">
          <div className="admin-header">
            <div>
              <h1 className="admin-title">Dashboard</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                Welcome back, <strong>{user?.name}</strong>! Here's your overview.
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/admin/restaurants')}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              + Add Restaurant
            </button>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            {[
              { icon: '🏪', value: loading ? '...' : restaurants.length, label: 'Total Outlets', color: 'red' },
              { icon: '🍽️', value: loading ? '...' : restaurants.length * 6, label: 'Dishes Available', color: 'blue' },
              { icon: '📦', value: '0', label: 'Live Orders', color: 'orange' },
              { icon: '💰', value: '₹0', label: 'Revenue Today', color: 'green' },
            ].map((stat) => (
              <div className="stat-card" key={stat.label}>
                <div className={`stat-card-icon ${stat.color}`}>{stat.icon}</div>
                <div>
                  <div className="stat-card-value">{stat.value}</div>
                  <div className="stat-card-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Restaurants */}
          <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Restaurants</h2>
              <Link to="/admin/restaurants" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}>
                View All →
              </Link>
            </div>

            {loading ? (
              <div className="loading-wrap" style={{ minHeight: '160px' }}>
                <div className="spinner" />
              </div>
            ) : restaurants.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-icon">🏪</div>
                <h3 className="empty-title">No restaurants yet</h3>
                <p className="empty-desc">Add your first restaurant to get started.</p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: '16px', borderRadius: 'var(--radius-full)' }}
                  onClick={() => navigate('/admin/restaurants')}
                >
                  + Add Restaurant
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {restaurants.map((r) => (
                  <div
                    key={r._id}
                    onClick={() => navigate(`/admin/restaurants/${r._id}/foods`)}
                    style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                      border: '1.5px solid var(--border)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <img
                      src={r.image?.startsWith('http') ? r.image : `http://localhost:5000${r.image}`}
                      alt={r.name}
                      style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80'; }}
                    />
                    <div style={{ padding: '12px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{r.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '4px' }}>{r.cuisine}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

