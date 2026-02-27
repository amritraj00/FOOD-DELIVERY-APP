import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRestaurantAuth } from '../../context/RestaurantAuthContext';

const FEATURES = [
  { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', title: 'Order Management', desc: 'Track and manage every order in real time' },
  { icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', title: 'Payment Tracking', desc: 'Confirm UPI payments and monitor revenue' },
  { icon: 'M9 5l7 7-7 7', title: 'Menu Control', desc: 'Add, edit and toggle your food items instantly' },
];

function FeatureIcon({ d }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function RestaurantLogin() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState('');
  const { login } = useRestaurantAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/restaurant/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name) => ({
    width: '100%',
    padding: '13px 16px',
    background: focused === name ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.05)',
    border: `1.5px solid ${focused === name ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: '12px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter',system-ui,sans-serif", background: '#0d0d1a' }}>

      {/* ── Left branding panel ── */}
      <div style={{
        flex: '0 0 48%',
        background: 'linear-gradient(145deg,#0f0f23 0%,#1a1535 40%,#0f1e3d 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 56px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', background: 'radial-gradient(circle,rgba(124,58,237,0.12),transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '260px', height: '260px', background: 'radial-gradient(circle,rgba(56,189,248,0.08),transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '60px' }}>
          <div style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '22px', color: '#fff', boxShadow: '0 6px 20px rgba(124,58,237,0.4)', flexShrink: 0 }}>B</div>
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>BiteBuddy</span>
        </Link>

        {/* Heading */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ margin: '0 0 14px', fontSize: '38px', fontWeight: 900, color: '#fff', lineHeight: 1.15, letterSpacing: '-1px' }}>
            Your Outlet,<br />
            <span style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Your Empire.</span>
          </h1>
          <p style={{ margin: 0, fontSize: '15px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
            Manage orders, menu, revenue and more<br />from your powerful BiteBuddy dashboard.
          </p>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', flexShrink: 0 }}>
                <FeatureIcon d={f.icon} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff', marginBottom: '2px' }}>{f.title}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div style={{ marginTop: '56px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', boxShadow: '0 0 8px #4ade80' }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>Serving 20+ restaurants across India</span>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px 32px', background: '#0d0d1a' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Form header */}
          <div style={{ marginBottom: '36px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '20px', padding: '5px 14px', marginBottom: '20px' }}>
              <div style={{ width: '7px', height: '7px', background: '#a78bfa', borderRadius: '50%' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.5px' }}>RESTAURANT PORTAL</span>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Welcome back</h2>
            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>Sign in to access your restaurant dashboard</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.35)', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ fontSize: '13px', color: '#f87171', fontWeight: 600 }}>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Owner Email</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="owner@restaurant.com"
                  onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                  style={{ ...inputStyle('email'), paddingLeft: '42px' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                </div>
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="Enter your password"
                  onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                  style={{ ...inputStyle('password'), paddingLeft: '42px', paddingRight: '44px' }}
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 0, display: 'flex', alignItems: 'center' }}>
                  {showPass
                    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{ marginTop: '6px', padding: '14px', background: loading ? 'rgba(124,58,237,0.35)' : 'linear-gradient(135deg,#7c3aed,#a78bfa)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 800, fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 6px 24px rgba(124,58,237,0.45)', transition: 'all 0.2s', letterSpacing: '0.2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}>
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0110 10" strokeOpacity="1"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/></path></svg>
                  Signing in...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                  Sign in to Dashboard
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '28px 0 24px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>NEW HERE?</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Register CTA */}
          <Link to="/restaurant/register"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'rgba(255,255,255,0.75)', fontSize: '14px', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.35)'; e.currentTarget.style.color = '#a78bfa'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            Register your restaurant
          </Link>

          {/* Back link */}
          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <Link to="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Back to BiteBuddy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
