import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRestaurants } from '../../services/restaurantService';

const CUISINE_ICONS = {
  Italian: '🍕',
  American: '🍔',
  Japanese: '🍣',
  Indian: '🍛',
  Chinese: '🥢',
  Mexican: '🌮',
  'Multi-Cuisine': '🍽️',
};

const FEATURES = [
  { icon: '⚡', title: 'Fast Delivery', desc: 'Get your food in under 30 minutes or it\'s free!' },
  { icon: '👨‍🍳', title: 'Top Chefs', desc: 'Partnered with award-winning restaurants and chefs.' },
  { icon: '📱', title: 'Easy Ordering', desc: 'Order in seconds with our seamless, intuitive interface.' },
  { icon: '🔒', title: 'Secure Payment', desc: 'Multiple payment options with bank-grade security.' },
];

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    getRestaurants().then(setRestaurants).catch(() => {});
  }, []);

  return (
    <div className="page-wrapper">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              🔥 #1 Food Delivery Platform
            </div>
            <h1 className="hero-title">
              Hungry?
              <span className="highlight">Order Now.</span>
            </h1>
            <p className="hero-subtitle">
              Discover the best food from top restaurants. Fresh ingredients, 
              authentic recipes, and lighting-fast delivery to your door.
            </p>
            <div className="hero-cta">
              {user ? (
                <button
                  className="btn-hero-primary"
                  onClick={() => navigate('/restaurants')}
                >
                  🏪 Browse Restaurants
                </button>
              ) : (
                <>
                  <Link to="/user/register" className="btn-hero-primary">
                    🚀 Get Started — Free
                  </Link>
                  <Link to="/user/login" className="btn-hero-secondary">
                    Sign In
                  </Link>
                </>
              )}
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-number">500+</div>
                <div className="hero-stat-label">Restaurants</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">50K+</div>
                <div className="hero-stat-label">Happy Users</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">4.9★</div>
                <div className="hero-stat-label">App Rating</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-grid">
              <div className="hero-img-card">
                <img
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80"
                  alt="Pizza"
                />
              </div>
              <div className="hero-img-card">
                <img
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80"
                  alt="Burger"
                />
              </div>
              <div className="hero-img-card">
                <img
                  src="https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80"
                  alt="Sushi"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <div className="stats-strip">
        <div className="stats-strip-inner">
          {[
            { icon: '🚚', value: '30 min', desc: 'Average delivery' },
            { icon: '🎁', value: 'Free', desc: 'On first order' },
            { icon: '🍽️', value: '500+', desc: 'Restaurants' },
            { icon: '⭐', value: '4.9/5', desc: 'Customer rating' },
          ].map((s) => (
            <div className="stat-item" key={s.desc}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-text">
                <div className="stat-value">{s.value}</div>
                <div className="stat-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CUISINES */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Explore</div>
            <h2 className="section-title">What Are You Craving?</h2>
            <p className="section-subtitle">
              From Italian classics to spicy Indian curries, we have every cuisine covered.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
            {Object.entries(CUISINE_ICONS).map(([name, icon]) => (
              <button
                key={name}
                onClick={() => user ? navigate('/restaurants') : navigate('/user/login')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '24px 16px',
                  background: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  fontFamily: 'var(--font-main)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--primary)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                  e.currentTarget.style.color = '';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = '';
                }}
              >
                <span style={{ fontSize: '32px' }}>{icon}</span>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>{name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED RESTAURANTS */}
      {restaurants.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">Top Picks</div>
              <h2 className="section-title">Featured Restaurants</h2>
              <p className="section-subtitle">
                Handpicked by our food experts for the ultimate dining experience.
              </p>
            </div>
            <div className="cards-grid">
              {restaurants.slice(0, 3).map((r) => (
                <div
                  key={r._id}
                  className="restaurant-card"
                  onClick={() =>
                    user ? navigate(`/restaurants/${r._id}`) : navigate('/user/login')
                  }
                >
                  <div className="restaurant-img-wrap">
                    <img src={r.image} alt={r.name} />
                    <div className="restaurant-img-overlay" />
                    <div className="restaurant-badge">
                      ⭐ {r.rating}
                    </div>
                    <div className="restaurant-status status-open">Open</div>
                    <div className="restaurant-cuisine-tag">
                      {CUISINE_ICONS[r.cuisine] || '🍽️'} {r.cuisine}
                    </div>
                  </div>
                  <div className="restaurant-body">
                    <h3 className="restaurant-name">{r.name}</h3>
                    <p className="restaurant-desc">{r.description}</p>
                    <div className="restaurant-meta">
                      <span className="meta-tag">⏱ {r.deliveryTime}</span>
                      <span className="meta-tag">💰 Min ${r.minOrder}</span>
                      <span className="rating-badge">⭐ {r.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button
                className="btn btn-outline"
                onClick={() => user ? navigate('/restaurants') : navigate('/user/login')}
                style={{ padding: '12px 32px', borderRadius: 'var(--radius-full)' }}
              >
                View All Restaurants →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Simple Process</div>
            <h2 className="section-title">How FoodieHub Works</h2>
            <p className="section-subtitle">
              3 simple steps to get delicious food delivered to your door.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '32px' }}>
            {[
              { step: '01', icon: '🔍', title: 'Choose Restaurant', desc: 'Browse hundreds of restaurants and cuisines near you.' },
              { step: '02', icon: '🛒', title: 'Pick Your Meal', desc: 'Select from extensive menus and add items to your cart.' },
              { step: '03', icon: '🚚', title: 'Fast Delivery', desc: 'Sit back and relax. Your food arrives fresh and hot.' },
            ].map((step) => (
              <div
                key={step.step}
                style={{
                  textAlign: 'center',
                  padding: '32px 24px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1.5px solid var(--border)',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', letterSpacing: 2, marginBottom: '16px', textTransform: 'uppercase' }}>
                  Step {step.step}
                </div>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{step.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{step.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Why Us</div>
            <h2 className="section-title">The FoodieHub Difference</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  padding: '28px',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid rgba(0,0,0,0.04)',
                  display: 'flex',
                  gap: '18px',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,71,87,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>{f.title}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      {!user && (
        <section style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, #c0392b 100%)',
          padding: '80px 24px',
          textAlign: 'center',
        }}>
          <div className="container">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,44px)', color: 'white', marginBottom: '16px', fontWeight: 800 }}>
              Ready to Order?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.80)', fontSize: '17px', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
              Join 50,000+ users who order with FoodieHub every day.
            </p>
            <Link
              to="/user/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '16px 36px',
                background: 'white',
                color: 'var(--primary)',
                borderRadius: 'var(--radius-full)',
                fontSize: '16px',
                fontWeight: 700,
                transition: 'var(--transition)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.20)',
              }}
            >
              🚀 Get Started — It's Free
            </Link>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer style={{ background: 'var(--bg-dark)', color: 'rgba(255,255,255,0.60)', padding: '40px 24px', textAlign: 'center' }}>
        <div className="nav-brand" style={{ justifyContent: 'center', marginBottom: '16px' }}>
          <span style={{ color: 'var(--primary)' }}>🍔</span>
          <span style={{ color: 'white' }}>FoodieHub</span>
        </div>
        <p style={{ fontSize: '14px' }}>© 2026 FoodieHub. All rights reserved. | Made with ❤️ for food lovers.</p>
      </footer>
    </div>
  );
};

export default HomePage;
