import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, ChevronDown } from 'lucide-react';
import axios from 'axios';

function EditUser({ user, isOpen, onClose, fetchData }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'magasinier',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    role: '',
    password: ''
  });
  
  const [message, setMessage] = useState({ text: '', type: '' });

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'magasinier',
        password: '' // On ne pré-remplit pas le mot de passe pour des raisons de sécurité
      });
      
      setErrors({
        name: '',
        email: '',
        role: '',
        password: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
      setErrors({
        name: '',
        email: '',
        role: '',
        password: ''
      });
      
      // Préparer les données à envoyer (ne pas envoyer le password s'il est vide)
      const dataToSend = { ...formData };
      if (!dataToSend.password) {
        delete dataToSend.password;
      }
      
      const response = await axios.put(
        `http://127.0.0.1:8000/api/v1/users/${user.id}`, 
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      setMessage({ 
        text: response.data.message || 'Utilisateur mis à jour avec succès!', 
        type: 'success' 
      });
      
      fetchData();
      
      setTimeout(() => {
        onClose();
        setMessage({ text: '', type: '' });
      }, 1500);
      
    } catch (err) {
      console.error('Erreur de mise à jour:', err);
      
      if (err.response?.data?.errors) {
        setErrors({
          name: err.response.data.errors.name?.[0] || '',
          email: err.response.data.errors.email?.[0] || '',
          role: err.response.data.errors.role?.[0] || '',
          password: err.response.data.errors.password?.[0] || '',
        });
      } else {
        setMessage({
          text: err.response?.data?.message || 'Une erreur est survenue lors de la mise à jour',
          type: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold">Modifier l'utilisateur</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>
        
        {message.text && (
          <div className={`p-3 mx-4 mt-2 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.name}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.email}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Rôle
            </label>
            <div className="relative">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md appearance-none ${
                  errors.role ? 'border-red-500' : 'border-gray-300'
                } bg-white pr-8`}
              >
                <option value="magasinier">Magasinier</option>
                <option value="admin">Administrateur</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown size={16} />
              </div>
            </div>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.role}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe (laisser vide pour ne pas changer)
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              minLength="8"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.password}
              </p>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                'Enregistrement...'
              ) : (
                <>
                  <Save size={16} className="mr-2" />
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

export default EditUser;