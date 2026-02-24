import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile, addAddress, deleteAddress, setDefaultAddress } from "../../services/profileService";
import { getMyOrders } from "../../services/orderService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const TABS = ["Profile", "Addresses", "Orders"];

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Profile");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "Home", street: "", city: "", state: "", pincode: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getProfile(), getMyOrders()])
      .then(([p, o]) => { setProfile(p); setOrders(o); setFormData({ name: p.name || "", phone: p.phone || "" }); })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile(formData);
      setProfile(updated);
      setEditing(false);
      toast.success("Profile updated!");
    } catch (e) { toast.error("Failed to update profile"); }
    finally { setSaving(false); }
  };

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city) { toast.error("Street and city are required"); return; }
    setSaving(true);
    try {
      const addresses = await addAddress(newAddress);
      setProfile({ ...profile, addresses });
      setShowAddressForm(false);
      setNewAddress({ label: "Home", street: "", city: "", state: "", pincode: "" });
      toast.success("Address added!");
    } catch (e) { toast.error("Failed to add address"); }
    finally { setSaving(false); }
  };

  const handleDeleteAddress = async (idx) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      const addresses = await deleteAddress(idx);
      setProfile({ ...profile, addresses });
      toast.success("Address removed");
    } catch (e) { toast.error("Failed to delete"); }
  };

  const handleSetDefault = async (idx) => {
    try {
      const addresses = await setDefaultAddress(idx);
      setProfile({ ...profile, addresses });
      toast.success("Default address updated");
    } catch (e) { toast.error("Failed to set default"); }
  };

  const initials = profile && profile.name ? profile.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  const recentOrders = orders.slice(0, 5);
  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);

  if (loading) return <div className="page-wrapper" style={{ paddingTop: "100px" }}><div className="loading-wrap"><div className="spinner" /></div></div>;

  return (
    <div className="page-wrapper">
      <div style={{ paddingTop: "80px", paddingBottom: "40px", background: "var(--bg-secondary)", minHeight: "100vh" }}>
        {/* Header banner */}
        <div style={{ background: "linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)", padding: "36px 20px 80px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: 800, color: "white", flexShrink: 0 }}>
                {initials}
              </div>
              <div>
                <h1 style={{ color: "white", fontSize: "24px", fontWeight: 800, marginBottom: "4px" }}>{profile && profile.name}</h1>
                <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px" }}>{profile && profile.email}</div>
                {profile && profile.phone && <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px" }}>{profile.phone}</div>}
              </div>
            </div>
            {/* Quick stats */}
            <div style={{ display: "flex", gap: "20px", marginTop: "24px", flexWrap: "wrap" }}>
              {[
                { label: "Total Orders", value: orders.length },
                { label: "Total Spent", value: "₹" + totalSpent.toFixed(2) },
                { label: "Addresses", value: (profile && profile.addresses && profile.addresses.length) || 0 },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.15)", borderRadius: "var(--radius-md)", padding: "12px 20px", minWidth: "120px", textAlign: "center" }}>
                  <div style={{ color: "white", fontSize: "22px", fontWeight: 800 }}>{s.value}</div>
                  <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content card */}
        <div style={{ maxWidth: "900px", margin: "-44px auto 0", padding: "0 20px" }}>
          <div style={{ background: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-md)", overflow: "hidden" }}>
            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ flex: 1, padding: "16px", background: "none", border: "none", cursor: "pointer", fontWeight: activeTab === tab ? 700 : 500, color: activeTab === tab ? "var(--primary)" : "var(--text-secondary)", borderBottom: "2px solid", borderBottomColor: activeTab === tab ? "var(--primary)" : "transparent", transition: "all 0.2s", fontSize: "14px" }}>
                  {tab === "Profile" ? "&#128100; " : tab === "Addresses" ? "&#128205; " : "&#128230; "}{tab}
                </button>
              ))}
            </div>

            <div style={{ padding: "28px 24px" }}>
              {/* PROFILE TAB */}
              {activeTab === "Profile" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <h2 style={{ fontWeight: 700, fontSize: "18px" }}>Personal Information</h2>
                    {!editing && <button className="btn btn-outline" style={{ borderRadius: "var(--radius-full)", fontSize: "13px" }} onClick={() => setEditing(true)}>Edit Profile</button>}
                  </div>

                  {editing ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "480px" }}>
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Your full name" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email (cannot change)</label>
                        <input className="form-input" value={profile && profile.email} disabled style={{ background: "var(--bg-secondary)", color: "var(--text-light)" }} />
                      </div>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "600px" }}>
                      {[
                        { label: "Full Name", value: profile && profile.name },
                        { label: "Email", value: profile && profile.email },
                        { label: "Phone", value: (profile && profile.phone) || "Not set" },
                        { label: "Member Since", value: profile && profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "" },
                      ].map(f => (
                        <div key={f.label} style={{ padding: "16px", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)" }}>
                          <div style={{ fontSize: "11px", color: "var(--text-light)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>{f.label}</div>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{f.value}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--border)" }}>
                    <button className="btn btn-danger" style={{ borderRadius: "var(--radius-full)" }} onClick={() => { logout(); navigate("/"); }}>
                      Logout
                    </button>
                  </div>
                </div>
              )}

              {/* ADDRESSES TAB */}
              {activeTab === "Addresses" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ fontWeight: 700, fontSize: "18px" }}>Saved Addresses</h2>
                    <button className="btn btn-primary" style={{ borderRadius: "var(--radius-full)", fontSize: "13px" }} onClick={() => setShowAddressForm(!showAddressForm)}>+ Add Address</button>
                  </div>

                  {showAddressForm && (
                    <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", padding: "20px", marginBottom: "20px", border: "1.5px dashed var(--primary)" }}>
                      <h3 style={{ fontWeight: 700, fontSize: "15px", marginBottom: "16px" }}>New Address</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div className="form-group" style={{ gridColumn: "1/-1" }}>
                          <label className="form-label">Label</label>
                          <select className="form-input" value={newAddress.label} onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}>
                            <option>Home</option><option>Work</option><option>Other</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ gridColumn: "1/-1" }}>
                          <label className="form-label">Street / Flat / Area *</label>
                          <input className="form-input" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} placeholder="123 MG Road, Apt 4B" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">City *</label>
                          <input className="form-input" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} placeholder="Mumbai" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">State</label>
                          <input className="form-input" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} placeholder="Maharashtra" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Pincode</label>
                          <input className="form-input" value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} placeholder="400001" />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                        <button className="btn btn-outline" onClick={() => setShowAddressForm(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleAddAddress} disabled={saving}>{saving ? "Saving..." : "Save Address"}</button>
                      </div>
                    </div>
                  )}

                  {profile && profile.addresses && profile.addresses.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {profile.addresses.map((addr, idx) => (
                        <div key={idx} style={{ border: "1.5px solid " + (addr.isDefault ? "var(--primary)" : "var(--border)"), borderRadius: "var(--radius-md)", padding: "16px 18px", background: addr.isDefault ? "rgba(255,71,87,0.02)" : "white" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                <span style={{ fontWeight: 700, fontSize: "14px" }}>
                                  {addr.label === "Home" ? "&#127968;" : addr.label === "Work" ? "&#127970;" : "&#128205;"} {addr.label}
                                </span>
                                {addr.isDefault && <span style={{ background: "var(--primary)", color: "white", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px" }}>DEFAULT</span>}
                              </div>
                              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                {addr.street}, {addr.city}{addr.state ? ", " + addr.state : ""}{addr.pincode ? " - " + addr.pincode : ""}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                              {!addr.isDefault && (
                                <button onClick={() => handleSetDefault(idx)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "5px 10px", fontSize: "12px", cursor: "pointer", color: "var(--text-secondary)", fontWeight: 600 }}>
                                  Set Default
                                </button>
                              )}
                              <button onClick={() => handleDeleteAddress(idx)} style={{ background: "none", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-sm)", padding: "5px 10px", fontSize: "12px", cursor: "pointer", color: "#ef4444", fontWeight: 600 }}>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state" style={{ padding: "40px 0" }}>
                      <div style={{ fontSize: "48px" }}>&#128205;</div>
                      <h3 className="empty-title">No addresses saved</h3>
                      <p className="empty-desc">Add a delivery address to speed up checkout.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ORDERS TAB */}
              {activeTab === "Orders" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ fontWeight: 700, fontSize: "18px" }}>Recent Orders</h2>
                    <button className="btn btn-outline" style={{ borderRadius: "var(--radius-full)", fontSize: "13px" }} onClick={() => navigate("/orders")}>View All</button>
                  </div>

                  {recentOrders.length === 0 ? (
                    <div className="empty-state" style={{ padding: "40px 0" }}>
                      <div style={{ fontSize: "48px" }}>&#128230;</div>
                      <h3 className="empty-title">No orders yet</h3>
                      <button className="btn btn-primary" style={{ marginTop: "16px", borderRadius: "var(--radius-full)" }} onClick={() => navigate("/restaurants")}>Order Now</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {recentOrders.map(order => (
                        <div key={order._id} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", cursor: "pointer", transition: "border-color 0.2s" }}
                          onClick={() => navigate("/orders/" + order._id + "/track")}
                          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
                          onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                          <div>
                            <div style={{ fontWeight: 700, marginBottom: "4px" }}>{order.restaurantName}</div>
                            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                              {order.items.slice(0, 2).map(i => i.name).join(", ")}{order.items.length > 2 ? " +" + (order.items.length - 2) + " more" : ""} &bull; ${order.total && order.total.toFixed(2)}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text-light)", marginTop: "4px" }}>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                          </div>
                          <div style={{ display: "flex", align: "center", gap: "10px", flexShrink: 0 }}>
                            <span style={{ padding: "5px 12px", borderRadius: "var(--radius-full)", fontWeight: 700, fontSize: "12px", background: order.status === "Delivered" ? "rgba(34,197,94,0.1)" : order.status === "Cancelled" ? "rgba(239,68,68,0.1)" : "rgba(255,71,87,0.08)", color: order.status === "Delivered" ? "#22c55e" : order.status === "Cancelled" ? "#ef4444" : "var(--primary)" }}>{order.status}</span>
                            {order.status !== "Delivered" && order.status !== "Cancelled" && (
                              <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 600 }}>Track &rsaquo;</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
