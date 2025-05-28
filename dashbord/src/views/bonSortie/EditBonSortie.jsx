import { useState, useEffect, useMemo } from 'react';
import { X, Save, Calendar, ShoppingCart, AlertCircle, CheckCircle2, RefreshCw, Trash2, Plus } from 'lucide-react';

export default function EditBonSortie({ bonSortie: bonId, onClose, onSave }) {
  // State management
  const [produitsList, setProduitsList] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  // Default form data structure
  const defaultFormData = {
    user_id: 1,
    client_id: '',
    reference: '',
    date_sortie: '',
    prix_total: '0.00',
    status: 'en_attente',
    produits: [
      { produit_id: '', quantite: 1, prix_vente: '', notes: '' },
    ],
  };
  
  const [formData, setFormData] = useState(defaultFormData);

  // API endpoints
  const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

  // Calculate total price
  const total = useMemo(() => {
    return formData.produits.reduce((acc, item) => {
      const prix = parseFloat(item.prix_vente || 0);
      const quantite = parseInt(item.quantite || 0);
      return acc + (prix * quantite);
    }, 0).toFixed(2);
  }, [formData.produits]);

  // Format price function
  const formatPrice = (price) => {
    if (!price) return '0.00';
    return parseFloat(price).toFixed(2);
  };

  // Validation function
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate client
    if (!formData.client_id) {
      errors.client_id = "Veuillez sélectionner un client";
      isValid = false;
    }

    // Validate products
    formData.produits.forEach((produit, index) => {
      if (!produit.produit_id) {
        errors[`produits.${index}.produit_id`] = "Veuillez sélectionner un produit";
        isValid = false;
      }
    
      if (!produit.prix_vente || isNaN(parseFloat(produit.prix_vente))) {
        errors[`produits.${index}.prix_vente`] = "Veuillez entrer un prix valide";
        isValid = false;
      }
    
      if (!produit.quantite || produit.quantite < 1) {
        errors[`produits.${index}.quantite`] = "La quantité doit être au moins 1";
        isValid = false;
      }
    });    

    setFieldErrors(errors);
    return isValid;
  };

  // Fetch data on component mount
  useEffect(() => {
    if (bonId) {
      fetchInitialData(bonId);
    } else {
      setLoadingError('Identifiant du bon de sortie manquant.');
      setLoading(false);
    }
  }, [bonId]);

  // Fetch initial data function
  const fetchInitialData = async (bonId) => {
    setLoading(true);
    setLoadingError(null);
    
    try {
      // Fetch produits
      const produitsResponse = await fetch(`${API_BASE_URL}/produits`);
      if (!produitsResponse.ok) throw new Error(`Erreur produits: ${produitsResponse.status}`);
      const produitsData = await produitsResponse.json();
      if (produitsData && produitsData.data) {
        console.log(produitsData.data);
        
        // setProduitsList(produitsData.data.map(p => ({
        //   ...p,
        //   stock: p.stock.quantite_disponible // Adapte le stock au nouveau format
        // })));
        setProduitsList(produitsData.data);


      } else {
        throw new Error('Format de réponse produits invalide');
      }
      
      // Fetch clients
      const clientsResponse = await fetch(`${API_BASE_URL}/clients`); 
      if (!clientsResponse.ok) throw new Error(`Erreur clients: ${clientsResponse.status}`);
      const clientsData = await clientsResponse.json();
      if (clientsData && clientsData.data) {
        // Prend le premier tableau dans data (nouveau format imbriqué)
        setClientsList(clientsData.data[0] || []);
      } else {
        throw new Error('Format de réponse clients invalide');
      }
      
      // Fetch bon sortie details
      const bonResponse = await fetch(`${API_BASE_URL}/bonsorties/${bonId}`);
      if (!bonResponse.ok) throw new Error(`Erreur bon de sortie: ${bonResponse.status}`);
      const bonData = await bonResponse.json();
      
      if (bonData && bonData.data) {
        const bonDetails = bonData.data;
        
        // Transform API data to match our form structure
        const transformedFormData = {
          user_id: bonDetails.user ? bonDetails.user.id : 1,
          client_id: bonDetails.client ? bonDetails.client.id.toString() : '',
          reference: bonDetails.reference || '',
          date_sortie: bonDetails.dateSortie || '',
          prix_total: bonDetails.prixTotal || '0.00',
          status: bonDetails.status || 'en_attente',
          produits: Array.isArray(bonDetails.produits) 
            ? bonDetails.produits.map(p => ({
                produit_id: p.id ? p.id.toString() : '',
                quantite: p.quantite || 1,
                prix_vente: p.prixVente || '0.00',
                notes: p.notes || ''
              }))
            : [{ produit_id: '', quantite: 1, prix_vente: '', notes: '' }]
        };
        
        setFormData(transformedFormData);
      } else {
        throw new Error('Format de réponse bon de sortie invalide');
      }
    } catch (err) {
      console.error('Error in fetchInitialData:', err);
      setLoadingError(`${err.message || 'Erreur lors du chargement des données'}. Veuillez réessayer.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent changing reference or status
    if (name === 'reference' || name === 'status') {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when field is modified
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle product input changes
  const handleProductChange = (index, field, value) => {
    const updatedProduits = [...formData.produits];
    updatedProduits[index] = {
      ...updatedProduits[index],
      [field]: value
    };
    
    // If product is changed, update price automatically
    if (field === 'produit_id' && value) {
      const selectedProduct = produitsList.find(p => p.id.toString() === value.toString());
      if (selectedProduct) {
        let prixUnitaire = selectedProduct.prix_unitaire;
        if (typeof prixUnitaire === 'string') {
          prixUnitaire = prixUnitaire.replace(/,/g, '');
        }
        
        const prix = parseFloat(prixUnitaire);
        if (!isNaN(prix)) {
          updatedProduits[index].prix_vente = prix.toString();
        }
      }
    }
    
    setFormData(prev => ({
      ...prev,
      produits: updatedProduits
    }));

    // Clear error when field is modified
    const errorKey = `produits.${index}.${field}`;
    if (fieldErrors[errorKey]) {
      setFieldErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // Add product row
  const addProductRow = () => {
    setFormData(prev => ({
      ...prev,
      produits: [
        ...prev.produits,
        { produit_id: '', quantite: 1, prix_vente: '', notes: '' }
      ]
    }));
  };

  // Remove product row
  const removeProductRow = (index) => {
    if (formData.produits.length === 1) {
      console.log('Warning: Vous devez avoir au moins un produit.');
      return;
    }
    
    const updatedProduits = formData.produits.filter((_, i) => i !== index);
    
    setFormData(prev => ({
      ...prev,
      produits: updatedProduits
    }));

    // Remove errors for deleted product
    setFieldErrors(prev => {
      const newErrors = {...prev};
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`produits.${index}`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    setSuccessData(null);
    
    // First validate the form
    if (!validateForm()) {
      setSubmitting(false);
      return;
    }
    
    // Ensure bonId exists
    if (!bonId) {
      setError('ID du bon de sortie manquant.');
      setSubmitting(false);
      return;
    }
    
    const normalisedProduits = formData.produits.map(produit => ({
      ...produit,
      prix_vente: formatPrice(produit.prix_vente),
      quantite: produit.quantite.toString()
    }));
    
    const dataToSubmit = {
      user_id: formData.user_id,
      client_id: formData.client_id,
      reference: formData.reference,
      date_sortie: formData.date_sortie,
      prix_total: total,
      status: formData.status,
      produits: normalisedProduits.map(produit => ({
        produit_id: produit.produit_id,
        quantite: produit.quantite,
        prix_vente: produit.prix_vente,
        notes: produit.notes || ''
      }))
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/bonsorties/${bonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (errorData.errors) {
          setFieldErrors(errorData.errors);
          throw new Error('Veuillez corriger les erreurs dans le formulaire.');
        } else {
          throw new Error(errorData.message || `Erreur serveur: ${response.status}`);
        }
      }
      
      const responseData = await response.json();
      
      if (responseData) {
        setSuccessData(responseData);
        setSuccess(true);
        
        const updatedBon = responseData.data || responseData;
        const formattedBon = {
          id: updatedBon.id || bonId,
          reference: updatedBon.reference || formData.reference,
          dateSortie: updatedBon.dateSortie || formData.date_sortie,
          prixTotal: updatedBon.prixTotal || total,
          status: updatedBon.status || formData.status,
          client: {
            id: updatedBon.client?.id || formData.client_id,
            name: updatedBon.client?.name || 
                clientsList.find(c => c.id == formData.client_id)?.name || 
                'Client inconnu'
          },
          produits: updatedBon.produits || formData.produits.map(p => ({
            id: p.produit_id,
            quantite: p.quantite,
            prixVente: p.prix_vente,
            notes: p.notes
          }))
        };
        
        if (onSave) {
          onSave(formattedBon);
        }
        
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        throw new Error('Format de réponse inattendu');
      }
    } catch (err) {
      console.error('Error updating bon:', err);
      setError(err.message || 'Une erreur est survenue lors de la mise à jour du bon de sortie');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto py-8">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-full overflow-auto animate-fadeIn">
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <ShoppingCart className="mr-2" /> Modifier le bon de sortie : {formData.reference}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            aria-label="Fermer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p>Chargement des données...</p>
            </div>
          ) : loadingError ? (
            <div className="py-8 text-center">
              <div className="flex items-center justify-center text-red-500 mb-4">
                <AlertCircle size={24} className="mr-2" />
                <span className="font-medium">{loadingError}</span>
              </div>
              <button
                onClick={() => bonId ? fetchInitialData(bonId) : null}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center mx-auto"
              >
                <RefreshCw size={16} className="mr-2" />
                Réessayer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="hidden" name="reference" value={formData.reference} />
                <input type="hidden" name="status" value={formData.status} />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de sortie
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="date_sortie"
                      value={formData.date_sortie}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md pr-10"
                    />
                    <Calendar className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${
                      fieldErrors.client_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">-- Sélectionner un client --</option>
                    {clientsList.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.client_id && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.client_id}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total
                  </label>
                  <input
                    type="text"
                    value={`${total} DH`}
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                </div>
              </div>
              
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Produits <span className="text-red-500">*</span></h2>
                
                {formData.produits.map((produit, index) => (
                  <div 
                    key={index} 
                    className="grid grid-cols-12 gap-3 mb-4 p-3 border border-gray-200 rounded-md bg-gray-50"
                  >
                    <div className="col-span-4">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Produit <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={produit.produit_id}
                        onChange={(e) => handleProductChange(index, 'produit_id', e.target.value)}
                        className={`w-full p-2 border rounded-md ${
                          fieldErrors[`produits.${index}.produit_id`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">-- Sélectionner un produit --</option>
                        {produitsList
                          // .filter(p => p.stock.quantite_disponible > 0) // Utilise le nouveau format de stock
                          // .map(p => (
                          //   <option key={p.id} value={p.id}>
                          //     {p.nmee} (Stock: {p.stock.quantite_disponible})
                          //   </option>
                          // ))
                          .filter(p => p.stock.quantite_disponible > 0)
.map(p => (
  <option key={p.id} value={p.id}>
    {p.nom} (Stock: {p.stock.quantite_disponible})
  </option>
))
                          }
                      </select>
                      {fieldErrors[`produits.${index}.produit_id`] && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors[`produits.${index}.produit_id`]}</p>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Quantité <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={produit.quantite}
                        onChange={(e) => handleProductChange(index, 'quantite', parseInt(e.target.value) || 1)}
                        className={`w-full p-2 border rounded-md ${
                          fieldErrors[`produits.${index}.quantite`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {fieldErrors[`produits.${index}.quantite`] && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors[`produits.${index}.quantite`]}</p>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Prix Unitaire (DH) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={produit.prix_vente}
                        onChange={(e) => handleProductChange(index, 'prix_vente', e.target.value)}
                        className={`w-full p-2 border rounded-md ${
                          fieldErrors[`produits.${index}.prix_vente`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {fieldErrors[`produits.${index}.prix_vente`] && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors[`produits.${index}.prix_vente`]}</p>
                      )}
                    </div>
                    
                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={produit.notes || ''}
                        onChange={(e) => handleProductChange(index, 'notes', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Optionnel"
                      />
                    </div>
                    
                    <div className="col-span-1 flex items-end justify-center">
                      <button
                        type="button"
                        onClick={() => removeProductRow(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addProductRow}
                  className="mt-2 flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Plus size={18} className="mr-1" />
                  Ajouter un produit
                </button>
              </div>
              
              <div className="pt-4 border-t border-gray-200 flex justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md flex items-center font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  <X size={18} className="mr-2" />
                  Annuler
                </button>
                
                <div className="flex items-center">
                  {error && (
                    <div className="mr-4 p-2 text-red-500 flex items-start">
                      <AlertCircle className="mr-1 mt-0.5 flex-shrink-0" size={16} />
                      <span>{error}</span>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`
                      px-4 py-2 rounded-md flex items-center font-medium
                      ${submitting 
                        ? 'bg-gray-400 text-gray-100 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'}
                    `}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        <Save size={18} className="mr-2" />
                        Mettre à jour
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {success && successData && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
                  <div className="flex items-center mb-2">
                    <CheckCircle2 className="mr-2" />
                    <h3 className="font-medium">Bon de sortie mis à jour avec succès!</h3>
                  </div>
                  <p>
                    Le bon de sortie <span className="font-medium">{successData.data?.reference || formData.reference}</span> a été mis à jour.
                  </p>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}