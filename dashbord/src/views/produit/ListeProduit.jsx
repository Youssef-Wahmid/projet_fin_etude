import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, X, Plus } from 'lucide-react';
import Breadcrumb from 'component/Breadcrumb';
import { Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import EditProduct from './EditProduct';

export default function ListeProduit() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const productsPerPage = 9;
  const [editingProduct, setEditingProduct] = useState(null);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/produits/');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setProducts(result.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => 
    product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categorie.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDelete = async (productId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/produits/${productId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setProducts(products.filter(product => product.id !== productId));
          setAlert({
            show: true,
            message: data.message || 'Produit supprimé avec succès',
            type: 'success'
          });
        } else {
          setAlert({
            show: true,
            message: data.message || 'Erreur lors de la suppression',
            type: 'error'
          });
        }
      } catch (err) {
        setAlert({
          show: true,
          message: 'Erreur réseau lors de la suppression',
          type: 'error'
        });
      }
      
      setTimeout(() => {
        setAlert({ show: false, message: '', type: '' });
      }, 5000);
    }
  };

  const handleSaveProduct = (updatedProduct) => {
    setProducts(products.map(p => 
      p.id === updatedProduct.id ? { 
        ...updatedProduct,
        // On s'assure que toutes les propriétés nécessaires sont présentes
        stock: updatedProduct.stock || p.stock,
        categorie: updatedProduct.categorie || p.categorie
      } : p
    ));
    setEditingProduct(null);
    setAlert({
      show: true,
      message: 'Produit mis à jour avec succès',
      type: 'success'
    });
  };

  const closeAlert = () => {
    setAlert({ show: false, message: '', type: '' });
  };

  const getStockStatus = (stock) => {
    if (!stock || typeof stock.quantite_disponible === 'undefined') {
      return {
        label: 'Inconnu',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
      };
    }

    if (stock.quantite_disponible === 0) {
      return {
        label: 'Rupture de stock',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
      };
    } else if (stock.quantite_disponible > 0 && stock.quantite_disponible <= stock.niveau_critique) {
      return {
        label: 'Stock critique',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
      };
    } else {
      return {
        label: 'Disponible',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
      };
    }
  };

  const formatPrix = (prix) => {
    if (!prix) return "0.00 MAD";
    
    const prixNumber = typeof prix === 'string' 
      ? parseFloat(prix.replace(/,/g, '')) 
      : parseFloat(prix);
    
    if (!isNaN(prixNumber)) {
      return new Intl.NumberFormat('fr-MA', { 
        style: 'currency', 
        currency: 'MAD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      }).format(prixNumber);
    }
    
    return "0.00 MAD";
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const handleCardClick = (productId, e) => {
    if (e.target.closest('.product-actions')) {
      return;
    }
    navigate(`/details-produit/${productId}`);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Error!</strong>
      <span className="block sm:inline"> {error}</span>
    </div>
  );

  return (
    <>
      <Breadcrumb title="Gérer vos Produits">
        <Typography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
          Accueil
        </Typography>
        <Typography variant="subtitle2" color="primary" className="link-breadcrumb">
          Produits
        </Typography>
      </Breadcrumb>
      
      {alert.show && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          <div className={`flex items-center p-4 rounded-lg shadow-lg ${
            alert.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 
            'bg-red-100 text-red-800 border-l-4 border-red-500'
          }`}>
            <div className="flex-grow">{alert.message}</div>
            <button 
              onClick={closeAlert}
              className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Produits</h1>
          
          <Link 
            to="/produits-create" 
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-300"
          >
            <Plus size={20} className="mr-2" />
            Créer produit
          </Link>
        </div>
        
        <div className="mb-6 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock);
            
            return (
              <div 
                key={product.id} 
                className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
                onClick={(e) => handleCardClick(product.id, e)}
              >
                <div className="h-48 overflow-hidden relative">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.nom} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">Image non disponible</span>
                    </div>
                  )}
                  
                  <div className={`absolute top-2 right-2 ${stockStatus.bgColor} ${stockStatus.textColor} text-xs font-medium px-3 py-1 rounded-full`}>
                    {stockStatus.label}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-gray-800">{product.nom}</h2>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Réf: {product.ref}</span>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {product.categorie || 'Non catégorisé'}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">{formatDate(product.date_ajoute)}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description || "Aucune description disponible"}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-900">{formatPrix(product.prix_unitaire)}</span>
                      <span className="text-xs text-gray-500 ml-2">Stock: {product.stock?.quantite_disponible || 0}</span>
                    </div>
                    <div className="flex space-x-2 product-actions">
                      <button 
                        className="p-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors duration-300"
                        title="Modifier"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProduct(product);
                        }}
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        className="p-2 bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors duration-300"
                        title="Supprimer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product.id);
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            {searchTerm ? "Aucun produit ne correspond à votre recherche." : "Aucun produit disponible pour le moment."}
          </div>
        )}
        
        {filteredProducts.length > 0 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center">
              <button 
                onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                disabled={currentPage === 1}
                className={`mx-1 px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                &laquo;
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`mx-1 px-3 py-1 rounded ${currentPage === number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {number}
                </button>
              ))}
              
              <button 
                onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                disabled={currentPage === totalPages}
                className={`mx-1 px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                &raquo;
              </button>
            </nav>
          </div>
        )}
      </div>
      {editingProduct && (
        <EditProduct 
          product={editingProduct} 
          onSave={handleSaveProduct}
          onCancel={() => setEditingProduct(null)}
        />
      )}
    </>
  );
}