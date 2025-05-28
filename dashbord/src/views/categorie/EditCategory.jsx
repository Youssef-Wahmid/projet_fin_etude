

import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import axios from 'axios';

function EditCategory({ category, isOpen, onClose, fetchData }) {
  const [formData, setFormData] = useState({
    nom_categorie: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    nom_categorie: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  // Initialize form data when category prop changes
  useEffect(() => {
    if (category) {
      setFormData({
        nom_categorie: category.nom_categorie || ''
      });
      // Clear errors when opening modal with new category data
      setErrors({
        nom_categorie: ''
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Reset all errors
      setErrors({
        nom_categorie: ''
      });
      
      const response = await axios.put(
        `http://127.0.0.1:8000/api/v1/categories/${category.id}`, 
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      // Display backend response message
      setMessage({ 
        text: response.data.message || 'Catégorie mise à jour avec succès!', 
        type: 'success' 
      });
      
      // Refresh the category list
      fetchData();
      
      // Close the modal after a brief delay
      setTimeout(() => {
        onClose();
        setMessage({ text: '', type: '' });
      }, 1500);
      
    } catch (err) {
      console.error('Update error:', err);
      
      // Handle validation errors from backend
      if (err.response && err.response.data && err.response.data.errors) {
        // Extract validation errors
        setErrors({
          nom_categorie: err.response.data.errors.nom_categorie || '',
        });
      } else {
        // Handle general error
        setMessage({
          text: err.response?.data?.message || 'Une erreur est survenue lors de la mise à jour de la catégorie',
          type: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal">
        <div className="edit-modal-header">
          <p>Modifier la catégorie <b>{category.nom_categorie}</b></p>
          <button className="close-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        {message.text && (
          <div className={`edit-message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label htmlFor="nom_categorie">Nom de la catégorie</label>
            <input
              type="text"
              id="nom_categorie"
              name="nom_categorie"
              value={formData.nom_categorie}
              onChange={handleChange}
              className={`form-input ${errors.nom_categorie ? 'input-error' : ''}`}
            />
            {errors.nom_categorie && (
              <div className="field-error">
                <AlertCircle size={14} />
                <span>{errors.nom_categorie}</span>
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="save-button"
              disabled={loading}
            >
              {loading ? 'Mise à jour...' : (
                <>
                  <Save size={16} />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCategory;