import React, { useState } from 'react';
import axios from 'axios';

const Create = ({ fetchData }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'magasinier', // Valeur par défaut
    password: '',
    password_confirmation: ''
  });
  
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
    password_confirmation: ''
  });
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
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
      email: '',
      role: '',
      password: '',
      password_confirmation: ''
    });
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/users', formData);
      console.log('Utilisateur créé:', response.data);
      setFormSubmitted(true);
      
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          role: 'magasinier',
          password: '',
          password_confirmation: ''
        });
        setFormSubmitted(false);
      }, 3000);
      
      if (fetchData) {
        fetchData();
      }

    } catch (err) {      
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          setFieldErrors({
            name: err.response.data.errors.name ? err.response.data.errors.name[0] : '',
            email: err.response.data.errors.email ? err.response.data.errors.email[0] : '',
            role: err.response.data.errors.role ? err.response.data.errors.role[0] : '',
            password: err.response.data.errors.password ? err.response.data.errors.password[0] : '',
            password_confirmation: err.response.data.errors.password_confirmation 
              ? err.response.data.errors.password_confirmation[0] 
              : ''
          });
        }
      } 
    } finally {
      setIsLoading(false);
    }
  };

   return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Créer un Nouvel Utilisateur</h2>
      
      {formSubmitted && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Utilisateur créé avec succès!
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Champ Nom */}
        <div className="form-group">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}
            
          />
          {fieldErrors.name && <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>}
        </div>
        
        {/* Champ Email */}
        <div className="form-group">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
            
          />
          {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
        </div>
        
        {/* Champ Rôle - Style amélioré */}
        <div className="form-group">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
          <div className="relative">
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md appearance-none ${fieldErrors.role ? 'border-red-500' : 'border-gray-300'} bg-white pr-8`}
              
            >
              <option value="magasinier">Magasinier</option>
              <option value="admin">Administrateur</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
          {fieldErrors.role && <p className="mt-1 text-sm text-red-600">{fieldErrors.role}</p>}
        </div>
        
        {/* Champ Mot de passe */}
        <div className="form-group">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe (min. 8 caractères)</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'}`}
            
            minLength="8"
          />
          {fieldErrors.password && <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>}
        </div>
        
        {/* Champ Confirmation mot de passe */}
        <div className="form-group">
          <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
          <input
            type="password"
            id="password_confirmation"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${fieldErrors.password_confirmation ? 'border-red-500' : 'border-gray-300'}`}
            
            minLength="8"
          />
          {fieldErrors.password_confirmation && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.password_confirmation}</p>
          )}
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Création en cours...' : 'Créer l\'utilisateur'}
        </button>
      </form>
    </div>
  );
};

export default Create;