import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null); // State for inline editing (optional)
  const [editName, setEditName] = useState(''); // State for the editing input
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Failed to fetch categories', err);
        setError('Could not load categories.');
      }
      setIsLoading(false);
    };
    fetchCategories();
  }, []);

  // Handle new category submission
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return; // Prevent empty submission
    
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/categories', { name: newCategoryName });
      setCategories([...categories, response.data].sort((a, b) => a.name.localeCompare(b.name))); // Add and sort
      setNewCategoryName(''); // Clear input
    } catch (err) {
      console.error('Failed to add category', err);
      setError(err.response?.data?.message || 'Could not add category.');
    }
    setIsLoading(false);
  };

  // Handle category deletion
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    // Optimistic UI update can be added here if desired
    setIsLoading(true); // Or maybe a different loading state per item
    setError('');
    try {
      await axios.delete(`/api/categories/${id}`);
      setCategories(categories.filter(cat => cat._id !== id));
    } catch (err) {
      console.error('Failed to delete category', err);
      setError(err.response?.data?.message || 'Could not delete category.');
      // Revert optimistic UI update here if implemented
    }
    setIsLoading(false);
  };

  // --- Optional: Inline Editing Functions --- 
  const handleStartEdit = (category) => {
    setEditingCategory(category._id);
    setEditName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
  };

  const handleUpdateCategory = async (id) => {
    if (!editName.trim() || !editingCategory) return;

    setIsLoading(true);
    setError('');
    try {
      const response = await axios.put(`/api/categories/${id}`, { name: editName });
      setCategories(categories.map(cat => cat._id === id ? response.data : cat).sort((a, b) => a.name.localeCompare(b.name)));
      handleCancelEdit(); // Exit editing mode
    } catch (err) {
      console.error('Failed to update category', err);
      setError(err.response?.data?.message || 'Could not update category.');
       // Optionally keep editing mode open on error
    }
    setIsLoading(false);
  }
  // --- End Optional Editing Functions ---

  return (
    <>
      <h1 className="dashboard-title">Manage Categories</h1>
      <div className="page-content-centered categories-page-container">
        <p className="categories-intro-text">Add, edit, or remove your expense categories.</p>
        
        {error && <p className="error-message" style={{marginBottom: '1rem'}}>{error}</p>}

        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="category-add-form">
          <input 
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category name..."
            className="auth-input" 
            required
            disabled={isLoading}
          />
          <button type="submit" className="expense-form-button primary-button" disabled={isLoading}>
            {isLoading ? 'Adding...' : '+ Add Category'}
          </button>
        </form>

        {/* Category List Section */}
        <div className="category-list-section">
          <h2 className="section-title-like">Your Categories</h2>
          {isLoading && categories.length === 0 && <p className="loading-message">Loading categories...</p>}
          {!isLoading && categories.length === 0 && !error && <p className="empty-list-message">No categories found. Add one above!</p>}
          
          {categories.length > 0 && (
            <ul className="category-list">
              {categories.map(category => (
                <li key={category._id} className="category-list-item">
                  {editingCategory === category._id ? (
                    // Editing View
                    <div className="category-item-edit-view">
                      <input 
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="auth-input"
                        autoFocus
                        disabled={isLoading}
                      />
                      <button onClick={() => handleUpdateCategory(category._id)} className="auth-button save-button" disabled={isLoading || !editName.trim()}>Save</button>
                      <button onClick={handleCancelEdit} className="auth-button cancel-button" disabled={isLoading}>Cancel</button>
                    </div>
                  ) : (
                    // Default View
                    <div className="category-item-view">
                      <span className="category-item-name">{category.name}</span>
                      <div className="category-item-actions">
                        <button onClick={() => handleStartEdit(category)} className="auth-button edit-btn" disabled={isLoading}>Edit</button> 
                        <button onClick={() => handleDeleteCategory(category._id)} className="auth-button delete-button" disabled={isLoading}>Delete</button> 
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default Categories;