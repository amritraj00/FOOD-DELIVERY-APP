import React, { useState } from 'react';
import { createFoodItem, updateFoodItem } from '../services/foodService';
import { toast } from 'react-toastify';

const CATEGORIES = ['Pizza', 'Burgers', 'Sushi', 'Rolls', 'Main Course', 'Rice Dishes', 'Noodles', 'Tacos', 'Desserts', 'Drinks', 'Appetizers', 'Salads', 'Sandwiches', 'Other'];

const FoodForm = ({ food, restaurantId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: food?.name || '',
    price: food?.price || '',
    description: food?.description || '',
    category: food?.category || 'Main Course',
    imageUrl: food?.image?.startsWith('http') ? food.image : '',
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
    data.append('price', formData.price);
    data.append('description', formData.description);
    data.append('category', formData.category);
    if (image) {
      data.append('image', image);
    } else if (formData.imageUrl) {
      data.append('imageUrl', formData.imageUrl);
    }

    try {
      if (food) {
        await updateFoodItem(food._id, data);
        toast.success('Food item updated!');
      } else {
        await createFoodItem(restaurantId, data);
        toast.success('Food item created!');
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
      <div className="modal-content" style={{ maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{food ? 'Edit Food Item' : 'Add Food Item'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Item Name *</label>
            <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required placeholder="e.g. Margherita Pizza" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-input" value={formData.description} onChange={handleChange} rows="2" placeholder="Describe this item..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Price ($) *</label>
              <input type="number" name="price" className="form-input" value={formData.price} onChange={handleChange} required min="0" step="0.01" placeholder="12.99" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select name="category" className="form-input" value={formData.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Image URL (Unsplash, etc.)</label>
            <input type="url" name="imageUrl" className="form-input" value={formData.imageUrl} onChange={handleChange} placeholder="https://images.unsplash.com/..." />
          </div>
          <div className="form-group">
            <label className="form-label">— or upload a file {food && '(replaces current)'}</label>
            <input type="file" className="form-input" onChange={(e) => setImage(e.target.files[0])} accept="image/*" />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2 }}>
              {loading ? 'Saving...' : food ? 'Update Item' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FoodForm;
