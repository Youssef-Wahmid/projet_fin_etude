import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Plus, Save, Trash2, ShoppingCart, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { Snackbar, Alert, Slide } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router';

// Constants
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// Utility functions
const formatPrice = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const numericValue = parseFloat(value.toString().replace(/[^\d.-]/g, ''));
  return isNaN(numericValue) ? '' : numericValue.toFixed(2);
};

const formatNumberWithCommas = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const numericValue = parseFloat(value.toString().replace(/[^\d.-]/g, ''));
  if (isNaN(numericValue)) return '';
  
  return numericValue.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const generateReference = () => {
  const today = new Date().toISOString().slice(0, 10);
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BS-${today.replace(/-/g, '-')}-${randomSuffix}`;
};

const calculateSubtotal = (quantite, prix_vente) => {
  const quantity = parseFloat(quantite) || 0;
  const price = parseFloat(prix_vente?.toString().replace(/[^\d.-]/g, '')) || 0;
  return formatNumberWithCommas(quantity * price);
};

// Components
const ErrorAlert = ({ message }) => (
  <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
    <div className="flex items-center">
      <AlertTriangle className="text-red-500 mr-2" size={20} />
      <p className="text-red-700">{message}</p>
    </div>
  </div>
);

const FieldError = ({ error }) => (
  <p className="mt-1 text-sm text-red-600 flex items-center">
    <AlertCircle size={14} className="mr-1" />
    {error}
  </p>
);

const LoadingSpinner = ({ message = "Chargement des données..." }) => (
  <div className="flex flex-col justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
    <p className="text-gray-600">{message}</p>
  </div>
);

const ProductItem = ({ 
  product, 
  index, 
  productsList, 
  handleProduitChange, 
  removeProduit, 
  getFieldError, 
  getInputClass, 
  canRemove 
}) => (
  <div 
    className={`mb-6 p-4 rounded-lg ${
      getFieldError(`produits.${index}.produit_id`) || 
      getFieldError(`produits.${index}.quantite`) || 
      getFieldError(`produits.${index}.prix_vente`)
        ? 'bg-red-50 border border-red-200'
        : 'bg-gray-50 border border-gray-200'
    } transition-all hover:shadow-md`}
  >
    <div className="flex justify-between items-center mb-4">
      <h4 className="font-medium text-gray-700">Produit #{index + 1}</h4>
      {canRemove && (
        <button 
          type="button"
          onClick={() => removeProduit(index)}
          className="text-red-500 hover:text-red-700 flex items-center"
        >
          <Trash2 size={16} className="mr-1" />
          <span className="text-sm">Supprimer</span>
        </button>
      )}
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Produit *
        </label>
        <select
          name="produit_id"
          value={product.produit_id}
          onChange={(e) => handleProduitChange(index, e)}
          className={getInputClass(`produits.${index}.produit_id`)}
        >
          <option value="">-- Choisir un produit --</option>
          {productsList
            .filter(item => item.stock > 0)
            .map(item => (
              <option key={item.id} value={item.id}>
                {item.nom} ({item.ref}) - Stock: {item.stock}
              </option>
            ))}
        </select>
        {getFieldError(`produits.${index}.produit_id`) && (
          <FieldError error={getFieldError(`produits.${index}.produit_id`)} />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quantité *
        </label>
        <input
          type="number"
          name="quantite"
          min="1"
          value={product.quantite}
          onChange={(e) => handleProduitChange(index, e)}
          className={getInputClass(`produits.${index}.quantite`)}
        />
        {getFieldError(`produits.${index}.quantite`) && (
          <FieldError error={getFieldError(`produits.${index}.quantite`)} />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prix de vente (MAD) *
        </label>
        <input
          type="text"
          name="prix_vente"
          value={product.prix_vente}
          onChange={(e) => handleProduitChange(index, e)}
          className={getInputClass(`produits.${index}.prix_vente`)}
          placeholder="Prix automatique si produit sélectionné"
        />
        {getFieldError(`produits.${index}.prix_vente`) && (
          <FieldError error={getFieldError(`produits.${index}.prix_vente`)} />
        )}
      </div>
    </div>
    
    <div className="mt-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Notes
      </label>
      <textarea
        name="notes"
        value={product.notes || ''}
        onChange={(e) => handleProduitChange(index, e)}
        className={getInputClass(`produits.${index}.notes`)}
        placeholder="Ajouter des notes ou observations"
      ></textarea>
      {getFieldError(`produits.${index}.notes`) && (
        <FieldError error={getFieldError(`produits.${index}.notes`)} />
      )}
    </div>

    <div className="mt-3 text-right">
      <span className="text-sm font-medium text-gray-700">
        Sous-total: {calculateSubtotal(product.quantite, product.prix_vente)} MAD
      </span>
    </div>
  </div>
);

// Custom hooks
const useNotification = () => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const showAlert = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return {
    openSnackbar,
    snackbarMessage,
    snackbarSeverity,
    showAlert,
    handleCloseSnackbar
  };
};

const useFormValidation = () => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);

  const getFieldError = (fieldName) => {
    return fieldErrors[fieldName] || null;
  };

  const getInputClass = (fieldName) => {
    const baseClass = "w-full border p-2 rounded focus:outline-none";
    
    if (getFieldError(fieldName)) {
      return `${baseClass} border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200`;
    }
    
    return `${baseClass} border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`;
  };

  const clearFieldError = (name) => {
    if (fieldErrors[name]) {
      const newFieldErrors = {...fieldErrors};
      delete newFieldErrors[name];
      setFieldErrors(newFieldErrors);
    }
  };

  const validateForm = (formData) => {
    const errors = {};
    
    if (!formData.client_id) {
      errors.client_id = "Veuillez sélectionner un client";
    }
    
    formData.produits.forEach((produit, index) => {
      if (!produit.produit_id) {
        errors[`produits.${index}.produit_id`] = "Veuillez sélectionner un produit";
      }
      if (!produit.quantite || produit.quantite < 1) {
        errors[`produits.${index}.quantite`] = "La quantité doit être au moins 1";
      }
      if (!produit.prix_vente || parseFloat(produit.prix_vente.replace(/[^\d.-]/g, '')) <= 0) {
        errors[`produits.${index}.prix_vente`] = "Le prix de vente doit être supérieur à 0";
      }
    });
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const parseValidationErrors = (error) => {
    const validationErrors = error.response?.data?.errors;
    
    if (validationErrors) {
      const errorObj = {};
      
      Object.keys(validationErrors).forEach(field => {
        errorObj[field] = validationErrors[field][0];
      });
      
      setFieldErrors(errorObj);
      return true;
    }
    
    return false;
  };

  return {
    fieldErrors,
    error,
    setError,
    getFieldError,
    getInputClass,
    clearFieldError,
    validateForm,
    parseValidationErrors,
    setFieldErrors
  };
};

import { AuthContext } from 'context/AuthContext';
const CreateBonSortie = () => {
  
  const { 
    openSnackbar, 
    snackbarMessage, 
    snackbarSeverity, 
    showAlert, 
    handleCloseSnackbar 
  } = useNotification();
  
  const {
    fieldErrors,
    error,
    setError,
    getFieldError,
    getInputClass,
    clearFieldError,
    validateForm,
    parseValidationErrors,
    setFieldErrors
  } = useFormValidation();

  const [produitsList, setProduitsList] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
const { currentUser } = useContext(AuthContext);
  const [formData, setFormData] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    
    return {
      user_id: currentUser.id,
      client_id: '',
      reference: generateReference(),
      date_sortie: today,
      prix_total: '0.00',
      produits: [
        { produit_id: '', quantite: 1, prix_vente: '', notes: '' },
      ],
    };
  });

  const navigate = useNavigate();

  // Calculate total price whenever products change
  const totalPrice = useMemo(() => {
    return formData.produits.reduce((acc, item) => {
      const quantity = parseFloat(item.quantite) || 0;
      const price = parseFloat(item.prix_vente?.toString().replace(/[^\d.-]/g, '')) || 0;
      return acc + (quantity * price);
    }, 0).toFixed(2);
  }, [formData.produits]);

  // Update total price in form data when it changes
  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      prix_total: totalPrice
    }));
  }, [totalPrice]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setLoadingError(null);
      
      try {
        const [produitsResponse, clientsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/produits`),
          axios.get(`${API_BASE_URL}/clients`)
        ]);
        
        // Handle produits response - Filtrer uniquement les produits avec type_transaction 'vendu' ou 'both'
        if (produitsResponse.data && produitsResponse.data.data) {
          const filteredProducts = produitsResponse.data.data
            .filter(item => item.type_transaction === 'vendu' || item.type_transaction === 'both')
            .map(item => ({
              id: item.id,
              ref: item.ref,
              nom: item.nom,
              description: item.description,
              prix_unitaire: item.prix_unitaire,
              stock: item.stock.quantite_disponible,
              niveau_critique: item.stock.niveau_critique,
              type_transaction: item.type_transaction
            }));
          
          setProduitsList(filteredProducts);
        } else {
          throw new Error('Format de réponse inattendu pour les produits');
        }
        
        // Handle clients response - adaptation for the new format
        if (clientsResponse.data && clientsResponse.data.data) {
          // Extract the inner array from the data property
          const clientsData = Array.isArray(clientsResponse.data.data[0]) 
            ? clientsResponse.data.data[0] 
            : clientsResponse.data.data;
          
          setClientsList(clientsData.map(client => ({
            id: client.id,
            name: client.name,
            phone: client.phone,
            email: client.email
          })));
        } else {
          throw new Error('Format de réponse inattendu pour les clients');
        }
      } catch (err) {
        console.error('Error loading data:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Impossible de charger les données nécessaires';
        setLoadingError(`Erreur: ${errorMessage}. Veuillez réessayer.`);
        showAlert(`Erreur: ${errorMessage}`, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Helper to find product by ID
  const getProductById = (id) => {
    return produitsList.find(product => product.id.toString() === id.toString());
  };

  // Form handlers
  const handleProduitChange = (index, e) => {
    const { name, value } = e.target;
    const newProduits = [...formData.produits];
    
    if (name === 'produit_id' && value) {
      const product = getProductById(value);
      if (product) {
        newProduits[index] = {
          ...newProduits[index],
          [name]: value,
          prix_vente: product.prix_unitaire ? product.prix_unitaire.toString() : ''
        };
      } else {
        newProduits[index] = {
          ...newProduits[index],
          [name]: value
        };
      }
    } else if (name === 'prix_vente') {
      newProduits[index] = {
        ...newProduits[index],
        [name]: value
      };
    } else if (name === 'quantite') {
      newProduits[index] = {
        ...newProduits[index],
        [name]: value.toString()
      };
    } else {
      newProduits[index] = {
        ...newProduits[index],
        [name]: value
      };
    }
    
    setFormData({ ...formData, produits: newProduits });
    clearFieldError(`produits.${index}.${name}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    clearFieldError(name);
  };

  const addProduit = () => {
    setFormData({
      ...formData,
      produits: [...formData.produits, { produit_id: '', quantite: 1, prix_vente: '', notes: '' }],
    });
  };

  const removeProduit = (index) => {
    if (formData.produits.length > 1) {
      const newProduits = [...formData.produits];
      newProduits.splice(index, 1);
      setFormData({ ...formData, produits: newProduits });
      
      // Clean up any errors related to this product
      const newFieldErrors = {...fieldErrors};
      Object.keys(newFieldErrors).forEach(key => {
        if (key.startsWith(`produits.${index}.`)) {
          delete newFieldErrors[key];
        }
      });
      setFieldErrors(newFieldErrors);
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: 1,
      client_id: '',
      reference: generateReference(),
      date_sortie: new Date().toISOString().slice(0, 10),
      prix_total: '0.00',
      produits: [{ produit_id: '', quantite: 1, prix_vente: '', notes: '' }],
    });
    setFieldErrors({});
    setError(null);
    showAlert('Formulaire réinitialisé', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    // Form validation
    const isValid = validateForm(formData);
    if (!isValid) {
      setError('Veuillez corriger les erreurs dans le formulaire.');
      showAlert('Veuillez corriger les erreurs dans le formulaire.', 'error');
      setSubmitting(false);
      return;
    }
    
    // Prepare data for submission
    const normalisedProduits = formData.produits.map(produit => ({
      produit_id: produit.produit_id,
      quantite: produit.quantite.toString(),
      prix_vente: formatPrice(produit.prix_vente),
      notes: produit.notes || ''
    }));
    
    const dataToSubmit = {
      user_id: formData.user_id,
      client_id: formData.client_id,
      reference: formData.reference,
      date_sortie: formData.date_sortie,
      prix_total: totalPrice,
      produits: normalisedProduits
    };
    
    try {
      const response = await axios.post(`${API_BASE_URL}/bonsorties`, dataToSubmit);
      
      if (response.data) {
        resetForm();
        showAlert(response.data.message || 'Bon de sortie créé avec succès!', 'success');
        navigate('/bons-sortie-stock');
      } else {
        throw new Error('Format de réponse inattendu');
      }
    } catch (err) {
      console.error('Error creating bon:', err);
      
      const hasValidationErrors = parseValidationErrors(err);
      
      if (hasValidationErrors) {
        setError('Veuillez corriger les erreurs dans le formulaire.');
        showAlert('Veuillez corriger les erreurs dans le formulaire.', 'error');
      } else {
        const errorMsg = err.response?.data?.message || 'Une erreur est survenue lors de la création du bon de sortie';
        setError(errorMsg);
        showAlert(errorMsg, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Render loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Render error state
  if (loadingError) {
    return (
      <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-2" size={24} />
            <p className="text-red-700">{loadingError}</p>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <RefreshCw size={16} className="mr-2" />
          Réessayer
        </button>
      </div>
    );
  }

  // Main render
  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          <ShoppingCart className="inline-block mr-2" size={28} />
          Créer un Bon de Sortie
        </h2>
        <span className="text-gray-500 text-sm">Tous les champs avec * sont obligatoires</span>
      </div>

      {error && <ErrorAlert message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de sortie *
              </label>
              <input
                type="date"
                name="date_sortie"
                value={formData.date_sortie}
                onChange={handleChange}
                className={getInputClass('date_sortie')}
              />
              {getFieldError('date_sortie') && (
                <FieldError error={getFieldError('date_sortie')} />
              )}
            </div>
          </div>

          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client *
              </label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                className={getInputClass('client_id')}
              >
                <option value="">-- Choisir un client --</option>
                {clientsList.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.phone})
                  </option>
                ))}
              </select>
              {getFieldError('client_id') && (
                <FieldError error={getFieldError('client_id')} />
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 pb-2 border-b">
            Produits
          </h3>
          
          {formData.produits.map((produit, index) => (
            <ProductItem 
              key={index}
              product={produit}
              index={index}
              productsList={produitsList}
              handleProduitChange={handleProduitChange}
              removeProduit={removeProduit}
              getFieldError={getFieldError}
              getInputClass={getInputClass}
              canRemove={formData.produits.length > 1}
            />
          ))}

          {getFieldError('produits') && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <FieldError error={getFieldError('produits')} />
            </div>
          )}

          <button
            type="button"
            onClick={addProduit}
            className="flex items-center mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
          >
            <Plus size={16} className="mr-2" />
            Ajouter un produit
          </button>
          
          <div className="mt-8 flex justify-end">
            <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 w-full md:w-72">
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-medium">Total HT:</span>
                <span className="text-xl font-bold">{formatNumberWithCommas(totalPrice)} MAD</span>
              </div>
              <input 
                type="hidden"
                name="prix_total"
                value={formData.prix_total}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          {Object.keys(fieldErrors).length > 0 && (
            <div className="text-red-500 flex items-center">
              <AlertCircle size={16} className="mr-1" />
              <span>{Object.keys(fieldErrors).length} erreur(s) à corriger</span>
            </div>
          )}
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Réinitialiser
            </button>
            
            <button
              type="submit"
              disabled={submitting}
              className={`
                flex items-center px-6 py-3 rounded-lg font-medium
                ${submitting 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all'}
              `}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Traitement en cours...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Enregistrer le Bon de Sortie
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateBonSortie;