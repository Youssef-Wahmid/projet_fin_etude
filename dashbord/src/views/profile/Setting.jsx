import { useContext, useState } from 'react';
import { Eye, EyeOff, Lock, Check, X, Save, Loader2 } from 'lucide-react';
import axios from 'axios';
import { BASE_URL, getHeaders } from 'config/config';
import { AuthContext } from 'context/AuthContext';

export default function Setting() {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirmation_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old_password: false,
    new_password: false,
    confirmation_password: false
  });
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState(null); // 'success' ou 'error'
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { AccessToken } = useContext(AuthContext);

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.old_password) {
      newErrors.old_password = "L'ancien mot de passe est obligatoire";
    }
    
    if (!formData.new_password) {
      newErrors.new_password = "Le nouveau mot de passe est obligatoire";
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = "Le mot de passe doit contenir au moins 6 caractères";
    }
    
    if (!formData.confirmation_password) {
      newErrors.confirmation_password = "La confirmation est obligatoire";
    } else if (formData.new_password !== formData.confirmation_password) {
      newErrors.confirmation_password = "Les mots de passe ne correspondent pas";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await axios.patch(`${BASE_URL}/v1/profile/updatepw`, formData, getHeaders(AccessToken));
      
      setMessage(response.data.message || "Mot de passe modifié avec succès");
      setStatus("success");
      
      // Reset form on success
      setFormData({
        old_password: '',
        new_password: '',
        confirmation_password: ''
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         "Une erreur est survenue";
      
      setMessage(errorMessage);
      setStatus("error");
      
      // Handle specific field errors from API
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const inputClasses = (field) => 
    `w-full pl-3 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[field] ? 'border-red-300' : 'border-gray-300'
    }`;
  
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <div className="mx-auto bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
          <Lock className="text-blue-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Modifier votre mot de passe</h2>
        <p className="text-gray-600 mt-1">Assurez-vous de choisir un mot de passe fort</p>
      </div>
      
      {message && (
        <div className={`mb-4 p-3 rounded-md flex items-center ${
          status === 'success' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {status === 'success' ? (
            <Check className="mr-2 flex-shrink-0" size={18} />
          ) : (
            <X className="mr-2 flex-shrink-0" size={18} />
          )}
          <span>{message}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="old_password" className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe actuel
          </label>
          <div className="relative">
            <input
              id="old_password"
              name="old_password"
              type={showPasswords.old_password ? "text" : "password"}
              value={formData.old_password}
              onChange={handleChange}
              className={inputClasses('old_password')}
              placeholder="Entrez votre mot de passe actuel"
            />
            <button
              type="button"
              onClick={() => toggleShowPassword('old_password')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPasswords.old_password ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.old_password && (
            <p className="mt-1 text-sm text-red-600">{errors.old_password}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input
              id="new_password"
              name="new_password"
              type={showPasswords.new_password ? "text" : "password"}
              value={formData.new_password}
              onChange={handleChange}
              className={inputClasses('new_password')}
              placeholder="Entrez votre nouveau mot de passe"
            />
            <button
              type="button"
              onClick={() => toggleShowPassword('new_password')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPasswords.new_password ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.new_password ? (
            <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>
          ) : formData.new_password && (
            <div className="mt-2 text-sm text-gray-600">
              <div className={`flex items-center ${
                formData.new_password.length >= 6 ? 'text-green-600' : 'text-gray-500'
              }`}>
                {formData.new_password.length >= 6 ? 
                  <Check size={16} className="mr-1" /> : 
                  <div className="w-4 h-4 mr-1" />
                }
                Au moins 6 caractères ({formData.new_password.length}/6)
              </div>
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmation_password" className="block text-sm font-medium text-gray-700 mb-1">
            Confirmer le nouveau mot de passe
          </label>
          <div className="relative">
            <input
              id="confirmation_password"
              name="confirmation_password"
              type={showPasswords.confirmation_password ? "text" : "password"}
              value={formData.confirmation_password}
              onChange={handleChange}
              className={inputClasses('confirmation_password')}
              placeholder="Confirmez votre nouveau mot de passe"
            />
            <button
              type="button"
              onClick={() => toggleShowPassword('confirmation_password')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPasswords.confirmation_password ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmation_password && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmation_password}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex items-center justify-center px-4 py-2 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
            isLoading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              En cours...
            </>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              Enregistrer
            </>
          )}
        </button>
      </form>
    </div>
  );
}