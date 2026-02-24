import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRestaurants } from '../../services/restaurantService';
import { toast } from 'react-toastify';

const CUISINE_ICONS = {
  Italian: '🍕',
  American: '🍔',
  Japanese: '🍣',
  Indian: '🍛',
  Chinese: '🥢',
  Mexican: '🌮',
  'Multi-Cuisine': '🍽️',
};

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  const categories = ['All', ...new Set(restaurants.map((r) => r.cuisine).filter(Boolean))];

  useEffect(() => {
    getRestaurants()
      .then((data) => {
        setRestaurants(data);
        setFiltered(data);
      })
      .catch(() => toast.error('Failed to load restaurants'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = restaurants;
    if (activeCategory !== 'All') {
      result = result.filter((r) => r.cuisine === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          (r.cuisine || '').toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, activeCategory, restaurants]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-wrap">
          <div className="spinner" />
          <p className="loading-text">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="section">
        <div className="container">
          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <div className="section-tag">Discover</div>
            <h1 className="section-title" style={{ textAlign: 'left', margin: '8px 0 4px' }}>
              All Restaurants
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              {filtered.length} restaurant{filtered.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {/* Search */}
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search restaurants, cuisines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="category-bar">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-pill${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat !== 'All' && (CUISINE_ICONS[cat] || '🍽️')} {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍽️</div>
              <h3 className="empty-title">No restaurants found</h3>
              <p className="empty-desc">Try a different search term or category.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {filtered.map((r) => (
                <div
                  key={r._id}
                  className="restaurant-card"
                  onClick={() => navigate(`/restaurants/${r._id}`)}
                >
                  <div className="restaurant-img-wrap">
                    <img
                      src={
                        r.image?.startsWith('http')
                          ? r.image
                          : `http://localhost:5000${r.image}`
                      }
                      alt={r.name}
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80';
                      }}
                    />
                    <div className="restaurant-img-overlay" />
                    <div className="restaurant-badge">⭐ {r.rating || '4.5'}</div>
                    <div className={`restaurant-status ${r.isOpen !== false ? 'status-open' : ''}`}>
                      {r.isOpen !== false ? 'Open' : 'Closed'}
                    </div>
                    <div className="restaurant-cuisine-tag">
                      {CUISINE_ICONS[r.cuisine] || '🍽️'} {r.cuisine || 'Restaurant'}
                    </div>
                  </div>
                  <div className="restaurant-body">
                    <h3 className="restaurant-name">{r.name}</h3>
                    <p className="restaurant-desc">{r.description}</p>
                    <div className="restaurant-meta">
                      <span className="meta-tag">⏱ {r.deliveryTime || '30-45 min'}</span>
                      <span className="meta-tag">💰 Min ${r.minOrder || 10}</span>
                      <span className="rating-badge">⭐ {r.rating || '4.5'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Restaurants;

