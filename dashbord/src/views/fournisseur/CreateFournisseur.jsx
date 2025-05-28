import React, { useState } from 'react';
import axios from 'axios';

const CreateFournisseur = ({ fetchData }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({
      name: '',
      phone: '',
      email: '',
      address: ''
    });
    
    try {
      // Send data to the API endpoint using axios
      const response = await axios.post('http://127.0.0.1:8000/api/v1/fournisseurs', formData);
      console.log('Fournisseur data submitted:', response.data);
      setFormSubmitted(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          phone: '',
          email: '',
          address: ''
        });
        setFormSubmitted(false);
      }, 3000);
      
      if (fetchData) {
        fetchData();
      }

    } catch (err) {      
      // Use error messages from the backend
      if (err.response && err.response.data) {
        // Handle field-specific validation errors
        if (err.response.data.errors) {
          setFieldErrors({
            name: err.response.data.errors.name ? err.response.data.errors.name[0] : '',
            phone: err.response.data.errors.phone ? err.response.data.errors.phone[0] : '',
            email: err.response.data.errors.email ? err.response.data.errors.email[0] : '',
            address: err.response.data.errors.address ? err.response.data.errors.address[0] : ''
          });
        }
      } 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Créer un Nouveau Fournisseur</h2>
      
      {formSubmitted && (
        <div className="success-message">
          Fournisseur ajouté avec succès!
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nom</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={fieldErrors.name ? 'input-error' : ''}
            required
          />
          {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Téléphone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={fieldErrors.phone ? 'input-error' : ''}
            required
          />
          {fieldErrors.phone && <div className="field-error">{fieldErrors.phone}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={fieldErrors.email ? 'input-error' : ''}
            required
          />
          {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}  
        </div>
        
        <div className="form-group">
          <label htmlFor="address">Adresse</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={fieldErrors.address ? 'input-error' : ''}
            rows="3"
          />
          {fieldErrors.address && <div className="field-error">{fieldErrors.address}</div>}
        </div>
        
        <button 
          className='btn-submit' 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
};

export default CreateFournisseur;