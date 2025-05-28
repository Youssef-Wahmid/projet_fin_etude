import { useState, useEffect, useContext } from 'react';
import { User, Package, LogIn, LogOut, Calendar, Mail, Shield, Clock, DollarSign, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { getHeaders } from 'config/config';
import { AuthContext } from 'context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { AccessToken } = useContext(AuthContext);
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://127.0.0.1:8000/api/v1/profile', getHeaders(AccessToken));
        setProfileData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des données du profil");
        setLoading(false);
        console.error("Erreur API:", err);
      }
    };

    fetchProfileData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Couleurs pour les graphiques
  const CHART_COLORS = {
    en_attente: '#F59E0B', // amber-500
    partiel: '#3B82F6',    // blue-500
    recu: '#10B981',       // green-500
    valide: '#10B981',     // green-500
    livre: '#3B82F6',      // blue-500
    rejete: '#EF4444',     // red-500
    annule: '#EF4444'      // red-500
  };

  // Calculer les statistiques avec pourcentages
  const calculateStats = () => {
    if (!profileData) return null;
    
    const user = profileData.user;
    const bonEntrees = user.bonentrees || [];
    const bonSorties = user.bonsorties || [];
    
    // Statistiques des bons d'entrée - exclure les "rejeté"
    const bonsEntreesValides = bonEntrees.filter(bon => bon.status !== 'rejete');
    const totalBonEntrees = bonsEntreesValides.length;
    const montantTotalEntrees = bonsEntreesValides.reduce((total, bon) => 
      total + parseFloat(bon.prix_total), 0);
    
    // Données pour le graphique des bons d'entrée avec pourcentages
    const entreeStatusCounts = {
      en_attente: bonEntrees.filter(bon => bon.status === 'en_attente').length,
      partiel: bonEntrees.filter(bon => bon.status === 'partiel').length,
      recu: bonEntrees.filter(bon => bon.status === 'recu').length,
      rejete: bonEntrees.filter(bon => bon.status === 'rejete').length
    };

    const entreeData = Object.entries(entreeStatusCounts)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: getStatusLabelEntree(status),
        value: count,
        status,
        percent: bonEntrees.length > 0 ? (count / bonEntrees.length * 100) : 0
      }));
    
    // Statistiques des bons de sortie - exclure les "annulé"
    const bonsSortiesValides = bonSorties.filter(bon => bon.status !== 'annule');
    const totalBonSorties = bonsSortiesValides.length;
    const montantTotalSorties = bonsSortiesValides.reduce((total, bon) => 
      total + parseFloat(bon.prix_total), 0);
    
    const sortieStatusCounts = {
      en_attente: bonSorties.filter(bon => bon.status === 'en_attente').length,
      valide: bonSorties.filter(bon => bon.status === 'valide').length,
      livre: bonSorties.filter(bon => bon.status === 'livre').length,
      annule: bonSorties.filter(bon => bon.status === 'annule').length
    };

    const sortieData = Object.entries(sortieStatusCounts)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: getStatusLabelSortie(status),
        value: count,
        status,
        percent: bonSorties.length > 0 ? (count / bonSorties.length * 100) : 0
      }));
    
    return {
      entrees: {
        total: totalBonEntrees,
        montant: montantTotalEntrees.toFixed(2),
        chartData: entreeData
      },
      sorties: {
        total: totalBonSorties,
        montant: montantTotalSorties.toFixed(2),
        chartData: sortieData
      }
    };
  };

  // Récupérer le libellé de statut pour les bons d'entrée
  const getStatusLabelEntree = (status) => {
    switch(status) {
      case 'en_attente': return 'En attente';
      case 'partiel': return 'Partiel';
      case 'recu': return 'Reçu';
      case 'rejete': return 'Rejeté';
      default: return status;
    }
  };

  // Récupérer la couleur de fond pour le statut des bons d'entrée
  const getStatusColorEntree = (status) => {
    switch(status) {
      case 'en_attente': return 'bg-amber-100 text-amber-800';
      case 'partiel': return 'bg-blue-100 text-blue-800';
      case 'recu': return 'bg-green-100 text-green-800';
      case 'rejete': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Récupérer le libellé de statut pour les bons de sortie
  const getStatusLabelSortie = (status) => {
    switch(status) {
      case 'en_attente': return 'En attente';
      case 'valide': return 'Validé';
      case 'livre': return 'Livré';
      case 'annule': return 'Annulé';
      default: return status;
    }
  };

  // Récupérer la couleur de fond pour le statut des bons de sortie
  const getStatusColorSortie = (status) => {
    switch(status) {
      case 'en_attente': return 'bg-amber-100 text-amber-800';
      case 'valide': return 'bg-green-100 text-green-800';
      case 'livre': return 'bg-blue-100 text-blue-800';
      case 'annule': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>{error}</p>
        <button 
          className="mt-4 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-md transition-colors"
          onClick={() => window.location.reload()}
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!profileData) return null;

  const user = profileData.user;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* En-tête du profil */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="bg-white p-3 rounded-full text-blue-600">
            <User className="h-12 w-12" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <div className="flex items-center mt-1">
              <Mail className="h-4 w-4 mr-1" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center mt-1">
              <Shield className="h-4 w-4 mr-1" />
              <span className="capitalize">{user.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Informations du compte */}
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold mb-4">Informations du compte</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Identifiant</p>
              <p className="font-medium">{user.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-green-100 p-2 rounded-full text-green-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Date de création</p>
              <p className="font-medium">{formatDate(user.dateCreation)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Résumé des statistiques */}
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Résumé des activités</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statistiques des bons d'entrée */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center mb-4">
              <LogIn className="h-6 w-6 text-blue-500 mr-2" />
              <h3 className="text-lg font-medium">Bons d'entrée</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Total (hors rejetés)</p>
                <div className="flex items-center mt-1">
                  <Package className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-lg font-bold">{stats?.entrees.total || 0}</span>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Montant (hors rejetés)</p>
                <div className="flex items-center mt-1">
                  <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-lg font-bold">{stats?.entrees.montant || "0.00"} MAD</span>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">En attente</p>
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 text-amber-500 mr-1" />
                  <span className="text-lg font-bold">
                    {stats?.entrees.chartData.find(d => d.status === 'en_attente')?.value || 0}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Graphique des bons d'entrée */}
            {stats?.entrees.chartData?.length > 0 ? (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2 text-gray-700">Répartition par statut</h4>
                <div className="bg-white p-4 rounded-lg shadow-sm h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.entrees.chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${percent.toFixed(0)}%`}
                      >
                        {stats.entrees.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.status]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value} (${props.payload.percent.toFixed(1)}%)`,
                          name
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">Aucune donnée disponible pour les bons d'entrée</p>
            )}
          </div>
          
          {/* Statistiques des bons de sortie */}
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
            <div className="flex items-center mb-4">
              <LogOut className="h-6 w-6 text-indigo-500 mr-2" />
              <h3 className="text-lg font-medium">Bons de sortie</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Total (hors annulés)</p>
                <div className="flex items-center mt-1">
                  <Package className="h-4 w-4 text-indigo-500 mr-1" />
                  <span className="text-lg font-bold">{stats?.sorties.total || 0}</span>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Montant (hors annulés)</p>
                <div className="flex items-center mt-1">
                  <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-lg font-bold">{stats?.sorties.montant || "0.00"} MAD</span>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">En attente</p>
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 text-amber-500 mr-1" />
                  <span className="text-lg font-bold">
                    {stats?.sorties.chartData.find(d => d.status === 'en_attente')?.value || 0}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Graphique des bons de sortie */}
            {stats?.sorties.chartData?.length > 0 ? (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2 text-gray-700">Répartition par statut</h4>
                <div className="bg-white p-4 rounded-lg shadow-sm h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.sorties.chartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value} (${props.payload.percent.toFixed(1)}%)`,
                          name
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="value" name="Bons">
                        {stats.sorties.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.status]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">Aucune donnée disponible pour les bons de sortie</p>
            )}
            
          
          </div>
        </div>
      </div>
    </div>
  );
}