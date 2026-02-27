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
  { icon: '⚡', title: 'Swift Delivery', desc: 'Hot food at your door in under 30 minutes, every single time.' },
  { icon: '🏆', title: 'Curated Venues', desc: 'Every restaurant is hand-verified for quality, hygiene and taste.' },
  { icon: '📲', title: 'One-Tap Orders', desc: 'Pick a meal, choose your address and checkout in under a minute.' },
  { icon: '🔐', title: 'Safe Payments', desc: 'COD, UPI and online with end-to-end encryption on every order.' },
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
              🌟 Your Favourite Meals, Delivered
            </div>
            <h1 className="hero-title">
              Hungry?
              <span className="highlight">We've Got You.</span>
            </h1>
            <p className="hero-subtitle">
              From crunchy street snacks to gourmet dinners — order from 
              the best restaurants in your city and get it at your door, fast.
            </p>
            <div className="hero-cta">
              {user ? (
                <button
                  className="btn-hero-primary"
                  onClick={() => navigate('/restaurants')}
                >
                  �️ Browse Menus
                </button>
              ) : (
                <>
                  <Link to="/user/register" className="btn-hero-primary">
                    🚀 Join Free — Start Ordering
                  </Link>
                  <Link to="/user/login" className="btn-hero-secondary">
                    Sign In
                  </Link>
                </>
              )}
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-number">300+</div>
                <div className="hero-stat-label">Restaurants</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">40K+</div>
                <div className="hero-stat-label">Happy Users</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">4.8★</div>
                <div className="hero-stat-label">App Rating</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-grid">
              <div className="hero-img-card">
                <img
                  src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80"
                  alt="Indian Food"
                />
              </div>
              <div className="hero-img-card">
                <img
                  src="https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&q=80"
                  alt="Tacos"
                />
              </div>
              <div className="hero-img-card">
                <img
                  src="https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&q=80"
                  alt="Noodles"
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
            { icon: '🚚', value: '25 min', desc: 'Average delivery' },
            { icon: '🎁', value: 'Free', desc: 'On first order' },
            { icon: '🍽️', value: '300+', desc: 'Restaurants' },
            { icon: '⭐', value: '4.8/5', desc: 'Customer rating' },
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
            <h2 className="section-title">Pick Your Cuisine</h2>
            <p className="section-subtitle">
              From Indian classics to Japanese delights, every cuisine is a tap away.
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
              <h2 className="section-title">Popular Near You</h2>
              <p className="section-subtitle">
                Trending joints your neighbours can't get enough of.
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
                      <span className="meta-tag">💰 Min ₹{r.minOrder}</span>
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
            <h2 className="section-title">How BiteBuddy Works</h2>
            <p className="section-subtitle">
              3 easy steps to get your favourite meal delivered.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '32px' }}>
            {[
              { step: '01', icon: '🔍', title: 'Browse Restaurants', desc: 'Explore hundreds of verified restaurants and their full menus.' },
              { step: '02', icon: '🛒', title: 'Add to Cart', desc: 'Pick your dishes, customise quantities, and place your order.' },
              { step: '03', icon: '🛵', title: 'Track & Enjoy', desc: 'Watch your order move in real-time and enjoy fresh hot food.' },
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
            <h2 className="section-title">The BiteBuddy Advantage</h2>
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
                  background: 'rgba(124,58,237,0.08)',
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

      {/* RESTAURANT PARTNER BANNER */}
      <section style={{
        background: 'linear-gradient(135deg, #0f0a1e 0%, #1e1035 60%, #2e1065 100%)',
        padding: '80px 24px',
      }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '40px' }}>
            <div style={{ maxWidth: '560px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, color: '#a78bfa', letterSpacing: 1, textTransform: 'uppercase', marginBottom: '20px' }}>
                🏪 Restaurant Partners
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3.5vw,42px)', color: 'white', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2 }}>
                Own a Restaurant?
                <span style={{ color: '#a78bfa', display: 'block' }}>Join BiteBuddy Today.</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '16px', lineHeight: 1.7, marginBottom: '32px' }}>
                Reach thousands of hungry customers in your city. Set your own UPI for
                direct payments, manage orders in real-time, and scale your business — all
                from your personal BiteBuddy dashboard.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                <Link
                  to="/restaurant/register"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                    padding: '14px 32px', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
                    color: 'white', borderRadius: 'var(--radius-full)', fontSize: '15px',
                    fontWeight: 700, textDecoration: 'none',
                    boxShadow: '0 8px 24px rgba(124,58,237,0.40)', transition: 'var(--transition)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}
                >
                  🚀 Register Your Restaurant
                </Link>
                <Link
                  to="/restaurant/login"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '14px 28px', background: 'rgba(255,255,255,0.08)',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    color: 'white', borderRadius: 'var(--radius-full)', fontSize: '14px',
                    fontWeight: 600, textDecoration: 'none', transition: 'var(--transition)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                >
                  🔐 Already a Partner? Login
                </Link>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '220px' }}>
              {[
              { icon: '💳', title: 'Direct UPI Payments', desc: 'Funds land in your account — zero delay, zero commission.' },
              { icon: '📊', title: 'Live Order Dashboard', desc: 'Track sales, orders and customer trends in real time.' },
              { icon: '🛡️', title: 'Data Privacy', desc: 'Your details visible only to you and the admin.' },
              { icon: '🌆', title: '20+ Cities', desc: 'Tap into a growing base of hungry customers near you.' },
              ].map(f => (
                <div key={f.title} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{f.icon}</div>
                  <div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: '14px', marginBottom: '3px' }}>{f.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      {!user && (
        <section style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, #5b21b6 100%)',
          padding: '80px 24px',
          textAlign: 'center',
        }}>
          <div className="container">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,44px)', color: 'white', marginBottom: '16px', fontWeight: 800 }}>
              Ready to Order?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.80)', fontSize: '17px', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
              Join 40,000+ users who order with BiteBuddy every day.
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
          <span style={{ color: 'var(--primary)' }}>�️</span>
          <span style={{ color: 'white' }}>BiteBuddy</span>
        </div>
        <p style={{ fontSize: '14px' }}>© 2026 BiteBuddy. All rights reserved. | Built with ❤️ for food lovers everywhere.</p>
      </footer>
    </div>
  );
};

export default HomePage;
