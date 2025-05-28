import React, { useState } from 'react';
import axios from 'axios';

const CreateCategory = ({ fetchData }) => {
  const [formData, setFormData] = useState({
    nom_categorie: ''
  });
  
  const [fieldErrors, setFieldErrors] = useState({
    nom_categorie: ''
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
      nom_categorie: ''
    });
    
    try {
      // Send data to the API endpoint using axios
      const response = await axios.post('http://127.0.0.1:8000/api/v1/categories', formData);
      console.log('Category data submitted:', response.data);
      setFormSubmitted(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          nom_categorie: ''
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
            nom_categorie: err.response.data.errors.nom_categorie ? err.response.data.errors.nom_categorie[0] : ''
          });
        }
      } 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Créer une Nouvelle Catégorie</h2>
      
      {formSubmitted && (
        <div className="success-message">
          Catégorie ajoutée avec succès!
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nom_categorie">Nom de la catégorie</label>
          <input
            type="text"
            id="nom_categorie"
            name="nom_categorie"
            value={formData.nom_categorie}
            onChange={handleChange}
            className={fieldErrors.nom_categorie ? 'input-error' : ''}
            required
          />
          {fieldErrors.nom_categorie && <div className="field-error">{fieldErrors.nom_categorie}</div>}
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

export default CreateCategory;