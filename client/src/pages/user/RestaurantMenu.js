import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFoodItems } from '../../services/foodService';
import { getRestaurantById } from '../../services/restaurantService';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

const CUISINE_ICONS = {
  Italian: '🍕', American: '🍔', Japanese: '🍣', Indian: '🍛',
  Chinese: '🥢', Mexican: '🌮', 'Multi-Cuisine': '🍽️',
};

const RestaurantMenu = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [addedItems, setAddedItems] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  const categories = ['All', ...new Set(foodItems.map((f) => f.category).filter(Boolean))];

  useEffect(() => {
    Promise.all([getRestaurantById(id), getFoodItems(id)])
      .then(([rData, fData]) => {
        setRestaurant(rData);
        setFoodItems(fData);
        setFiltered(fData);
      })
      .catch(() => toast.error('Failed to load menu'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (activeCategory === 'All') {
      setFiltered(foodItems);
    } else {
      setFiltered(foodItems.filter((f) => f.category === activeCategory));
    }
  }, [activeCategory, foodItems]);

  const handleAddToCart = (food) => {
    addToCart({
      ...food,
      restaurantId: id,
      restaurantName: restaurant?.name || '',
    });
    setAddedItems((prev) => ({ ...prev, [food._id]: true }));
    setTimeout(() => setAddedItems((prev) => ({ ...prev, [food._id]: false })), 1500);
  };

  const getItemQtyInCart = (foodId) => {
    const item = cartItems.find((i) => i._id === foodId);
    return item ? item.quantity : 0;
  };

  const imgSrc = (src) =>
    src?.startsWith('http') ? src : `http://localhost:5000${src}`;

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-wrap">
          <div className="spinner" />
          <p className="loading-text">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Menu Hero */}
      {restaurant && (
        <div className="menu-hero" style={{ marginTop: 0 }}>
          <img
            src={imgSrc(restaurant.image)}
            alt={restaurant.name}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80';
            }}
          />
          <div className="menu-hero-overlay">
            <div className="menu-hero-content">
              <button
                className="back-btn"
                onClick={() => navigate('/restaurants')}
                style={{ marginBottom: '16px' }}
              >
                ← Back
              </button>
              <h1 className="menu-hero-title">{restaurant.name}</h1>
              <div className="menu-hero-meta">
                <span>⭐ {restaurant.rating || '4.5'}</span>
                <span>⏱ {restaurant.deliveryTime || '30-45 min'}</span>
                <span>💰 Min ${restaurant.minOrder || 10}</span>
                <span>{CUISINE_ICONS[restaurant.cuisine] || '🍽️'} {restaurant.cuisine}</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.70)', fontSize: '14px', marginTop: '8px', maxWidth: '500px' }}>
                {restaurant.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="section">
        <div className="container">
          {/* Category Filter */}
          {categories.length > 2 && (
            <div className="category-bar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-pill${activeCategory === cat ? ' active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Cart shortcut */}
          {cartItems.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--primary)',
                color: 'white',
                padding: '14px 20px',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '24px',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/cart')}
            >
              <span style={{ fontWeight: 600 }}>
                🛒 {cartItems.reduce((s, i) => s + i.quantity, 0)} items in cart
              </span>
              <span style={{ fontWeight: 700 }}>
                View Cart → ₹{cartItems.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}
              </span>
            </div>
          )}

          {/* Food Grid */}
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍽️</div>
              <h3 className="empty-title">No items in this category</h3>
              <p className="empty-desc">Try selecting a different category.</p>
            </div>
          ) : (
            <div className="food-grid">
              {filtered.map((food) => {
                const qtyInCart = getItemQtyInCart(food._id);
                const isAdded = addedItems[food._id];
                return (
                  <div key={food._id} className="food-card">
                    <div className="food-img-wrap">
                      <img
                        src={imgSrc(food.image)}
                        alt={food.name}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80';
                        }}
                      />
                      {food.category && (
                        <div className="food-category-tag">{food.category}</div>
                      )}
                    </div>
                    <div className="food-body">
                      <h3 className="food-name">{food.name}</h3>
                      <p className="food-desc">
                        {food.description || 'Freshly prepared with the finest ingredients.'}
                      </p>
                      <div className="food-footer">
                        <span className="food-price">₹{food.price.toFixed(2)}</span>
                        <button
                          className={`btn-add-cart${isAdded ? ' added' : ''}`}
                          onClick={() => handleAddToCart(food)}
                        >
                          {isAdded ? '✓ Added!' : qtyInCart > 0 ? `+1 (${qtyInCart})` : '+ Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantMenu;

