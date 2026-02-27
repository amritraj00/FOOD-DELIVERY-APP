import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { getRestaurants, deleteRestaurant } from "../../services/restaurantService";
import { toast } from "react-toastify";
import RestaurantForm from "../../components/RestaurantForm";

const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo"> Admin Panel</div>
      <div className="sidebar-label">Management</div>
      <Link to="/admin/dashboard" className={`sidebar-link${pathname === "/admin/dashboard" ? " active" : ""}`}>
        <span className="icon"></span> Dashboard
      </Link>
      <Link to="/admin/restaurants" className={`sidebar-link${pathname.includes("restaurants") ? " active" : ""}`}>
        <span className="icon">🏪</span> Restaurants
      </Link>
      <Link to="/admin/restaurant-details" className={`sidebar-link${pathname === "/admin/restaurant-details" ? " active" : ""}`}>
        <span className="icon">💳</span> Payment Details
      </Link>
      <Link to="/admin/orders" className={`sidebar-link${pathname === "/admin/orders" ? " active" : ""}`}>
        <span className="icon">📦</span> Orders
      </Link>
      <div className="sidebar-label" style={{ marginTop: "16px" }}>Quick Links</div>
      <button className="sidebar-link" style={{ width: "100%", textAlign: "left" }} onClick={() => navigate("/")}>
        <span className="icon"></span> View Site
      </button>
    </aside>
  );
};

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchRestaurants(); }, []);

  const fetchRestaurants = async () => {
    try {
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (error) {
      toast.error("Failed to fetch restaurants");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this restaurant and all its menu items?")) {
      try {
        await deleteRestaurant(id);
        toast.success("Restaurant deleted");
        fetchRestaurants();
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  const imgSrc = (src) => src?.startsWith("http") ? src : `http://localhost:5000${src}`;

  return (
    <div className="page-wrapper">
      <div className="admin-layout">
        <Sidebar />
        <main className="admin-main">
          <div className="admin-header">
            <div>
              <h1 className="admin-title">Manage Restaurants</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                {restaurants.length} restaurant{restaurants.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => { setEditingRestaurant(null); setShowModal(true); }}
              style={{ borderRadius: "var(--radius-full)" }}
            >
              + Add Restaurant
            </button>
          </div>

          {loading ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : restaurants.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"></div>
              <h3 className="empty-title">No restaurants yet</h3>
              <p className="empty-desc">Click "Add Restaurant" to get started.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Restaurant</th>
                    <th>Cuisine</th>
                    <th>Rating</th>
                    <th>Delivery</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurants.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <img
                          src={imgSrc(r.image)}
                          alt={r.name}
                          className="table-img"
                          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80"; }}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{r.name}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "3px" }}>
                          {r.description?.substring(0, 60)}...
                        </div>
                      </td>
                      <td>
                        <span style={{ background: "rgba(124,58,237,0.08)", color: "var(--primary)", padding: "4px 10px", borderRadius: "var(--radius-full)", fontSize: "12px", fontWeight: 700 }}>
                          {r.cuisine}
                        </span>
                      </td>
                      <td> {r.rating}</td>
                      <td>{r.deliveryTime}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => { setEditingRestaurant(r); setShowModal(true); }}
                          >
                             Edit
                          </button>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => navigate(`/admin/restaurants/${r._id}/foods`)}
                          >
                             Menu
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(r._id)}
                          >
                            
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showModal && (
            <RestaurantForm
              restaurant={editingRestaurant}
              onClose={() => { setShowModal(false); setEditingRestaurant(null); }}
              onSuccess={() => { setShowModal(false); setEditingRestaurant(null); fetchRestaurants(); }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminRestaurants;

