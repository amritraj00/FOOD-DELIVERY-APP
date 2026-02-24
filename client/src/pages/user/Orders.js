import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrders } from "../../services/orderService";
import { toast } from "react-toastify";

const STATUS_CONFIG = {
  Placed: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: "order_placed" },
  Confirmed: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: "order_confirmed" },
  Preparing: { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", icon: "preparing" },
  "Out for Delivery": { color: "#f97316", bg: "rgba(249,115,22,0.1)", icon: "delivery" },
  Delivered: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", icon: "done" },
  Cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: "cancelled" },
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "All" ? orders : orders.filter(o => o.status === filter);

  const imgSrc = (src) => src && src.startsWith("http") ? src : ("http://localhost:5000" + src);

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: "100px", paddingBottom: "40px", maxWidth: "860px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>My Orders</h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate("/restaurants")} style={{ borderRadius: "var(--radius-full)" }}>+ New Order</button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
          {["All", "Placed", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "7px 16px", borderRadius: "var(--radius-full)", border: "1.5px solid", borderColor: filter === f ? "var(--primary)" : "var(--border)", background: filter === f ? "var(--primary)" : "white", color: filter === f ? "white" : "var(--text-secondary)", fontWeight: 600, fontSize: "13px", cursor: "pointer", transition: "all 0.2s" }}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>&#128230;</div>
            <h3 className="empty-title">No orders yet</h3>
            <p className="empty-desc">Place your first order from our amazing restaurants!</p>
            <button className="btn btn-primary" style={{ marginTop: "20px", borderRadius: "var(--radius-full)" }} onClick={() => navigate("/restaurants")}>Browse Restaurants</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filtered.map(order => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG["Placed"];
              return (
                <div key={order._id}
                  style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                  {/* Header */}
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "16px" }}>{order.restaurantName}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-light)", marginTop: "2px" }}>{formatDate(order.createdAt)}  #{order._id.slice(-8).toUpperCase()}</div>
                    </div>
                    <span style={{ padding: "6px 14px", borderRadius: "var(--radius-full)", background: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: "13px" }}>
                      {order.status}
                    </span>
                  </div>

                  {/* Items */}
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      {order.items.slice(0, 4).map((item, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", padding: "6px 10px", fontSize: "13px" }}>
                          {item.image && <img src={imgSrc(item.image)} alt={item.name} style={{ width: "28px", height: "28px", borderRadius: "4px", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />}
                          <span style={{ fontWeight: 600 }}>{item.name}</span>
                          <span style={{ color: "var(--primary)", fontWeight: 700 }}>x{item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 4 && <span style={{ fontSize: "13px", color: "var(--text-secondary)", alignSelf: "center" }}>+{order.items.length - 4} more</span>}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                          {order.deliveryAddress && (order.deliveryAddress.street + ", " + order.deliveryAddress.city)}
                        </div>
                        <div style={{ fontWeight: 800, fontSize: "18px", color: "var(--text-primary)", marginTop: "4px" }}>
                          ${order.total && order.total.toFixed(2)} <span style={{ fontWeight: 400, fontSize: "12px", color: "var(--text-light)" }}>{order.paymentMethod}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        {(order.status === "Out for Delivery" || order.status === "Preparing" || order.status === "Confirmed" || order.status === "Placed") && (
                          <button className="btn btn-primary" style={{ borderRadius: "var(--radius-full)", fontSize: "13px" }} onClick={() => navigate("/orders/" + order._id + "/track")}>
                            Track Order
                          </button>
                        )}
                        <button className="btn btn-outline" style={{ borderRadius: "var(--radius-full)", fontSize: "13px" }} onClick={() => navigate("/orders/" + order._id + "/track")}>
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
