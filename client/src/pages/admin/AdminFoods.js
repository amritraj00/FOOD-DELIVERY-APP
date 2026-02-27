import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { getFoodItems, deleteFoodItem } from "../../services/foodService";
import { getRestaurantById } from "../../services/restaurantService";
import { toast } from "react-toastify";
import FoodForm from "../../components/FoodForm";

const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">Admin Panel</div>
      <div className="sidebar-label">Management</div>
      <Link to="/admin/dashboard" className={"sidebar-link" + (pathname === "/admin/dashboard" ? " active" : "")}>
        <span className="icon">Dashboard</span>
      </Link>
      <Link to="/admin/restaurants" className={"sidebar-link" + (pathname.includes("restaurants") ? " active" : "")}>
        <span className="icon">🏪</span> Restaurants
      </Link>
      <Link to="/admin/orders" className={"sidebar-link" + (pathname === "/admin/orders" ? " active" : "")}>
        <span className="icon">📦</span> Orders
      </Link>
      <div className="sidebar-label" style={{ marginTop: "16px" }}>Quick Links</div>
      <button className="sidebar-link" style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer" }} onClick={() => navigate("/")}>
        View Site
      </button>
    </aside>
  );
};

const AdminFoods = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [restaurantData, foodData] = await Promise.all([
        getRestaurantById(id),
        getFoodItems(id),
      ]);
      setRestaurant(restaurantData);
      setFoodItems(foodData);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (foodId) => {
    if (window.confirm("Delete this food item?")) {
      try {
        await deleteFoodItem(foodId);
        toast.success("Food item deleted");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  const imgSrc = (src) => src && src.startsWith("http") ? src : ("http://localhost:5000" + src);

  return (
    <div className="page-wrapper">
      <div className="admin-layout">
        <Sidebar />
        <main className="admin-main">
          <div className="admin-header">
            <div>
              <button
                onClick={() => navigate("/admin/restaurants")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)", fontWeight: 600, fontSize: "14px", marginBottom: "8px", padding: 0 }}
              >
                Back to Restaurants
              </button>
              <h1 className="admin-title">{restaurant ? restaurant.name + " - Menu" : "Menu Items"}</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                {foodItems.length} item{foodItems.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => { setEditingFood(null); setShowModal(true); }}
              style={{ borderRadius: "var(--radius-full)" }}
            >
              + Add Food Item
            </button>
          </div>

          {loading ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : foodItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">No menu items yet</div>
              <h3 className="empty-title">Empty Menu</h3>
              <p className="empty-desc">Add your first food item to get started.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {foodItems.map((food) => (
                    <tr key={food._id}>
                      <td>
                        <img
                          src={imgSrc(food.image)}
                          alt={food.name}
                          className="table-img"
                          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80"; }}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{food.name}</div>
                        {food.description && (
                          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "3px" }}>
                            {food.description.substring(0, 55)}...
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ background: "rgba(124,58,237,0.08)", color: "var(--primary)", padding: "4px 10px", borderRadius: "var(--radius-full)", fontSize: "12px", fontWeight: 700 }}>
                          {food.category || "Main Course"}
                        </span>
                      </td>
                      <td><strong>₹{typeof food.price === "number" ? food.price.toFixed(2) : food.price}</strong></td>
                      <td>
                        <span style={{ background: food.isAvailable !== false ? "rgba(46,213,115,0.12)" : "rgba(124,58,237,0.1)", color: food.isAvailable !== false ? "var(--success)" : "var(--danger)", padding: "4px 10px", borderRadius: "var(--radius-full)", fontSize: "12px", fontWeight: 700 }}>
                          {food.isAvailable !== false ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => { setEditingFood(food); setShowModal(true); }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(food._id)}
                          >
                            Delete
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
            <FoodForm
              food={editingFood}
              restaurantId={id}
              onClose={() => { setShowModal(false); setEditingFood(null); }}
              onSuccess={() => { setShowModal(false); setEditingFood(null); fetchData(); }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminFoods;

