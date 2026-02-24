import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const totalItems = getTotalItems();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    toast.success("Logged out successfully");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";
  const initials = user && user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <nav className={"navbar" + (scrolled ? " scrolled" : "")}>
      <div className="nav-container">
        <Link to={user ? (isAdmin ? "/admin/dashboard" : "/") : "/"} className="nav-brand">
          FoodieHub
        </Link>

        <div className="nav-links">
          {user ? (
            <>
              {isAdmin ? (
                <>
                  <Link to="/admin/dashboard" className={isActive("/admin/dashboard")}>Dashboard</Link>
                  <Link to="/admin/restaurants" className={isActive("/admin/restaurants")}>Restaurants</Link>
                </>
              ) : (
                <>
                  <Link to="/" className={isActive("/")}>Home</Link>
                  <Link to="/restaurants" className={isActive("/restaurants")}>Restaurants</Link>
                  <Link to="/orders" className={isActive("/orders")}>Orders</Link>
                  <Link to="/cart" className="cart-btn">
                    Cart
                    {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                  </Link>
                </>
              )}

              {/* User dropdown */}
              <div ref={dropdownRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ display: "flex", alignItems: "center", gap: "8px", background: dropdownOpen ? "rgba(255,71,87,0.1)" : "transparent", border: "1.5px solid", borderColor: dropdownOpen ? "var(--primary)" : "rgba(0,0,0,0.12)", borderRadius: "var(--radius-full)", padding: "6px 14px 6px 6px", cursor: "pointer", transition: "all 0.2s" }}
                >
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,#ff4757,#ff6b81)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "14px", flexShrink: 0 }}>
                    {initials}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>{user.name && user.name.split(" ")[0]}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: dropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", color: "var(--text-secondary)" }}>
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "white", borderRadius: "var(--radius-md)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", border: "1px solid var(--border)", minWidth: "220px", zIndex: 1000, overflow: "hidden" }}>
                    {/* User info header */}
                    <div style={{ padding: "16px", background: "linear-gradient(135deg,rgba(255,71,87,0.06),rgba(255,71,87,0.02))", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg,#ff4757,#ff6b81)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "18px", flexShrink: 0 }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>{user.name}</div>
                          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{user.email}</div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    {!isAdmin && (
                      <>
                        <DropdownItem icon="&#128100;" label="My Profile" onClick={() => { navigate("/profile"); setDropdownOpen(false); }} />
                        <DropdownItem icon="&#128230;" label="My Orders" onClick={() => { navigate("/orders"); setDropdownOpen(false); }} />
                        <DropdownItem icon="&#128205;" label="Saved Addresses" onClick={() => { navigate("/profile?tab=Addresses"); setDropdownOpen(false); }} />
                        <DropdownItem icon="&#127860;" label="Browse Restaurants" onClick={() => { navigate("/restaurants"); setDropdownOpen(false); }} />
                        <DropdownItem icon="&#128722;" label="Cart" badge={totalItems > 0 ? totalItems : null} onClick={() => { navigate("/cart"); setDropdownOpen(false); }} />
                      </>
                    )}
                    {isAdmin && (
                      <>
                        <DropdownItem icon="&#128202;" label="Dashboard" onClick={() => { navigate("/admin/dashboard"); setDropdownOpen(false); }} />
                        <DropdownItem icon="&#127981;" label="Restaurants" onClick={() => { navigate("/admin/restaurants"); setDropdownOpen(false); }} />
                        <DropdownItem icon="&#128230;" label="Order Management" onClick={() => { navigate("/admin/orders"); setDropdownOpen(false); }} />
                      </>
                    )}

                    <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />
                    <button onClick={handleLogout}
                      style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px", background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "#ef4444", fontWeight: 600, transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.05)"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}>
                      <span style={{ fontSize: "18px" }}>&#128682;</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/" className={isActive("/")}>Home</Link>
              <Link to="/user/login" className={isActive("/user/login")}>Login</Link>
              <Link to="/user/register" className="btn btn-primary btn-sm">Sign Up</Link>
              <Link to="/admin/login" className={isActive("/admin/login")}>Admin</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const DropdownItem = ({ icon, label, onClick, badge }) => (
  <button onClick={onClick}
    style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px", background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "var(--text-primary)", fontWeight: 500, transition: "background 0.15s", textAlign: "left" }}
    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-secondary)"}
    onMouseLeave={e => e.currentTarget.style.background = "none"}>
    <span style={{ fontSize: "18px", width: "22px", textAlign: "center" }} dangerouslySetInnerHTML={{ __html: icon }} />
    <span style={{ flex: 1 }}>{label}</span>
    {badge && <span style={{ background: "var(--primary)", color: "white", borderRadius: "10px", minWidth: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, padding: "0 5px" }}>{badge}</span>}
  </button>
);

export default Navbar;
