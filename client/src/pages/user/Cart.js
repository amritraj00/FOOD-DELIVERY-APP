import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { placeOrder } from "../../services/orderService";
import { getProfile, addAddress } from "../../services/profileService";
import { toast } from "react-toastify";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "Home", street: "", city: "", state: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const subtotal = getTotalPrice();
  const deliveryFee = subtotal > 0 ? 2.99 : 0;
  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const total = parseFloat((subtotal + deliveryFee + tax).toFixed(2));

  useEffect(() => { getProfile().then(setUserProfile).catch(() => {}); }, []);

  const imgSrc = (src) => src && src.startsWith("http") ? src : ("http://localhost:5000" + src);
  const selectedAddr = userProfile && userProfile.addresses && userProfile.addresses[selectedAddressIdx];

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    if (!selectedAddr) { toast.error("Please add a delivery address first!"); setShowAddressForm(true); return; }
    setLoading(true);
    try {
      const restaurantId = cartItems[0] && cartItems[0].restaurantId;
      const restaurantName = (cartItems[0] && cartItems[0].restaurantName) || "Restaurant";
      const orderPayload = {
        restaurantId,
        restaurantName,
        items: cartItems.map(item => ({ foodItem: item._id, name: item.name, price: item.price, image: item.image, quantity: item.quantity })),
        deliveryAddress: { label: selectedAddr.label, street: selectedAddr.street, city: selectedAddr.city, state: selectedAddr.state, pincode: selectedAddr.pincode, lat: selectedAddr.lat || 28.6139, lng: selectedAddr.lng || 77.2090 },
        subtotal, deliveryFee, tax, total, paymentMethod,
      };
      const order = await placeOrder(orderPayload);
      clearCart();
      toast.success("Order placed successfully!");
      navigate("/orders/" + order._id + "/track");
    } catch (error) {
      toast.error((error.response && error.response.data && error.response.data.message) || "Failed to place order.");
    } finally { setLoading(false); }
  };

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city) { toast.error("Please fill street and city"); return; }
    try {
      const addresses = await addAddress(newAddress);
      setUserProfile({ ...userProfile, addresses });
      setSelectedAddressIdx(addresses.length - 1);
      setShowAddressForm(false);
      setNewAddress({ label: "Home", street: "", city: "", state: "", pincode: "" });
      toast.success("Address saved!");
    } catch (e) { toast.error("Failed to save address"); }
  };

  return (
    <div className="page-wrapper">
      <div className="cart-page">
        <div className="container">
          <button className="back-btn" onClick={() => navigate("/restaurants")}>Back to Menu</button>
          <h1 className="page-title" style={{ marginBottom: "28px" }}>Your Cart</h1>

          {cartItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" style={{ fontSize: "64px" }}>&#128722;</div>
              <h3 className="empty-title">Your cart is empty</h3>
              <p className="empty-desc">Browse our restaurants and find something delicious!</p>
              <button className="btn btn-primary" style={{ marginTop: "24px", borderRadius: "var(--radius-full)", padding: "12px 28px" }} onClick={() => navigate("/restaurants")}>Browse Restaurants</button>
              <button className="btn btn-outline" style={{ marginTop: "12px", borderRadius: "var(--radius-full)", padding: "12px 28px" }} onClick={() => navigate("/orders")}>View My Orders</button>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items-section">
                {/* Items list */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h2 className="cart-section-title" style={{ margin: 0 }}>Items ({cartItems.length})</h2>
                  <button className="btn btn-sm" style={{ color: "var(--error)", fontSize: "13px", fontWeight: 600 }} onClick={() => { clearCart(); toast.info("Cart cleared"); }}>Clear All</button>
                </div>
                <div className="divider" />

                {cartItems.map((item) => (
                  <div key={item._id} className="cart-item">
                    <img src={imgSrc(item.image)} alt={item.name} className="cart-item-img" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80"; }} />
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">
                        {item.category && <span style={{ display: "inline-block", background: "rgba(255,71,87,0.08)", color: "var(--primary)", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "var(--radius-full)", marginBottom: "4px" }}>{item.category}</span>}
                        <div>${item.price.toFixed(2)} each</div>
                      </div>
                      <div className="qty-control" style={{ marginTop: "10px" }}>
                        <button className="qty-btn" onClick={() => { if (item.quantity === 1) { removeFromCart(item._id); } else { updateQuantity(item._id, -1); } }}>{item.quantity === 1 ? "X" : ""}</button>
                        <span className="qty-num">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item._id, 1)}>+</button>
                      </div>
                    </div>
                    <div className="cart-item-total">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}

                {/* Address Section */}
                <div style={{ marginTop: "28px" }}>
                  <h2 className="cart-section-title" style={{ marginBottom: "16px" }}>Delivery Address</h2>
                  {userProfile && userProfile.addresses && userProfile.addresses.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {userProfile.addresses.map((addr, idx) => (
                        <div key={idx} onClick={() => setSelectedAddressIdx(idx)}
                          style={{ border: "2px solid " + (selectedAddressIdx === idx ? "var(--primary)" : "var(--border)"), borderRadius: "var(--radius-md)", padding: "14px 16px", cursor: "pointer", background: selectedAddressIdx === idx ? "rgba(255,71,87,0.04)" : "white", transition: "all 0.2s" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid " + (selectedAddressIdx === idx ? "var(--primary)" : "var(--border)"), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {selectedAddressIdx === idx && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)" }} />}
                            </div>
                            <span style={{ fontWeight: 700, fontSize: "13px" }}>{addr.label} {addr.isDefault ? "(Default)" : ""}</span>
                          </div>
                          <div style={{ marginLeft: "28px", marginTop: "4px", fontSize: "13px", color: "var(--text-secondary)" }}>{addr.street}, {addr.city}{addr.state ? ", " + addr.state : ""}{addr.pincode ? " - " + addr.pincode : ""}</div>
                        </div>
                      ))}
                      <button className="btn btn-outline" style={{ marginTop: "4px", width: "fit-content" }} onClick={() => setShowAddressForm(!showAddressForm)}>+ Add New Address</button>
                    </div>
                  ) : (
                    <div style={{ background: "rgba(255,71,87,0.05)", border: "1.5px dashed var(--primary)", borderRadius: "var(--radius-md)", padding: "20px", textAlign: "center" }}>
                      <p style={{ color: "var(--text-secondary)", marginBottom: "12px" }}>No saved addresses. Add one to continue.</p>
                      <button className="btn btn-primary" onClick={() => setShowAddressForm(true)}>+ Add Address</button>
                    </div>
                  )}

                  {showAddressForm && (
                    <div style={{ marginTop: "16px", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", padding: "20px", border: "1px solid var(--border)" }}>
                      <h3 style={{ fontWeight: 700, marginBottom: "16px", fontSize: "15px" }}>New Address</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div className="form-group" style={{ gridColumn: "1/-1" }}>
                          <label className="form-label">Label</label>
                          <select className="form-input" value={newAddress.label} onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}>
                            <option>Home</option><option>Work</option><option>Other</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ gridColumn: "1/-1" }}>
                          <label className="form-label">Street / Area *</label>
                          <input className="form-input" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} placeholder="e.g. 123 MG Road, Apt 4B" />
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
                        <button className="btn btn-primary" onClick={handleAddAddress}>Save Address</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment */}
                <div style={{ marginTop: "24px" }}>
                  <h2 className="cart-section-title" style={{ marginBottom: "16px" }}>Payment Method</h2>
                  <div style={{ display: "flex", gap: "12px" }}>
                    {["COD", "Online"].map(method => (
                      <div key={method} onClick={() => setPaymentMethod(method)}
                        style={{ flex: 1, border: "2px solid " + (paymentMethod === method ? "var(--primary)" : "var(--border)"), borderRadius: "var(--radius-md)", padding: "14px", cursor: "pointer", textAlign: "center", background: paymentMethod === method ? "rgba(255,71,87,0.04)" : "white", transition: "all 0.2s" }}>
                        <div style={{ fontSize: "22px", marginBottom: "4px" }}>{method === "COD" ? "Cash" : "Online"}</div>
                        <div style={{ fontWeight: 700, fontSize: "13px" }}>{method === "COD" ? "Cash on Delivery" : "Online Payment"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary column */}
              <div className="cart-summary">
                <h2 className="cart-section-title">Order Summary</h2>
                <div className="divider" />
                {cartItems[0] && cartItems[0].restaurantName && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", padding: "10px 12px", background: "rgba(255,71,87,0.05)", borderRadius: "var(--radius-sm)" }}>
                    <div><div style={{ fontSize: "11px", color: "var(--text-light)" }}>Ordering from</div><div style={{ fontWeight: 700, fontSize: "14px" }}>{cartItems[0].restaurantName}</div></div>
                  </div>
                )}
                <div className="summary-row"><span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="summary-row"><span>Delivery fee</span><span>${deliveryFee.toFixed(2)}</span></div>
                <div className="summary-row"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                <div className="summary-row total"><span>Total</span><span style={{ color: "var(--primary)" }}>${total.toFixed(2)}</span></div>
                {selectedAddr && (
                  <div style={{ marginTop: "16px", padding: "12px", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", fontSize: "13px" }}>
                    <div style={{ fontWeight: 700, marginBottom: "4px" }}>Delivering to:</div>
                    <div style={{ color: "var(--text-secondary)" }}>{selectedAddr.street}, {selectedAddr.city}</div>
                  </div>
                )}
                <button className="btn btn-primary btn-lg" style={{ marginTop: "20px", borderRadius: "var(--radius-full)", width: "100%" }} onClick={handleCheckout} disabled={loading}>
                  {loading ? "Placing Order..." : "Place Order  $" + total.toFixed(2)}
                </button>
                <p style={{ fontSize: "12px", color: "var(--text-light)", textAlign: "center", marginTop: "12px" }}>Secure checkout | 30-min delivery</p>
                <button className="btn btn-outline" style={{ width: "100%", fontSize: "13px", marginTop: "12px" }} onClick={() => navigate("/orders")}>View My Orders</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
