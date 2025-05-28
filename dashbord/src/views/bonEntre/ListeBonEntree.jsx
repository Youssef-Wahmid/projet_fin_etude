import { useState, useEffect } from 'react';
import { Search, Download, FileText, ChevronLeft, ChevronRight, Check, X, Clock, AlertCircle, ChevronDown, Plus, Trash2, Edit, Eye } from 'lucide-react';
import { useNavigate } from 'react-router';
import EditBon from './EditBon'; 

export default function ListeBonEntree() {
  const [bonEntrees, setBonEntrees] = useState([]);
  const [filteredBonEntrees, setFilteredBonEntrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const entriesPerPage = 20;
  
  // États pour la modal de suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteItemInfo, setDeleteItemInfo] = useState(null);
  
  // État pour l'édition d'un bon d'entrée
  const [editingBon, setEditingBon] = useState(null);
  
  // État pour l'alerte après suppression ou mise à jour
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState(null); // 'success' ou 'error'

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/v1/bonentrees');
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }
        
        const result = await response.json();
        setBonEntrees(result.data);
        setFilteredBonEntrees(result.data);
        setTotalPages(Math.ceil(result.data.length / entriesPerPage));
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Effet pour faire disparaître l'alerte après 3 secondes
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
        setAlertType(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  useEffect(() => {
    const filtered = bonEntrees.filter(item => {
      const searchString = searchTerm.toLowerCase();
      return (
        item.fournisseur.nom.toLowerCase().includes(searchString) ||
        item.reference.toLowerCase().includes(searchString) ||
        item.dateEntree.includes(searchString) ||
        item.status.toLowerCase().includes(searchString)
      );
    });
    
    setFilteredBonEntrees(filtered);
    setTotalPages(Math.ceil(filtered.length / entriesPerPage));
    setCurrentPage(1);
  }, [searchTerm, bonEntrees]);

  const formatStatus = (status) => {
    switch (status) {
      case 'en_attente':
        return 'En attente';
      case 'partiel':
        return 'Partiel';
      case 'recu':
        return 'Reçu';
      case 'rejete':
        return 'Rejeté';
      default:
        return status;
    }
  };


  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };


  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };


  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return filteredBonEntrees.slice(startIndex, endIndex);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleStatusClick = (id, currentStatus) => {
    setEditingStatusId(id);
    setSelectedStatus(currentStatus);
  };

  const redirectToAjoutStock = () => {
    navigate('/ajout-stock');
  };

  const saveStatus = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/bonentrees/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: selectedStatus })
      });

      if (!response.ok) throw new Error('Échec de la mise à jour du statut');

      // Mettre à jour l'état local
      const updatedBonEntrees = bonEntrees.map(item => 
        item.id === id ? { ...item, status: selectedStatus } : item
      );
      
      setBonEntrees(updatedBonEntrees);
      setFilteredBonEntrees(updatedBonEntrees);
      setEditingStatusId(null);
      
      // Afficher une alerte de succès
      setAlertMessage("Statut mis à jour avec succès!");
      setAlertType("success");
      
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      setError("Erreur lors de la mise à jour du statut");
      setAlertMessage("Échec de la mise à jour du statut");
      setAlertType("error");
    }
  };

  // Fonction pour ouvrir la modal de confirmation de suppression
  const openDeleteModal = (id) => {
    const itemToDelete = bonEntrees.find(item => item.id === id);
    setDeleteItemId(id);
    setDeleteItemInfo(itemToDelete);
    setShowDeleteModal(true);
  };

  // Fonction pour fermer la modal de confirmation
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteItemId(null);
    setDeleteItemInfo(null);
  };

  // Fonction pour confirmer la suppression
  const confirmDelete = async () => {
    if (!deleteItemId) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/bonentrees/${deleteItemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Échec de la suppression du bon d\'entrée');

      // Récupérer le message de réponse du backend
      const responseData = await response.json();
      const successMessage = responseData.message || "Bon d'entrée supprimé avec succès";

      // Mettre à jour l'état local en supprimant l'élément
      const updatedBonEntrees = bonEntrees.filter(item => item.id !== deleteItemId);
      setBonEntrees(updatedBonEntrees);
      setFilteredBonEntrees(updatedBonEntrees);
      
      // Afficher l'alerte de succès avec le message du backend
      setAlertMessage(successMessage);
      setAlertType("success");
      
      // Fermer la modal
      closeDeleteModal();
      
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      const errorMessage = error.message || "Erreur lors de la suppression du bon d'entrée";
      setAlertMessage(errorMessage);
      setAlertType("error");
      closeDeleteModal();
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/produit-entree-details/${id}`);
  };

  // Fonction modifiée pour ouvrir le popup d'édition au lieu de naviguer
  const handleEdit = (id) => {
    // const bonToEdit = bonEntrees.find(item => item.id === id);
    setEditingBon(id);
  };
  
  // Fonction pour fermer le popup d'édition
  const closeEditPopup = () => {
    setEditingBon(null);
  };
  
  // Fonction pour gérer la sauvegarde d'un bon modifié
 // Modifiez la fonction handleSaveBon dans ListeBonEntree.jsx comme suit:

const handleSaveBon = (updatedBon) => {
  // Vérifier la structure de l'objet mis à jour
  console.log("Bon mis à jour reçu:", updatedBon);
  
  // S'assurer que la structure est cohérente avec le reste du composant
  // Si l'objet updatedBon n'a pas le même format que les autres éléments de bonEntrees
  const formattedBon = {
    ...updatedBon,
    // S'assurer que le fournisseur est correctement formaté
    fournisseur: updatedBon.fournisseur || {
      id: updatedBon.fournisseur_id,
      nom: fournisseursList.find(f => f.id == updatedBon.fournisseur_id)?.name || 'Fournisseur inconnu'
    }
  };
  
  // Mettre à jour l'état local avec le bon modifié et correctement formaté
  const updatedBonEntrees = bonEntrees.map(item => 
    item.id === updatedBon.id ? formattedBon : item
  );
  
  setBonEntrees(updatedBonEntrees);
  setFilteredBonEntrees(updatedBonEntrees);
  
  // Afficher une alerte de succès
  setAlertMessage("Bon d'entrée mis à jour avec succès!");
  setAlertType("success");
  
  // Fermer le popup
  closeEditPopup();
};
  
  const statusOptions = [
    { value: 'en_attente', label: 'En attente' },
    { value: 'partiel', label: 'Partiel' },
    { value: 'recu', label: 'Reçu' },
    { value: 'rejete', label: 'Rejeté' }
  ];

  const statusIcons = {
    recu: <Check className="h-4 w-4 mr-1" />,
    rejete: <X className="h-4 w-4 mr-1" />,
    partiel: <AlertCircle className="h-4 w-4 mr-1" />,
    en_attente: <Clock className="h-4 w-4 mr-1" />
  };

  const exportToPDF = () => {
    const dataToExport = filteredBonEntrees;
    
    const pdfWindow = window.open('', '_blank');
    pdfWindow.document.write(`
      <html>
        <head>
          <title>Liste des Bons d'Entrée</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2c3e50; text-align: center; margin-bottom: 10px; }
            .export-date { text-align: center; color: #666; margin-bottom: 20px; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .status-reçu { background-color: #28a745; color: white; }
            .status-rejete { background-color: #dc3545; color: white; }
            .status-partiel { background-color: #17a2b8; color: white; }
            .status-en_attente { background-color: #ffc107; color: #212529; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <h1>Liste des Bons d'Entrée</h1>
          <div class="export-date">Exporté le: ${new Date().toLocaleDateString('fr-FR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</div>
          <table>
            <thead>
              <tr>
                <th>Fournisseur</th>
                <th>Référence</th>
                <th>Date d'entrée</th>
                <th>Statut</th>
                <th class="text-right">Prix total</th>
              </tr>
            </thead>
            <tbody>
              ${dataToExport.map(item => `
                <tr>
                  <td>${item.fournisseur.nom}</td>
                  <td>${item.reference}</td>
                  <td>${formatDate(item.dateEntree)}</td>
                  <td class="status-${item.status.replace('é', 'e')}">${formatStatus(item.status)}</td>
                  <td class="text-right">${formatCurrency(item.prixTotal)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    pdfWindow.document.close();
    setTimeout(() => {
      pdfWindow.print();
    }, 250);
  };

  const exportToExcel = () => {
    const dataToExport = filteredBonEntrees;
    
    const headers = ['Fournisseur', 'Référence', 'Date entrée', 'Statut', 'Prix total'];
    const csvRows = dataToExport.map(item => [
      escapeCsvValue(item.fournisseur.nom),
      escapeCsvValue(item.reference),
      escapeCsvValue(formatDate(item.dateEntree)),
      escapeCsvValue(formatStatus(item.status)),
      escapeCsvValue(formatCurrency(item.prixTotal))
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bons_entree_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const escapeCsvValue = (value) => {
    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des données...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
        <div className="text-red-700 font-medium">Erreur:</div>
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Liste des Bons d'Entrée</h1>
      
      {/* Alerte de notification centrée */}
      {alertMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className={`flex items-center p-4 rounded-md shadow-lg max-w-md ${
            alertType === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 
            'bg-red-100 text-red-800 border-l-4 border-red-500'
          }`}>
            {alertType === 'success' ? (
              <Check className="h-5 w-5 mr-3" />
            ) : (
              <X className="h-5 w-5 mr-3" />
            )}
            <p className="text-sm font-medium">{alertMessage}</p>
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:justify-between mb-6 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-80 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={redirectToAjoutStock}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter au stock
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <FileText className="h-5 w-5 mr-2" />
            Export PDF
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Download className="h-5 w-5 mr-2" />
            Export Excel
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom du fournisseur
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Référence
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date d'entrée
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix total
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getPaginatedData().length > 0 ? (
              getPaginatedData().map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.fournisseur.nom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(item.dateEntree)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm relative">
                    {editingStatusId === item.id ? (
                      <div className="relative">
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          autoFocus
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-0 top-0 h-full flex items-center pr-2 pointer-events-none">
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() => saveStatus(item.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
                          >
                            Valider
                          </button>
                          <button
                            onClick={() => setEditingStatusId(null)}
                            className="px-3 py-1 bg-gray-200 rounded-md text-sm"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStatusClick(item.id, item.status)}
                        className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full 
                          ${item.status === 'recu' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                            item.status === 'rejete' ? 'bg-red-100 text-red-800 hover:bg-red-200' : 
                            item.status === 'partiel' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                            'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
                      >
                        {statusIcons[item.status] || null}
                        {formatStatus(item.status)}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.prixTotal)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(item.id)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition"
                        title="Voir les détails"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="text-amber-600 hover:text-amber-900 p-1 rounded-full hover:bg-amber-50 transition"
                        title="Modifier"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(item.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition"
                        title="Supprimer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  Aucun bon d'entrée trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Affichage de {filteredBonEntrees.length > 0 ? ((currentPage - 1) * entriesPerPage) + 1 : 0} à {Math.min(currentPage * entriesPerPage, filteredBonEntrees.length)} sur {filteredBonEntrees.length} bons d'entrée
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium 
              ${currentPage === 1 ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Précédent
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`inline-flex items-center px-3 py-1 border text-sm font-medium rounded-md 
                ${currentPage === i + 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              {i + 1}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium 
              ${currentPage === totalPages ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
          >
            Suivant
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Confirmer la suppression
            </h3>
            {deleteItemInfo && (
              <div className="mb-5 bg-gray-50 p-3 rounded-md text-sm">
                <p className="text-gray-500 mb-1">Vous êtes sur le point de supprimer :</p>
                <p className="font-medium">Bon d'entrée : {deleteItemInfo.reference}</p>
                <p>Fournisseur : {deleteItemInfo.fournisseur?.nom}</p>
                <p>Date : {formatDate(deleteItemInfo.dateEntree)}</p>
                <p>Prix total : {formatCurrency(deleteItemInfo.prixTotal)}</p>
              </div>
            )}
            <p className="text-gray-500 text-center mb-5">
              Cette action est définitive et ne peut pas être annulée.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Popup d'édition de bon d'entrée */}
      {editingBon && (
        <EditBon 
          bonEntry={editingBon} 
          onClose={closeEditPopup} 
          onSave={handleSaveBon} 
        />
      )}
    </div>
  );
}