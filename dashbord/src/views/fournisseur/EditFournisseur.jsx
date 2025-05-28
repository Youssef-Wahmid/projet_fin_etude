import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import axios from 'axios';

function EditFournisseur({ fournisseur, isOpen, onClose, fetchData }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  // Initialize form data when fournisseur prop changes
  useEffect(() => {
    if (fournisseur) {
      setFormData({
        name: fournisseur.name || '',
        phone: fournisseur.phone || '',
        email: fournisseur.email || '',
        address: fournisseur.address || ''
      });
      // Clear errors when opening modal with new fournisseur data
      setErrors({
        name: '',
        phone: '',
        email: '',
        address: ''
      });
    }
  }, [fournisseur]);

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
        name: '',
        phone: '',
        email: '',
        address: ''
      });
      
      const response = await axios.put(
        `http://127.0.0.1:8000/api/v1/fournisseurs/${fournisseur.id}`, 
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      // Display backend response message
      setMessage({ 
        text: response.data.message || 'Fournisseur updated successfully!', 
        type: 'success' 
      });
      
      // Refresh the fournisseur list
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
          name: err.response.data.errors.name || '',
          email: err.response.data.errors.email || '',
          phone: err.response.data.errors.phone || '',
          address: err.response.data.errors.address || ''
        });
      } else {
        // Handle general error
        setMessage({
          text: err.response?.data?.message || 'An error occurred while updating the fournisseur',
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
          <p>Modifier les infos de fournisseur <b>{fournisseur.name}</b></p>
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
            <label htmlFor="name">Nom</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'input-error' : ''}`}
            />
            {errors.name && (
              <div className="field-error">
                <AlertCircle size={14} />
                <span>{errors.name}</span>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Téléphone</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`form-input ${errors.phone ? 'input-error' : ''}`}
            />
            {errors.phone && (
              <div className="field-error">
                <AlertCircle size={14} />
                <span>{errors.phone}</span>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && (
              <div className="field-error">
                <AlertCircle size={14} />
                <span>{errors.email}</span>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Adresse</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`form-input ${errors.address ? 'input-error' : ''}`}
            />
            {errors.address && (
              <div className="field-error">
                <AlertCircle size={14} />
                <span>{errors.address}</span>
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

export default EditFournisseur;