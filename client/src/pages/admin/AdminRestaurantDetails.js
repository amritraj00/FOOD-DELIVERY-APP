import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";

const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">&#9881; Control Centre</div>
      <div className="sidebar-label">Management</div>
      <Link to="/admin/dashboard" className={`sidebar-link${pathname === "/admin/dashboard" ? " active" : ""}`}>
        <span className="icon">&#128202;</span> Dashboard
      </Link>
      <Link to="/admin/restaurants" className={`sidebar-link${pathname === "/admin/restaurants" ? " active" : ""}`}>
        <span className="icon">&#127978;</span> Restaurants
      </Link>
      <Link to="/admin/restaurant-details" className={`sidebar-link${pathname === "/admin/restaurant-details" ? " active" : ""}`}>
        <span className="icon">&#128179;</span> Payment Details
      </Link>
      <Link to="/admin/orders" className={`sidebar-link${pathname === "/admin/orders" ? " active" : ""}`}>
        <span className="icon">&#128230;</span> Orders
      </Link>
      <div className="sidebar-label" style={{ marginTop: "16px" }}>Quick Links</div>
      <button className="sidebar-link" style={{ width: "100%", textAlign: "left" }} onClick={() => navigate("/")}>
        <span className="icon">&#127968;</span> View Site
      </button>
    </aside>
  );
};

export default function AdminRestaurantDetails() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/restaurants/details");
      setRestaurants(data);
    } catch {
      toast.error("Failed to load restaurant details");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggleApproval = async (id) => {
    try {
      const { data } = await api.put(`/admin/restaurants/${id}/approve`);
      toast.success(data.message);
      fetchData();
      if (selected?._id === id) setSelected(null);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.ownerEmail?.toLowerCase().includes(search.toLowerCase()) ||
    r.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      <div className="admin-layout">
        <Sidebar />
        <main className="admin-main">
          <div className="admin-header">
            <div>
              <h1 className="admin-title">Restaurant Payment Details</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                Private info &mdash; UPI, bank &amp; owner details for all registered restaurants
              </p>
            </div>
            <input
              placeholder="Search by name, email, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "10px 14px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", borderRadius: "10px", color: "#fff", fontSize: "14px", width: "260px", outline: "none" }}
            />
          </div>

          {loading ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">&#128179;</div>
              <h3 className="empty-title">No restaurants found</h3>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {filtered.map((r) => (
                <div key={r._id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", overflow: "hidden" }}>
                  {/* Row header */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px", cursor: "pointer", background: "rgba(255,255,255,0.02)" }}
                    onClick={() => setSelected(selected?._id === r._id ? null : r)}
                  >
                    <img
                      src={r.image?.startsWith("http") ? r.image : `http://localhost:5000${r.image}`}
                      alt={r.name}
                      style={{ width: "50px", height: "50px", borderRadius: "10px", objectFit: "cover" }}
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100"; }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "15px" }}>{r.name}</div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>
                        {r.cuisine} &middot; {r.city || "—"} &middot; {r.ownerEmail}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, background: r.isApproved ? "rgba(102,187,106,0.15)" : "rgba(239,83,80,0.15)", color: r.isApproved ? "#66bb6a" : "#ef5350", border: `1px solid ${r.isApproved ? "#66bb6a" : "#ef5350"}44` }}>
                        {r.isApproved ? "&#10003; Approved" : "&#10005; Suspended"}
                      </span>
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "18px" }}>{selected?._id === r._id ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {selected?._id === r._id && (
                    <div style={{ padding: "20px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
                      {/* Owner Info */}
                      <div>
                        <div style={{ fontWeight: 700, color: "#29b6f6", marginBottom: "12px", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          &#128100; Owner Details
                        </div>
                        {[
                          { label: "Name", value: r.ownerName },
                          { label: "Email", value: r.ownerEmail },
                          { label: "Phone", value: r.ownerPhone || "—" },
                        ].map(({ label, value }) => (
                          <div key={label} style={{ marginBottom: "8px", fontSize: "13px" }}>
                            <span style={{ color: "rgba(255,255,255,0.5)", marginRight: "8px" }}>{label}:</span>
                            <span style={{ fontWeight: 500 }}>{value}</span>
                          </div>
                        ))}
                      </div>

                      {/* UPI Info */}
                      <div>
                        <div style={{ fontWeight: 700, color: "#7c3aed", marginBottom: "12px", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          &#128241; UPI Details
                        </div>
                        {[
                          { label: "UPI ID", value: r.upiId || "—" },
                          { label: "UPI Name", value: r.upiName || "—" },
                        ].map(({ label, value }) => (
                          <div key={label} style={{ marginBottom: "8px", fontSize: "13px" }}>
                            <span style={{ color: "rgba(255,255,255,0.5)", marginRight: "8px" }}>{label}:</span>
                            <span style={{ fontWeight: 500, color: value === "—" ? "rgba(255,255,255,0.3)" : "#7c3aed" }}>{value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Bank Info */}
                      <div>
                        <div style={{ fontWeight: 700, color: "#66bb6a", marginBottom: "12px", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          &#127974; Bank Details
                        </div>
                        {[
                          { label: "Bank", value: r.bankName || "—" },
                          { label: "Account", value: r.accountNumber || "—" },
                          { label: "IFSC", value: r.ifscCode || "—" },
                          { label: "Holder", value: r.accountHolder || r.ownerName || "—" },
                        ].map(({ label, value }) => (
                          <div key={label} style={{ marginBottom: "8px", fontSize: "13px" }}>
                            <span style={{ color: "rgba(255,255,255,0.5)", marginRight: "8px" }}>{label}:</span>
                            <span style={{ fontWeight: 500, color: value === "—" ? "rgba(255,255,255,0.3)" : "inherit" }}>{value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div style={{ gridColumn: "1 / -1", display: "flex", gap: "12px", marginTop: "8px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                        <button
                          onClick={() => handleToggleApproval(r._id)}
                          style={{ padding: "8px 18px", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "13px", background: r.isApproved ? "rgba(239,83,80,0.2)" : "rgba(102,187,106,0.2)", color: r.isApproved ? "#ef5350" : "#66bb6a" }}
                        >
                          {r.isApproved ? "Suspend Restaurant" : "Approve Restaurant"}
                        </button>
                        <Link
                          to={`/admin/restaurants/${r._id}/foods`}
                          style={{ padding: "8px 18px", background: "rgba(41,182,246,0.15)", border: "1px solid rgba(41,182,246,0.3)", borderRadius: "8px", color: "#29b6f6", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
                        >
                          &#128269; View Menu
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

