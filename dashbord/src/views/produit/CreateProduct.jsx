import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';

const CreateProduct = ({ fetchData }) => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    categorie_id: '',
    ref: '',
    nom: '',
    description: '',
    prix_unitaire: '',
    date_ajoute: new Date().toISOString().split('T')[0],
    image: null,
    type_transaction: 'both' // Nouveau champ ajouté
  });
  
  const [fieldErrors, setFieldErrors] = useState({
    categorie_id: '',
    ref: '',
    nom: '',
    description: '',
    prix_unitaire: '',
    date_ajoute: '',
    image: '',
    type_transaction: '' // Nouveau champ ajouté
  });
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/v1/categories');
        setCategories(response.data.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      // Handle file upload for image
      const file = files[0];
      setFormData({
        ...formData,
        [name]: file
      });
      
      // Create preview URL for the image
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else {
      // Handle other form fields
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
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
    console.log(formData);
    
    // Reset all field errors
    setFieldErrors({
      categorie_id: '',
      ref: '',
      nom: '',
      description: '',
      prix_unitaire: '',
      date_ajoute: '',
      image: '',
      type_transaction: ''
    });
    
    try {
      // Create FormData object for multipart/form-data (needed for file upload)
      const productFormData = new FormData();
      
      // Append all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          productFormData.append(key, formData[key]);
        }
      });
      
      // Send data to the API endpoint using axios
      const response = await axios.post(
        'http://127.0.0.1:8000/api/v1/produits', 
        productFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('Product data submitted:', response.data);
      setFormSubmitted(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          categorie_id: '',
          ref: '',
          nom: '',
          description: '',
          prix_unitaire: '',
          date_ajoute: new Date().toISOString().split('T')[0],
          image: null,
          type_transaction: 'both'
        });
        setImagePreview(null);
        setFormSubmitted(false);
      }, 3000);
      
      // Refresh data in parent component if needed
      if (fetchData) {
        fetchData();
      }

      navigate('/produits');
    } catch (err) {      
      // Handle errors from the backend
      if (err.response && err.response.data) {
        // Handle field-specific validation errors
        if (err.response.data.errors) {
          const backendErrors = err.response.data.errors;
          const newFieldErrors = { ...fieldErrors };
          
          // Map backend errors to our fieldErrors state
          Object.keys(backendErrors).forEach(key => {
            if (backendErrors[key] && backendErrors[key][0]) {
              newFieldErrors[key] = backendErrors[key][0];
            }
          });
          
          setFieldErrors(newFieldErrors);
        }
      } else {
        console.error('Error submitting form:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to format price input with proper decimal places
  const formatPrice = (e) => {
    let value = e.target.value;
    
    // Allow only numbers and decimal point
    if (!/^\d*\.?\d*$/.test(value)) {
      return;
    }
    
    setFormData({
      ...formData,
      prix_unitaire: value
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Créer un Nouveau Produit</h2>
        
        {formSubmitted && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center">
            Produit ajouté avec succès!
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Selection */}
            <div className="form-group">
              <label htmlFor="categorie_id" className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                id="categorie_id"
                name="categorie_id"
                value={formData.categorie_id}
                onChange={handleChange}
                className={`w-full rounded-md border ${fieldErrors.categorie_id ? 'border-red-500' : 'border-gray-300'} 
                          shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                required
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.nom_categorie}
                  </option>
                ))}
              </select>
              {fieldErrors.categorie_id && (
                <div className="text-red-500 text-sm mt-1">{fieldErrors.categorie_id}</div>
              )}
            </div>

            {/* Reference */}
            <div className="form-group">
              <label htmlFor="ref" className="block text-sm font-medium text-gray-700 mb-1">
                Référence
              </label>
              <input
                type="text"
                id="ref"
                name="ref"
                value={formData.ref}
                onChange={handleChange}
                className={`w-full rounded-md border ${fieldErrors.ref ? 'border-red-500' : 'border-gray-300'} 
                          shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                required
              />
              {fieldErrors.ref && (
                <div className="text-red-500 text-sm mt-1">{fieldErrors.ref}</div>
              )}
            </div>
          </div>

          {/* Type de transaction */}
          <div className="form-group">
            <label htmlFor="type_transaction" className="block text-sm font-medium text-gray-700 mb-1">
              Type de transaction
            </label>
            <select
              id="type_transaction"
              name="type_transaction"
              value={formData.type_transaction}
              onChange={handleChange}
              className={`w-full rounded-md border ${fieldErrors.type_transaction ? 'border-red-500' : 'border-gray-300'} 
                        shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              required
            >
              <option value="vendu">Vendu</option>
              <option value="achete">Acheté</option>
              <option value="both">Les deux</option>
            </select>
            {fieldErrors.type_transaction && (
              <div className="text-red-500 text-sm mt-1">{fieldErrors.type_transaction}</div>
            )}
          </div>

          {/* Product Name */}
          <div className="form-group">
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du produit
            </label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={`w-full rounded-md border ${fieldErrors.nom ? 'border-red-500' : 'border-gray-300'} 
                        shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              required
            />
            {fieldErrors.nom && (
              <div className="text-red-500 text-sm mt-1">{fieldErrors.nom}</div>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={`w-full rounded-md border ${fieldErrors.description ? 'border-red-500' : 'border-gray-300'} 
                        shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              required
            ></textarea>
            {fieldErrors.description && (
              <div className="text-red-500 text-sm mt-1">{fieldErrors.description}</div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unit Price */}
            <div className="form-group">
              <label htmlFor="prix_unitaire" className="block text-sm font-medium text-gray-700 mb-1">
                Prix unitaire
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="prix_unitaire"
                  name="prix_unitaire"
                  value={formData.prix_unitaire}
                  onChange={formatPrice}
                  className={`w-full rounded-md border ${fieldErrors.prix_unitaire ? 'border-red-500' : 'border-gray-300'} 
                            shadow-sm py-2 pl-8 pr-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="0.00 MAD"
                  required
                />
              </div>
              {fieldErrors.prix_unitaire && (
                <div className="text-red-500 text-sm mt-1">{fieldErrors.prix_unitaire}</div>
              )}
            </div>

            {/* Date Added */}
            <div className="form-group">
              <label htmlFor="date_ajoute" className="block text-sm font-medium text-gray-700 mb-1">
                Date d'ajout
              </label>
              <input
                type="date"
                id="date_ajoute"
                name="date_ajoute"
                value={formData.date_ajoute}
                onChange={handleChange}
                className={`w-full rounded-md border ${fieldErrors.date_ajoute ? 'border-red-500' : 'border-gray-300'} 
                          shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                required
              />
              {fieldErrors.date_ajoute && (
                <div className="text-red-500 text-sm mt-1">{fieldErrors.date_ajoute}</div>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Image du produit
            </label>
            <div className="mt-1 flex flex-col items-center space-y-4">
              <div className="w-full flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="mb-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="mx-auto h-32 w-auto object-cover rounded"
                      />
                    </div>
                  ) : (
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="image"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Importer un fichier</span>
                      <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">ou glisser-déposer</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG jusqu'à 5MB</p>
                </div>
              </div>
              {fieldErrors.image && (
                <div className="text-red-500 text-sm">{fieldErrors.image}</div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-end ">
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white 
                        ${isLoading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'} 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enregistrement...
                </>
              ) : 'Enregistrer le produit'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateProduct;