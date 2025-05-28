import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, User, Mail, ShieldCheck, Clock, Package, PackageCheck, Users } from 'lucide-react';
import { useParams } from 'react-router';
import axios from 'axios'; // Import axios

const DetailsUser = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // Track active tab: 'all', 'entree', or 'sortie'

  const { id } = useParams();
  console.log(id);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Using axios instead of fetch
        const response = await axios.get(`http://127.0.0.1:8000/api/v1/users/${id}`);
        // Axios automatically throws errors for non-2xx status codes
        setUserData(response.data.data);
        setLoading(false);
      } catch (err) {
        // Axios error handling
        setError(err.response?.data?.message || err.message || 'Échec de récupération des données utilisateur');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]); // Added id dependency to the dependency array

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="p-6 bg-red-100 text-red-800 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Erreur</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!userData) {
    return <div>Aucune donnée utilisateur disponible</div>;
  }

  // Fournisseurs et clients uniques
  const uniqueSuppliers = new Set(userData.bonentrees?.map(entry => entry.fournisseur_id) || []);
  const uniqueClients = new Set(userData.bonsorties?.map(entry => entry.client_id) || []);

  const totalEntries = userData.bonentrees?.length || 0;
  const totalSorties = userData.bonsorties?.length || 0;

  // Préparation des données pour le graphique circulaire
  const pieData = [
    { name: 'Bon d\'entrée', value: totalEntries, color: '#10B981' },
    { name: 'Bon de sortie', value: totalSorties, color: '#3B82F6' }
  ];

  // Préparation des données pour le graphique à barres
  const barData = [
    { name: 'Fournisseurs', value: uniqueSuppliers.size, color: '#F59E0B' },
    { name: 'Clients', value: uniqueClients.size, color: '#6366F1' }
  ];

  // Formatage de la date pour l'affichage
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcul des jours d'activité
  const daysSinceCreation = () => {
    const creationDate = new Date(userData.dateCreation);
    const today = new Date();
    const diffTime = Math.abs(today - creationDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête avec les informations utilisateur */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="md:flex">
            <div className="md:flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-white bg-opacity-30 flex items-center justify-center text-4xl font-bold">
                {userData.name.charAt(0)}
              </div>
            </div>
            <div className="p-8 w-full">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">{userData.name}</h1>
                  <div className="flex items-center text-gray-600 mb-1">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{userData.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-1">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    <span className="capitalize">{userData.role}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Membre depuis {formatDate(userData.dateCreation)}</span>
                  </div>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <p className="text-blue-800 font-medium">ID: #{userData.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Bon d'entrée</h3>
                <p className="text-2xl font-semibold text-gray-800">{totalEntries}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <PackageCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Bon de sortie</h3>
                <p className="text-2xl font-semibold text-gray-800">{totalSorties}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Partenaires commerciaux</h3>
                <p className="text-2xl font-semibold text-gray-800">{uniqueSuppliers.size + uniqueClients.size}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-amber-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Jours d'activité</h3>
                <p className="text-2xl font-semibold text-gray-800">{daysSinceCreation()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section des graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Graphique des types de transactions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribution des transactions</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} transactions`, ``]}
                    labelFormatter={() => ''}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graphique des partenaires commerciaux */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Partenaires commerciaux</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" name="Nombre">
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h2>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-8">
              <button 
                className={`border-b-2 py-2 px-1 text-sm font-medium ${
                  activeTab === 'all' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('all')}
              >
                All Transactions
              </button>
              <button 
                className={`border-b-2 py-2 px-1 text-sm font-medium ${
                  activeTab === 'entree' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('entree')}
              >
                Bon d'entrée
              </button>
              <button 
                className={`border-b-2 py-2 px-1 text-sm font-medium ${
                  activeTab === 'sortie' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('sortie')}
              >
                Bon de sortie
              </button>
            </nav>
          </div>

          {/* Transactions List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(activeTab === 'all' 
                  ? [...(userData.bonentrees || []), ...(userData.bonsorties || [])]
                  : activeTab === 'entree' 
                    ? (userData.bonentrees || [])
                    : (userData.bonsorties || [])
                )
                  .sort((a, b) => {
                    // Sort by date, most recent first
                    const dateA = a.date_entree || a.date_sortie;
                    const dateB = b.date_entree || b.date_sortie;
                    return new Date(dateB) - new Date(dateA);
                  })
                  .map((transaction) => (
                    <tr key={`${transaction.reference}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.reference?.startsWith('BE') 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {transaction.reference?.startsWith('BE') ? 'Entrée' : 'Sortie'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.date_entree || transaction.date_sortie}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'en_attente' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : transaction.status === 'complete'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {parseFloat(transaction.prix_total).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} MAD
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsUser;