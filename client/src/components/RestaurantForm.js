import React, { useState } from 'react';
import { createRestaurant, updateRestaurant } from '../services/restaurantService';
import { toast } from 'react-toastify';

const CUISINES = ['Italian', 'American', 'Japanese', 'Indian', 'Chinese', 'Mexican', 'Multi-Cuisine', 'Mediterranean', 'Thai', 'Other'];

const RestaurantForm = ({ restaurant, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: restaurant?.name || '',
    description: restaurant?.description || '',
    imageUrl: restaurant?.image?.startsWith('http') ? restaurant.image : '',
    cuisine: restaurant?.cuisine || 'American',
    rating: restaurant?.rating || 4.5,
    deliveryTime: restaurant?.deliveryTime || '30-45 min',
    minOrder: restaurant?.minOrder || 10,
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('cuisine', formData.cuisine);
    data.append('rating', formData.rating);
    data.append('deliveryTime', formData.deliveryTime);
    data.append('minOrder', formData.minOrder);
    if (image) {
      data.append('image', image);
    } else if (formData.imageUrl) {
      data.append('imageUrl', formData.imageUrl);
    }

    try {
      if (restaurant) {
        await updateRestaurant(restaurant._id, data);
        toast.success('Restaurant updated!');
      } else {
        await createRestaurant(data);
        toast.success('Restaurant created!');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{restaurant ? 'Edit Restaurant' : 'Add Restaurant'}</h2>
          <button className="modal-close" onClick={onClose}>Ã—</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Restaurant Name *</label>
            <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required placeholder="e.g. Pizza Palace" />
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea name="description" className="form-input" value={formData.description} onChange={handleChange} required rows="3" placeholder="Describe your restaurant..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Cuisine Type</label>
              <select name="cuisine" className="form-input" value={formData.cuisine} onChange={handleChange}>
                {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Rating (1-5)</label>
              <input type="number" name="rating" className="form-input" value={formData.rating} onChange={handleChange} min="1" max="5" step="0.1" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Delivery Time</label>
              <input type="text" name="deliveryTime" className="form-input" value={formData.deliveryTime} onChange={handleChange} placeholder="30-45 min" />
            </div>
            <div className="form-group">
              <label className="form-label">Min Order ($)</label>
              <input type="number" name="minOrder" className="form-input" value={formData.minOrder} onChange={handleChange} min="0" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Image URL (Unsplash, etc.)</label>
            <input type="url" name="imageUrl" className="form-input" value={formData.imageUrl} onChange={handleChange} placeholder="https://images.unsplash.com/..." />
          </div>
          <div className="form-group">
            <label className="form-label">â€” or upload a file {restaurant && '(replaces current)'}</label>
            <input type="file" className="form-input" onChange={(e) => setImage(e.target.files[0])} accept="image/*" />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2 }}>
              {loading ? 'Saving...' : restaurant ? 'Update Restaurant' : 'Create Restaurant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestaurantForm;

