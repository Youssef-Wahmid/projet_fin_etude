import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { 
  Typography, TextField, Button, Select, MenuItem, 
  InputLabel, FormControl, CircularProgress, Alert, Snackbar 
} from '@mui/material';

const EditProduct = ({ product, onSave, onCancel }) => {
  // Initialisation correcte avec les données du produit
  const [formData, setFormData] = useState({
    nom: product.nom || '',
    ref: product.ref || '',
    description: product.description || '',
    categorie_id: product.categorie_id || '',
    prix_unitaire: product.prix_unitaire ? product.prix_unitaire.toString().replace(/,/g, '') : '',
    date_ajoute: product.date_ajoute || new Date().toISOString().split('T')[0],
    stock: product.stock || { quantite_disponible: 0, niveau_critique: 0 } // Ajout du stock
  });

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product.image_url || null);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  const [keepCurrentImage, setKeepCurrentImage] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/categories/');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data.data || []);
      } catch (err) {
        setErrorCategories(err.message);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setFormData(prev => ({ ...prev, prix_unitaire: value }));
    if (errors.prix_unitaire) setErrors(prev => ({ ...prev, prix_unitaire: undefined }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setKeepCurrentImage(false);
    }
    if (errors.image) setErrors(prev => ({ ...prev, image: undefined }));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setKeepCurrentImage(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Ajout de toutes les données du formulaire
      Object.keys(formData).forEach(key => {
        if (key !== 'stock') { // On exclut le stock qui est une donnée interne
          formDataToSend.append(key, formData[key]);
        }
      });

      // Gestion de l'image
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (!keepCurrentImage) {
        formDataToSend.append('image', '');
      }

      formDataToSend.append('_method', 'PUT');

      const response = await fetch(`http://127.0.0.1:8000/api/v1/produits/${product.id}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formDataToSend
      });

      const data = await response.json();
      
      if (response.ok) {
        // On s'assure que les données mises à jour incluent le stock et la catégorie
        const updatedProduct = {
          ...data.data,
          stock: product.stock, // On conserve les données de stock existantes
          categorie: categories.find(cat => cat.id === formData.categorie_id)?.nom_categorie || product.categorie
        };
        onSave(updatedProduct);
      } else {
        if (data.errors) {
          setErrors(data.errors);
          setSnackbar({
            open: true,
            message: 'Veuillez corriger les erreurs dans le formulaire',
            severity: 'error'
          });
        } else {
          throw new Error(data.message || 'Erreur lors de la mise à jour');
        }
      }
    } catch (err) {
      console.error('Update error:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Erreur réseau. Veuillez réessayer.',
        severity: 'error'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h5" component="h2" className="font-bold text-gray-800">
              Modifier le produit
            </Typography>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <TextField
                label="Nom du produit"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.nom}
                helperText={errors.nom?.[0]}
              />
              
              <TextField
                label="Référence"
                name="ref"
                value={formData.ref}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.ref}
                helperText={errors.ref?.[0]}
              />
            </div>
            
            <div className="mb-4">
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description?.[0]}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormControl fullWidth error={!!errors.categorie_id}>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  name="categorie_id"
                  value={formData.categorie_id}
                  onChange={handleChange}
                  label="Catégorie"
                  required
                >
                  {loadingCategories ? (
                    <MenuItem disabled><CircularProgress size={20} /></MenuItem>
                  ) : errorCategories ? (
                    <MenuItem disabled>Erreur de chargement</MenuItem>
                  ) : (
                    categories.map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.nom_categorie}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {errors.categorie_id && (
                  <Typography variant="caption" color="error">
                    {errors.categorie_id[0]}
                  </Typography>
                )}
              </FormControl>
              
              <TextField
                label="Prix unitaire (MAD)"
                name="prix_unitaire"
                value={formData.prix_unitaire}
                onChange={handlePriceChange}
                fullWidth
                required
                error={!!errors.prix_unitaire}
                helperText={errors.prix_unitaire?.[0]}
              />
            </div>

            <div className="mb-4">
              <TextField
                label="Date d'ajout"
                name="date_ajoute"
                type="date"
                value={formData.date_ajoute}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                error={!!errors.date_ajoute}
                helperText={errors.date_ajoute?.[0]}
              />
            </div>
            
            <div className="mb-6">
              <div className="mb-2">
                <Typography variant="body2">Image du produit:</Typography>
                {imagePreview ? (
                  <div className="flex items-center mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="h-20 object-contain border rounded"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="ml-2 text-red-500 hover:text-red-700"
                      aria-label="Supprimer l'image"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : product.image_url && keepCurrentImage ? (
                  <div className="flex items-center mt-2">
                    <img 
                      src={product.image_url} 
                      alt="Current" 
                      className="h-20 object-contain border rounded"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="ml-2 text-red-500 hover:text-red-700"
                      aria-label="Supprimer l'image"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Aucune image sélectionnée
                  </Typography>
                )}
              </div>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {errors.image && (
                <Typography variant="caption" color="error">
                  {errors.image[0]}
                </Typography>
              )}
              <Typography variant="caption" color="textSecondary">
                L'image est facultative. Formats acceptés: JPG, PNG, GIF. Taille max: 2MB.
              </Typography>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outlined"
                color="secondary"
                onClick={onCancel}
                startIcon={<X size={18} />}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<Save size={18} />}
              >
                Enregistrer
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default EditProduct;