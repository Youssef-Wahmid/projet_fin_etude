import { useState, useEffect, useContext } from 'react';
import { Eye, EyeOff, Package, AlertCircle } from 'lucide-react';
import image from './stockimg.jpg';
// import axios from 'axios'; // Cette dépendance doit être installée
import { useNavigate } from "react-router";
import { AuthContext } from 'context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { AccessToken, setAccessToken, setcurrentUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (AccessToken) navigate('/');
  }, [AccessToken, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      general: ''
    };
    let isValid = true;

    // Email validation
    if (!formData.email) {
      newErrors.email = "L'adresse email est requise";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setErrors({ email: '', password: '', general: '' });
    setIsLoading(true);
    
    try {
      // Utilisation de fetch au lieu d'axios
      const response = await fetch('http://127.0.0.1:8000/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw { response: { data: data } };
      }
      
      localStorage.setItem("currentToken", JSON.stringify(data.access_token));
      setAccessToken(data.access_token);
      setcurrentUser(data.user);
    } catch (err) {
      if (err.response) {
        // Handle specific error messages from backend
        const errorMsg = err.response.data.message || "Une erreur s'est produite";
        
        // Check if the error is related to a specific field
        if (errorMsg.toLowerCase().includes('email')) {
          setErrors(prev => ({ ...prev, email: errorMsg }));
        } else if (errorMsg.toLowerCase().includes('mot de passe') || errorMsg.toLowerCase().includes('password')) {
          setErrors(prev => ({ ...prev, password: errorMsg }));
        } else {
          setErrors(prev => ({ ...prev, general: errorMsg }));
        }
      } else {
        setErrors(prev => ({ ...prev, general: "Erreur de connexion au serveur" }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Section image */}
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center" style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${image})`, 
      }}>
        <div className="flex flex-col justify-center items-center w-full h-full px-12 text-white">
          <div className="mb-6 p-4 bg-blue-600 rounded-full shadow-lg">
            <Package size={48} />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-center">StockManager Pro</h1>
          <p className="text-xl text-center">La solution complète pour gérer votre inventaire et optimiser votre chaîne d'approvisionnement</p>
        </div>
      </div>
      
      {/* Section formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            <div className="text-center mb-8"> 
              <div className="flex justify-center mb-4 lg:hidden">
                <div className="p-3 bg-blue-600 rounded-full shadow-md">
                  <Package size={36} className="text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900">Connexion</h2>
              <p className="mt-2 text-sm text-gray-600">
                Accédez à votre tableau de bord de gestion de stock
              </p>
            </div>
            
            <div className="space-y-6">
              {errors.general && (
                <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>{errors.general}</span>
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2.5 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="exemple@entreprise.com"
                  />
                  {errors.email && (
                    <div className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                      {errors.email}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2.5 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    {errors.password}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Se souvenir de moi
                  </label>
                </div>
                <div>
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Mot de passe oublié?
                  </a>
                </div>
              </div>

              <div>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connexion en cours...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </button>
              </div>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Vous n'avez pas de compte?{' '}
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    S'inscrire
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}