import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "../../services/orderService";
import { toast } from "react-toastify";

const STATUS_STEPS = ["Placed", "Confirmed", "Preparing", "Out for Delivery", "Delivered"];

const STATUS_INFO = {
  Placed: { icon: "&#128203;", label: "Order Placed", desc: "Your order has been received" },
  Confirmed: { icon: "&#10003;", label: "Confirmed", desc: "Restaurant confirmed your order" },
  Preparing: { icon: "&#127859;", label: "Preparing", desc: "Chef is cooking your food" },
  "Out for Delivery": { icon: "&#128690;", label: "Out for Delivery", desc: "Delivery partner is on the way" },
  Delivered: { icon: "&#127968;", label: "Delivered", desc: "Enjoy your meal!" },
};

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const deliveryMarkerRef = useRef(null);
  const animationRef = useRef(null);
  const pollRef = useRef(null);
  const progressRef = useRef(0);

  const fetchOrder = useCallback(async () => {
    try {
      const data = await getOrderById(id);
      setOrder(data);
      return data;
    } catch (e) {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
    pollRef.current = setInterval(fetchOrder, 15000);
    return () => clearInterval(pollRef.current);
  }, [fetchOrder]);

  // Init Leaflet map
  useEffect(() => {
    if (!order || !mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    if (!L) return;

    const restLat = order.restaurantLat || 28.6200;
    const restLng = order.restaurantLng || 77.2100;
    const destLat = order.deliveryAddress && order.deliveryAddress.lat ? order.deliveryAddress.lat : 28.6139;
    const destLng = order.deliveryAddress && order.deliveryAddress.lng ? order.deliveryAddress.lng : 77.2090;

    const centerLat = (restLat + destLat) / 2;
    const centerLng = (restLng + destLng) / 2;

    const map = L.map(mapRef.current).setView([centerLat, centerLng], 13);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const restaurantIcon = L.divIcon({
      html: "<div style=\"width:36px;height:36px;border-radius:50%;background:#ff4757;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)\">&#127860;</div>",
      className: "", iconAnchor: [18, 18],
    });
    const homeIcon = L.divIcon({
      html: "<div style=\"width:36px;height:36px;border-radius:50%;background:#2ed573;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)\">&#127968;</div>",
      className: "", iconAnchor: [18, 18],
    });
    const bikeIcon = L.divIcon({
      html: "<div style=\"width:40px;height:40px;border-radius:50%;background:#ffa502;display:flex;align-items:center;justify-content:center;font-size:20px;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.4)\">&#128690;</div>",
      className: "", iconAnchor: [20, 20],
    });

    L.marker([restLat, restLng], { icon: restaurantIcon }).addTo(map).bindPopup("<b>" + order.restaurantName + "</b><br>Restaurant").openPopup();
    L.marker([destLat, destLng], { icon: homeIcon }).addTo(map).bindPopup("<b>Delivery Address</b><br>" + (order.deliveryAddress ? order.deliveryAddress.street + ", " + order.deliveryAddress.city : ""));

    // Draw dashed route line
    L.polyline([[restLat, restLng], [destLat, destLng]], { color: "#ff4757", weight: 3, dashArray: "10,6", opacity: 0.7 }).addTo(map);

    // Animate delivery marker from restaurant toward home
    const deliveryMarker = L.marker([restLat, restLng], { icon: bikeIcon }).addTo(map);
    deliveryMarkerRef.current = deliveryMarker;

    const isDelivered = order.status === "Delivered";
    const isOutForDelivery = order.status === "Out for Delivery";

    if (isDelivered) {
      deliveryMarker.setLatLng([destLat, destLng]);
      deliveryMarker.bindPopup("<b>Order Delivered!</b>").openPopup();
    } else if (isOutForDelivery) {
      let progress = progressRef.current;
      const animate = () => {
        progress = Math.min(progress + 0.003, 0.95);
        progressRef.current = progress;
        const lat = restLat + (destLat - restLat) * progress;
        const lng = restLng + (destLng - restLng) * progress;
        deliveryMarker.setLatLng([lat, lng]);
        if (progress < 0.95) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [order]);

  // Update marker when status changes
  useEffect(() => {
    if (!order || !deliveryMarkerRef.current || !mapInstanceRef.current) return;
    if (order.status === "Delivered") {
      const destLat = order.deliveryAddress && order.deliveryAddress.lat ? order.deliveryAddress.lat : 28.6139;
      const destLng = order.deliveryAddress && order.deliveryAddress.lng ? order.deliveryAddress.lng : 77.2090;
      deliveryMarkerRef.current.setLatLng([destLat, destLng]);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
  }, [order]);

  if (loading) return <div className="page-wrapper" style={{ paddingTop: "100px" }}><div className="loading-wrap"><div className="spinner" /></div></div>;
  if (!order) return <div className="page-wrapper" style={{ paddingTop: "100px", textAlign: "center" }}><h2>Order not found</h2></div>;

  const currentStepIdx = STATUS_STEPS.indexOf(order.status);
  const formatDate = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";
  const estimatedTime = order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "N/A";

  return (
    <div className="page-wrapper">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <div style={{ paddingTop: "80px", paddingBottom: "40px" }}>
        {/* Top bar */}
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 20px 20px" }}>
          <button onClick={() => navigate("/orders")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)", fontWeight: 600, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
            &#8592; My Orders
          </button>
        </div>

        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px", alignItems: "start" }} className="track-grid">
          {/* Map */}
          <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-md)", border: "1px solid var(--border)" }}>
            <MapLoader mapRef={mapRef} />
            <div ref={mapRef} style={{ height: "420px", width: "100%", background: "#f0f0f0" }} />
            {order.status === "Out for Delivery" && (
              <div style={{ padding: "14px 16px", background: "white", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg,#ff4757,#ff6b81)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>&#128690;</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "14px" }}>{order.deliveryPersonName}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Your delivery partner</div>
                </div>
                <a href={"tel:" + order.deliveryPersonPhone} style={{ background: "rgba(255,71,87,0.1)", color: "var(--primary)", padding: "8px 14px", borderRadius: "var(--radius-full)", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>
                  Call
                </a>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Status Card */}
            <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ background: order.status === "Delivered" ? "#22c55e" : order.status === "Cancelled" ? "#ef4444" : "var(--primary)", padding: "20px 20px 16px", color: "white" }}>
                <div style={{ fontSize: "13px", opacity: 0.9, marginBottom: "4px" }}>Order #{order._id.slice(-8).toUpperCase()}</div>
                <div style={{ fontSize: "22px", fontWeight: 800 }}>{order.status}</div>
                {order.status !== "Delivered" && order.status !== "Cancelled" && (
                  <div style={{ fontSize: "13px", opacity: 0.85, marginTop: "4px" }}>Est. delivery: {estimatedTime}</div>
                )}
              </div>

              {/* Progress stepper */}
              <div style={{ padding: "20px" }}>
                {STATUS_STEPS.map((step, idx) => {
                  const done = idx <= currentStepIdx;
                  const active = idx === currentStepIdx;
                  const cfg = STATUS_INFO[step];
                  return (
                    <div key={step} style={{ display: "flex", gap: "14px", marginBottom: idx === STATUS_STEPS.length - 1 ? 0 : "4px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: done ? (active ? "var(--primary)" : "#22c55e") : "var(--bg-secondary)", border: "2px solid", borderColor: done ? (active ? "var(--primary)" : "#22c55e") : "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: done ? "white" : "var(--text-light)", fontWeight: 700, transition: "all 0.3s" }}
                          dangerouslySetInnerHTML={{ __html: done ? (idx < currentStepIdx ? "&#10003;" : cfg.icon) : (idx + 1) + "" }} />
                        {idx < STATUS_STEPS.length - 1 && (
                          <div style={{ width: "2px", height: "24px", background: idx < currentStepIdx ? "#22c55e" : "var(--border)", margin: "4px 0", transition: "background 0.3s" }} />
                        )}
                      </div>
                      <div style={{ paddingTop: "4px", paddingBottom: idx < STATUS_STEPS.length - 1 ? "20px" : 0 }}>
                        <div style={{ fontWeight: active ? 700 : 600, fontSize: "14px", color: active ? "var(--primary)" : (done ? "var(--text-primary)" : "var(--text-light)") }}>{cfg.label}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                          {done ? cfg.desc : "Waiting..."}
                          {order.statusHistory && order.statusHistory.find(h => h.status === step) && (
                            <span style={{ marginLeft: "6px", color: "var(--text-light)" }}>
                              {formatDate(order.statusHistory.find(h => h.status === step).time)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", padding: "20px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "14px" }}>Order Items</div>
              {order.items.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < order.items.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ fontSize: "14px" }}>{item.name} <span style={{ color: "var(--text-secondary)" }}>x{item.quantity}</span></div>
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>₹{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
              <div style={{ borderTop: "2px solid var(--border)", paddingTop: "12px", marginTop: "8px", display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "16px" }}>
                <span>Total</span>
                <span style={{ color: "var(--primary)" }}>₹{order.total && order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Delivery Info */}
            <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", padding: "18px 20px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "10px" }}>Delivery Details</div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {order.deliveryAddress && (
                  <div>{order.deliveryAddress.street}, {order.deliveryAddress.city}{order.deliveryAddress.state ? ", " + order.deliveryAddress.state : ""}{order.deliveryAddress.pincode ? " - " + order.deliveryAddress.pincode : ""}</div>
                )}
                <div style={{ marginTop: "8px", color: "var(--text-primary)", fontSize: "12px", fontWeight: 600 }}>{order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .track-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};

// Lazy-load Leaflet script
const MapLoader = ({ mapRef }) => {
  useEffect(() => {
    if (window.L) return;
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.crossOrigin = "";
    document.head.appendChild(script);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }, []);
  return null;
};

export default OrderTracking;
