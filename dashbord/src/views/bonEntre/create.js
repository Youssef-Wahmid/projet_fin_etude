import React, { useState, useEffect, useMemo, useContext } from 'react';
import axios from 'axios';
import { Plus, Save, Trash2, ShoppingCart, AlertTriangle, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Snackbar, Alert, Slide } from '@mui/material';
import { useNavigate } from 'react-router';
import { AuthContext } from 'context/AuthContext';

const CreateBon = () => {
  // State management
  const [produitsList, setProduitsList] = useState([]);
  const [fournisseursList, setFournisseursList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [formData, setFormData] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const reference = `BE-${today.replace(/-/g, '-')}-${randomSuffix}`;
    
    return {
      user_id: currentUser.id,
      fournisseur_id: '',
      reference: reference,
      date: today,
      prix_total: '0.00',
      produits: [
        { produit_id: '', quantite: 1, prix_achat: '', notes: '' },
      ],
    };
  });

  // API endpoints
  const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

  // Filter products for purchase (achete or both)
  const filteredProduitsList = useMemo(() => {
    return produitsList.filter(produit => 
      produit.type_transaction === 'achete' || produit.type_transaction === 'both'
    );
  }, [produitsList]);

  // Show snackbar alert
  const showAlert = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  // Close snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch initial data function
  const fetchInitialData = async () => {
    setLoading(true);
    setLoadingError(null);
    
    try {
      const [produitsResponse, fournisseursResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/produits`),
        axios.get(`${API_BASE_URL}/fournisseurs`)
      ]);
      
      if (produitsResponse.data && produitsResponse.data.data) {
        setProduitsList(produitsResponse.data.data);
      } else {
        console.error('Unexpected produits response format:', produitsResponse);
        setLoadingError('Format de réponse inattendu pour les produits.');
        showAlert('Format de réponse inattendu pour les produits.', 'error');
      }
      
      if (fournisseursResponse.data && fournisseursResponse.data.data) {
        setFournisseursList(fournisseursResponse.data.data);
      } else {
        console.error('Unexpected fournisseurs response format:', fournisseursResponse);
        setLoadingError('Format de réponse inattendu pour les fournisseurs.');
        showAlert('Format de réponse inattendu pour les fournisseurs.', 'error');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      const errorMessage = err.response?.data?.message || 'Impossible de charger les données nécessaires.';
      setLoadingError(`Erreur: ${errorMessage}. Veuillez réessayer.`);
      showAlert(`Erreur: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.fournisseur_id) {
      errors.fournisseur_id = "Veuillez sélectionner un fournisseur";
    }
    
    formData.produits.forEach((produit, index) => {
      if (!produit.produit_id) {
        errors[`produits.${index}.produit_id`] = "Veuillez sélectionner un produit";
      }
      if (!produit.quantite || produit.quantite < 1) {
        errors[`produits.${index}.quantite`] = "La quantité doit être au moins 1";
      }
      if (!produit.prix_achat || parseFloat(produit.prix_achat.replace(/[^\d.-]/g, '')) <= 0) {
        errors[`produits.${index}.prix_achat`] = "Le prix doit être supérieur à 0";
      }
    });
    
    return errors;
  };
  
  const formatPrice = (value) => {
    if (value === '' || value === null || value === undefined) return '';
    const numericValue = parseFloat(value.toString().replace(/[^\d.-]/g, ''));
    if (isNaN(numericValue)) return '';
    return numericValue.toFixed(2);
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
  
  const total = useMemo(() => {
    return formData.produits.reduce((acc, item) => {
      const quantity = parseFloat(item.quantite) || 0;
      const price = parseFloat(item.prix_achat?.toString().replace(/[^\d.-]/g, '')) || 0;
      return acc + (quantity * price);
    }, 0).toFixed(2);
  }, [formData.produits]);

  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      prix_total: total
    }));
  }, [total]);

  const getProductById = (id) => {
    return produitsList.find(product => product.id.toString() === id.toString());
  };

  const handleProduitChange = (index, e) => {
    const { name, value } = e.target;
    const newProduits = [...formData.produits];
    
    if (name === 'produit_id' && value) {
      const product = getProductById(value);
      if (product) {
        newProduits[index] = {
          ...newProduits[index],
          [name]: value,
          prix_achat: product.prix_unitaire ? product.prix_unitaire.toString() : ''
        };
      } else {
        newProduits[index] = {
          ...newProduits[index],
          [name]: value
        };
      }
    } else if (name === 'prix_achat') {
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
    
    if (fieldErrors[`produits.${index}.${name}`]) {
      const newFieldErrors = {...fieldErrors};
      delete newFieldErrors[`produits.${index}.${name}`];
      setFieldErrors(newFieldErrors);
    }
  };

  const addProduit = () => {
    setFormData({
      ...formData,
      produits: [...formData.produits, { produit_id: '', quantite: 1, prix_achat: '', notes: '' }],
    });
  };

  const removeProduit = (index) => {
    if (formData.produits.length > 1) {
      const newProduits = [...formData.produits];
      newProduits.splice(index, 1);
      setFormData({ ...formData, produits: newProduits });
      
      const newFieldErrors = {...fieldErrors};
      Object.keys(newFieldErrors).forEach(key => {
        if (key.startsWith(`produits.${index}.`)) {
          delete newFieldErrors[key];
        }
      });
      setFieldErrors(newFieldErrors);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (fieldErrors[name]) {
      const newFieldErrors = {...fieldErrors};
      delete newFieldErrors[name];
      setFieldErrors(newFieldErrors);
    }
  };

  const parseValidationErrors = (error) => {
    const validationErrors = error.response?.data?.errors;
    
    if (validationErrors) {
      const errorObj = {};
      
      Object.keys(validationErrors).forEach(field => {
        errorObj[field] = validationErrors[field][0];
      });
      
      return errorObj;
    }
    
    return null;
  };

  const resetForm = () => {
    const today = new Date().toISOString().slice(0, 10);
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const newReference = `BE-${today.replace(/-/g, '-')}-${randomSuffix}`;
    
    setFormData({
      user_id: 1,
      fournisseur_id: '',
      reference: newReference,
      date: today,
      prix_total: '0.00',
      produits: [{ produit_id: '', quantite: 1, prix_achat: '', notes: '' }],
    });
    setFieldErrors({});
    setError(null);
    showAlert('Formulaire réinitialisé', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    setSuccess(false);
    setSuccessData(null);
    
    const normalisedProduits = formData.produits.map(produit => ({
      ...produit,
      prix_achat: formatPrice(produit.prix_achat),
      quantite: produit.quantite.toString()
    }));
    
    const dataToSubmit = {
      user_id: formData.user_id,
      fournisseur_id: formData.fournisseur_id,
      reference: formData.reference,
      date: formData.date,
      prix_total: total,
      produits: normalisedProduits.map(produit => ({
        produit_id: produit.produit_id,
        quantite: produit.quantite,
        prix_achat: produit.prix_achat,
        notes: produit.notes || ''
      }))
    };
    
    try {
      const response = await axios.post(`${API_BASE_URL}/bonentrees`, dataToSubmit);
      
      if (response.data) {
        setSuccessData(response.data);
        setSuccess(true);
        resetForm();
        showAlert(response.data.message || 'Bon d\'entrée créé avec succès!', 'success');
      } else {
        throw new Error('Format de réponse inattendu');
      }
      navigate('/bons-entree-stock') ;
    } catch (err) {
      console.error('Error creating bon:', err);
      
      const validationErrors = parseValidationErrors(err);
      
      if (validationErrors) {
        setFieldErrors(validationErrors);
        setError('Veuillez corriger les erreurs dans le formulaire.');
        showAlert('Veuillez corriger les erreurs dans le formulaire.', 'error');
      } else {
        const errorMsg = err.response?.data?.message || 'Une erreur est survenue lors de la création du bon d\'entrée';
        setError(errorMsg);
        showAlert(errorMsg, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

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

  const calculateSubtotal = (quantite, prix_achat) => {
    const quantity = parseFloat(quantite) || 0;
    const price = parseFloat(prix_achat?.toString().replace(/[^\d.-]/g, '')) || 0;
    return formatNumberWithCommas(quantity * price);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Chargement des données...</p>
      </div>
    );
  }

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
          onClick={fetchInitialData}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <RefreshCw size={16} className="mr-2" />
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Snackbar Alert */}
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
          Créer un Bon d'Entrée
        </h2>
        <span className="text-gray-500 text-sm">Tous les champs avec * sont obligatoires</span>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-2" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <div className="flex flex-col">
            <div className="flex items-center mb-2">
              <CheckCircle2 className="text-green-500 mr-2" size={20} />
              {successData && (
              <div className="pl-7 text-sm text-green-700">
                
                {successData.message && (
                  <p className="text-green-700 font-medium">{successData.message}</p>
                )}
              </div>
            )}
            </div>
            
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div>
            {/* Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={getInputClass('date')}
              />
              {getFieldError('date') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {getFieldError('date')}
                </p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Fournisseur */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fournisseur *
              </label>
              <select
                name="fournisseur_id"
                value={formData.fournisseur_id}
                onChange={handleChange}
                className={getInputClass('fournisseur_id')}
              >
                <option value="">-- Choisir un fournisseur --</option>
                {fournisseursList.map(fournisseur => (
                  <option key={fournisseur.id} value={fournisseur.id}>
                    {fournisseur.name}
                  </option>
                ))}
              </select>
              {getFieldError('fournisseur_id') && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {getFieldError('fournisseur_id')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Produits */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 pb-2 border-b">
            Produits
          </h3>
          
          {formData.produits.map((produit, index) => (
            <div 
              key={index} 
              className={`mb-6 p-4 rounded-lg ${
                Object.keys(fieldErrors).some(key => key.startsWith(`produits.${index}.`))
                ? 'bg-red-50 border border-red-200'
                : 'bg-gray-50 border border-gray-200'
              } transition-all hover:shadow-md`}
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-700">Produit #{index + 1}</h4>
                {formData.produits.length > 1 && (
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
                    value={produit.produit_id}
                    onChange={(e) => handleProduitChange(index, e)}
                    className={getInputClass(`produits.${index}.produit_id`)}
                  >
                    <option value="">-- Choisir un produit --</option>
                    {filteredProduitsList.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.nom} ({item.ref})
                      </option>
                    ))}
                  </select>
                  {getFieldError(`produits.${index}.produit_id`) && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {getFieldError(`produits.${index}.produit_id`)}
                    </p>
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
                    value={produit.quantite}
                    onChange={(e) => handleProduitChange(index, e)}
                    className={getInputClass(`produits.${index}.quantite`)}
                  />
                  {getFieldError(`produits.${index}.quantite`) && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {getFieldError(`produits.${index}.quantite`)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix d'achat (MAD) *
                  </label>
                  <input
                    type="text"
                    name="prix_achat"
                    value={produit.prix_achat}
                    onChange={(e) => handleProduitChange(index, e)}
                    className={getInputClass(`produits.${index}.prix_achat`)}
                    placeholder="Prix automatique si produit sélectionné"
                  />
                  {getFieldError(`produits.${index}.prix_achat`) && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {getFieldError(`produits.${index}.prix_achat`)}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={produit.notes || ''}
                  onChange={(e) => handleProduitChange(index, e)}
                  className={getInputClass(`produits.${index}.notes`)}
                  placeholder="Ajouter des notes ou observations"
                ></textarea>
                {getFieldError(`produits.${index}.notes`) && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {getFieldError(`produits.${index}.notes`)}
                  </p>
                )}
              </div>

              {/* Show subtotal for this product */}
              <div className="mt-3 text-right">
                <span className="text-sm font-medium text-gray-700">
                  Sous-total: {calculateSubtotal(produit.quantite, produit.prix_achat)} MAD
                </span>
              </div>
            </div>
          ))}

          {/* Error for produits array */}
          {getFieldError('produits') && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {getFieldError('produits')}
              </p>
            </div>
          )}

          {/* Bouton ajouter produit */}
          <button
            type="button"
            onClick={addProduit}
            className="flex items-center mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
          >
            <Plus size={16} className="mr-2" />
            Ajouter un produit
          </button>
          
          {/* Total */}
          <div className="mt-8 flex justify-end">
            <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 w-full md:w-72">
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-medium">Total HT:</span>
                <span className="text-xl font-bold">{formatNumberWithCommas(total)} MAD</span>
              </div>
              <input 
                type="hidden"
                name="prix_total"
                value={formData.prix_total}
              />
            </div>
          </div>
        </div>

        {/* Bouton submit et reset */}
        <div className="mt-8 flex justify-between">
          {/* Display number of errors if any */}
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
                  Enregistrer le Bon d'Entrée
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateBon;