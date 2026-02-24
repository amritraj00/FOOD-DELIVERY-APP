import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getAllOrders, updateOrderStatus } from '../../services/orderService';
import { toast } from 'react-toastify';

const STATUS_COLORS = {
  Placed: { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  Confirmed: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  Preparing: { bg: '#fefce8', color: '#ca8a04', border: '#fde68a' },
  'Out for Delivery': { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  Delivered: { bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
  Cancelled: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' };
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: '999px', padding: '4px 12px', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
};

const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">⚙️ Admin Panel</div>
      <div className="sidebar-label">Management</div>
      <Link to="/admin/dashboard" className={`sidebar-link${pathname === '/admin/dashboard' ? ' active' : ''}`}>
        <span className="icon">📊</span> Dashboard
      </Link>
      <Link to="/admin/restaurants" className={`sidebar-link${pathname.includes('restaurants') ? ' active' : ''}`}>
        <span className="icon">🏪</span> Restaurants
      </Link>
      <Link to="/admin/orders" className={`sidebar-link${pathname === '/admin/orders' ? ' active' : ''}`}>
        <span className="icon">📦</span> Orders
      </Link>
      <div className="sidebar-label" style={{ marginTop: '16px' }}>Quick Links</div>
      <button className="sidebar-link" style={{ width: '100%', textAlign: 'left' }} onClick={() => navigate('/')}>
        <span className="icon">🏠</span> View Site
      </button>
    </aside>
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (e) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order marked as: ${newStatus}`);
      fetchOrders();
    } catch (e) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const tabs = ['All', 'Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  const pendingAction = orders.filter(o => o.status === 'Preparing').length;

  const payIcon = { COD: '💵', UPI: '📱', Online: '💳' };

  return (
    <div className="page-wrapper">
      <div className="admin-layout">
        <Sidebar />
        <main className="admin-main">
          <div className="admin-header">
            <div>
              <h1 className="admin-title">Order Management</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                {orders.length} total orders
                {pendingAction > 0 && (
                  <span style={{ marginLeft: '12px', background: '#fef3c7', color: '#d97706', padding: '2px 10px', borderRadius: '999px', fontWeight: 700, fontSize: '13px' }}>
                    ⚠️ {pendingAction} ready for dispatch
                  </span>
                )}
              </p>
            </div>
            <button className="btn btn-outline" onClick={fetchOrders} style={{ borderRadius: 'var(--radius-full)' }}>
              🔄 Refresh
            </button>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'].map(s => {
              const cnt = orders.filter(o => o.status === s).length;
              const sc = STATUS_COLORS[s];
              return (
                <div key={s} onClick={() => setFilter(s)} style={{ background: 'white', border: `1.5px solid ${filter === s ? sc.color : 'var(--border)'}`, borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: sc.color }}>{cnt}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '2px' }}>{s}</div>
                </div>
              );
            })}
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setFilter(t)}
                style={{ padding: '6px 16px', borderRadius: '999px', border: '1.5px solid', borderColor: filter === t ? 'var(--primary)' : 'var(--border)', background: filter === t ? 'var(--primary)' : 'white', color: filter === t ? 'white' : 'var(--text-secondary)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading orders...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>No orders found</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filtered.map(order => (
                <div key={order._id} style={{ background: 'white', borderRadius: '16px', border: '1.5px solid', borderColor: order.status === 'Preparing' ? '#fbbf24' : 'var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                  {/* Order header */}
                  <div style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '14px' }}>#{order._id.slice(-8).toUpperCase()}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(order.createdAt).toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>{order.user?.name || 'Customer'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{order.user?.email}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>{order.restaurantName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{order.items?.length} item(s)</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--primary)' }}>₹{order.total?.toFixed(2)}</span>
                      <span title={order.paymentMethod} style={{ fontSize: '18px' }}>{payIcon[order.paymentMethod] || '💳'}</span>
                      <StatusBadge status={order.status} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{expandedId === order._id ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {expandedId === order._id && (
                    <div style={{ borderTop: '1px solid var(--border)', padding: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        {/* Items */}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>ORDER ITEMS</div>
                          {order.items?.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', padding: '6px 0', borderBottom: '1px solid var(--bg-secondary)' }}>
                              <span>{item.name} × {item.quantity}</span>
                              <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, marginTop: '10px', fontSize: '15px', color: 'var(--primary)' }}>
                            <span>Total</span><span>₹{order.total?.toFixed(2)}</span>
                          </div>
                          {order.paymentMethod === 'UPI' && order.upiId && (
                            <div style={{ marginTop: '8px', fontSize: '13px', color: '#6366f1', background: 'rgba(99,102,241,0.07)', padding: '6px 10px', borderRadius: '8px' }}>
                              📱 UPI: {order.upiId}
                            </div>
                          )}
                        </div>
                        {/* Address + Status history */}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>DELIVERY ADDRESS</div>
                          <div style={{ fontSize: '14px', marginBottom: '16px' }}>
                            <strong>{order.deliveryAddress?.label}</strong><br />
                            {order.deliveryAddress?.street}, {order.deliveryAddress?.city}<br />
                            {order.deliveryAddress?.state && `${order.deliveryAddress.state} `}{order.deliveryAddress?.pincode}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>STATUS TIMELINE</div>
                          {order.statusHistory?.slice(-4).map((h, i) => (
                            <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '4px 0', borderLeft: '2px solid var(--primary)', paddingLeft: '10px', marginBottom: '4px' }}>
                              <strong style={{ color: 'var(--text-primary)' }}>{h.status}</strong> — {new Date(h.time).toLocaleTimeString()}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <div style={{ borderTop: '1px solid var(--bg-secondary)', paddingTop: '16px' }}>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>ADMIN ACTIONS</div>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {order.status === 'Preparing' && (
                              <button
                                onClick={() => handleStatusUpdate(order._id, 'Out for Delivery')}
                                disabled={updating === order._id}
                                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '999px', padding: '10px 22px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', opacity: updating === order._id ? 0.6 : 1 }}>
                                🚴 {updating === order._id ? 'Updating...' : 'Dispatch — Out for Delivery'}
                              </button>
                            )}
                            {order.status === 'Out for Delivery' && (
                              <button
                                onClick={() => handleStatusUpdate(order._id, 'Delivered')}
                                disabled={updating === order._id}
                                style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: '999px', padding: '10px 22px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', opacity: updating === order._id ? 0.6 : 1 }}>
                                ✅ {updating === order._id ? 'Updating...' : 'Mark Delivered'}
                              </button>
                            )}
                            {(order.status === 'Placed' || order.status === 'Confirmed' || order.status === 'Preparing') && (
                              <button
                                onClick={() => { if (window.confirm('Cancel this order?')) handleStatusUpdate(order._id, 'Cancelled'); }}
                                disabled={updating === order._id}
                                style={{ background: 'white', color: '#dc2626', border: '1.5px solid #fca5a5', borderRadius: '999px', padding: '8px 20px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                                ✕ Cancel Order
                              </button>
                            )}
                          </div>
                          {order.status === 'Preparing' && (
                            <p style={{ fontSize: '12px', color: '#d97706', marginTop: '10px', background: '#fef3c7', padding: '8px 12px', borderRadius: '8px' }}>
                              ⚠️ This order is ready. Click "Dispatch" to send it out — delivery will auto-complete in 20 minutes.
                            </p>
                          )}
                        </div>
                      )}
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
};

export default AdminOrders;
