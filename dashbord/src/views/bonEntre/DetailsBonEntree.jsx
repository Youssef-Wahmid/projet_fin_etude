import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

const DetailsBonEntree = () => {
  // Styles pour l'impression
  useEffect(() => {
    // Ajouter une feuille de style pour l'impression
    const style = document.createElement('style');
    style.id = 'print-styles';
    style.innerHTML = `
      @media print {
        @page {
          size: A4;
          margin: 10mm;
        }
        
        body * {
          visibility: hidden;
        }
        
        .max-w-6xl, .max-w-6xl * {
          visibility: visible;
        }
        
        .max-w-6xl {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 0 !important;
          margin: 0 !important;
        }
        
        /* Réduire l'espacement général */
        .p-6 {
          padding: 0.5rem !important;
        }
        
        .mb-6, .mb-8 {
          margin-bottom: 0.5rem !important;
        }
        
        /* Ajuster les tailles de texte */
        h1 {
          font-size: 18pt !important;
          margin-bottom: 0.5rem !important;
        }
        
        h2 {
          font-size: 14pt !important;
          margin-bottom: 0.25rem !important;
          padding-bottom: 0.25rem !important;
        }
        
        /* Réduire l'espacement des tables */
        table {
          font-size: 9pt !important;
        }
        
        th, td {
          padding: 4px !important;
        }
        
        /* Cacher les éléments inutiles pour l'impression */
        button,
        .shadow-md,
        .rounded-lg,
        .bg-gray-50 {
          box-shadow: none !important;
          background-color: white !important;
        }
        
        button {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Nettoyer lors du démontage du composant
    return () => {
      const printStyle = document.getElementById('print-styles');
      if (printStyle) {
        printStyle.remove();
      }
    };
  }, []);

  const [bonEntree, setBonEntree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBonEntree = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/api/v1/bonentrees/${id}`);
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const result = await response.json();
        setBonEntree(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBonEntree();
  }, [id]);



  // Fonction pour formater les montants en devise
  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0
    }).format(montant);
  };

  // Fonction pour déterminer la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'validé':
        return 'bg-green-100 text-green-800';
      case 'rejeté':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour traduire le statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'en_attente':
        return 'En attente';
      case 'validé':
        return 'Validé';
      case 'rejeté':
        return 'Rejeté';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4 rounded">
        <p className="font-bold">Erreur</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!bonEntree) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 m-4 rounded">
        <p>Aucune donnée disponible</p>
      </div>
    );
  }

  const { reference, dateEntree, status, prixTotal, user, fournisseur, produits } = bonEntree;
  
  // Fonction pour gérer l'impression
  const handlePrint = () => {
    // Optimiser pour l'impression d'une page
    const originalTitle = document.title;
    document.title = `Bon d'Entrée - ${reference}`;
    
    // Déclencher l'impression
    window.print();
    
    // Restaurer le titre original
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Détails du Bon d'Entrée</h1>
          <div className="flex space-x-3">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={handlePrint}
            >
              Imprimer
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition" onClick={() => navigate(-1)}>
              Retour
            </button>
          </div>
        </div>

        {/* Carte d'informations principales */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Informations Générales</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Référence:</span>
                  <span className="font-medium">{reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date d'entrée:</span>
                  <span className="font-medium">{new Date(dateEntree).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {getStatusLabel(status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prix Total:</span>
                  <span className="font-bold text-blue-600">{formatMontant(prixTotal)}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Fournisseur</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nom:</span>
                  <span className="font-medium">{fournisseur.nom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{fournisseur.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Téléphone:</span>
                  <span className="font-medium">{fournisseur.telephone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Créé par</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Utilisateur:</span>
                <span className="font-medium">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des produits */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Liste des produits</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référence
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix unitaire
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sous-total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {produits.map((produit) => (
                  <tr key={produit.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {produit.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{produit.nom}</div>
                      <div className="text-sm text-gray-500">{produit.description}</div>
                      <div className="text-xs text-gray-400 italic">{produit.notes}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {produit.quantite}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatMontant(produit.prixAchat)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatMontant(produit.sousTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan="4" className="px-6 py-4 text-right font-medium">
                    Total:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-blue-600">
                    {formatMontant(prixTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      
      </div>
    </div>
  );
};

export default DetailsBonEntree;