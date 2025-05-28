import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  ArrowLeft, Package, ShoppingCart, Calendar, Tag, Bookmark, AlertCircle, Check, Clock 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ComposedChart, Area
} from 'recharts';

export default function DetailsProduit() {
  const { id } = useParams();
  const [produit, setProduit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduit = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/api/v1/produits/${id}`);
        
        if (!response.ok) {
          throw new Error(`Erreur lors de la récupération du produit: ${response.status}`);
        }
        
        const data = await response.json();
        setProduit(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduit();
    }
  }, [id]);

  // Fonction pour simuler des données d'entrées de stock (à remplacer par vos vraies données)
  const simulateStockEntries = (bonsorties) => {
    // Dans un vrai scénario, vous auriez ces données depuis votre API
    const entries = {
      "2025-05": 150, // 150 unités reçues en mai 2025
      "2025-04": 100,
      "2025-03": 80
    };
    return entries;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-500">Erreur</h2>
        <p className="text-gray-600">{error}</p>
        <button 
          onClick={() => window.history.back()} 
          className="mt-6 flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </button>
      </div>
    );
  }

  if (!produit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold">Produit non trouvé</h2>
        <button 
          onClick={() => window.history.back()} 
          className="mt-6 flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </button>
      </div>
    );
  }

  // Calcul du nombre total de produits vendus
  const totalVendus = produit.bonsorties.reduce((total, sortie) => {
    return total + sortie.pivot.quantite;
  }, 0);

  // Statuts des commandes avec comptage
  const statutsCommandes = produit.bonsorties.reduce((acc, sortie) => {
    const status = sortie.status;
    if (!acc[status]) {
      acc[status] = 0;
    }
    acc[status] += 1;
    return acc;
  }, {});

  // 1. Donut Chart - Nombre de produits par statut
  const dataStatuts = Object.entries(statutsCommandes).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // 2. Line/Bar Chart - Total des quantités vendues par mois
  const ventesParMois = produit.bonsorties.reduce((acc, sortie) => {
    const date = new Date(sortie.date_sortie);
    const mois = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[mois]) {
      acc[mois] = 0;
    }
    acc[mois] += sortie.pivot.quantite;
    return acc;
  }, {});

  const dataVentesMensuelles = Object.entries(ventesParMois).map(([mois, quantite]) => ({
    mois,
    quantite
  })).sort((a, b) => a.mois.localeCompare(b.mois));

  // 3. Line Chart - Niveau de stock restant à la fin de chaque mois
  // Note: Cette simulation suppose que le stock initial était de 200 unités
  // Dans une vraie application, vous auriez ces données historiques
  const stockInitial = 200;
  const stockEntries = simulateStockEntries(produit.bonsorties);
  
  let stockRestant = stockInitial;
  const dataStockMensuel = dataVentesMensuelles.map(item => {
    const entrees = stockEntries[item.mois] || 0;
    stockRestant = stockRestant + entrees - item.quantite;
    return {
      mois: item.mois,
      stock: stockRestant
    };
  });

  // 4. Bar Chart comparatif - Unités entrées vs sorties par mois
  const dataEntreesSorties = dataVentesMensuelles.map(item => ({
    mois: item.mois,
    sorties: item.quantite,
    entrees: stockEntries[item.mois] || 0
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => window.history.back()} 
          className="flex items-center text-blue-500 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* En-tête */}
        <div className="bg-blue-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{produit.nom}</h1>
            <span className="text-lg font-semibold bg-blue-700 px-4 py-1 rounded-full">
              Réf: {produit.ref}
            </span>
          </div>
          <p className="mt-2 text-blue-100">{produit.description}</p>
        </div>

        {/* Informations principales */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-blue-500" />
                  Informations générales
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prix unitaire:</span>
                    <span className="font-semibold">{parseFloat(produit.prix_unitaire).toLocaleString('fr-FR')} MAD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Catégorie:</span>
                    <span className="font-semibold">{produit.categorie.nom_cat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date d'ajout:</span>
                    <span className="font-semibold">{new Date(produit.date_ajoute).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-blue-500" />
                  Gestion de stock
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantité disponible:</span>
                    <span className="font-semibold">{produit.stock.quantite_disponible}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Niveau critique:</span>
                    <span className="font-semibold">{produit.stock.niveau_critique}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dernière mise à jour:</span>
                    <span className="font-semibold">{new Date(produit.stock.date_maj).toLocaleDateString('fr-FR')}</span>
                  </div>
                  
                  {/* Indicateur de niveau de stock */}
                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Niveau de stock</span>
                      <span className={`text-sm font-medium ${
                        produit.stock.quantite_disponible <= produit.stock.niveau_critique 
                          ? 'text-red-600' 
                          : produit.stock.quantite_disponible <= produit.stock.niveau_critique * 2 
                            ? 'text-yellow-600' 
                            : 'text-green-600'
                      }`}>
                        {produit.stock.quantite_disponible <= produit.stock.niveau_critique 
                          ? 'Critique' 
                          : produit.stock.quantite_disponible <= produit.stock.niveau_critique * 2 
                            ? 'Attention' 
                            : 'Normal'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          produit.stock.quantite_disponible <= produit.stock.niveau_critique 
                            ? 'bg-red-600' 
                            : produit.stock.quantite_disponible <= produit.stock.niveau_critique * 2 
                              ? 'bg-yellow-500' 
                              : 'bg-green-600'
                        }`}
                        style={{ width: `${Math.min(100, (produit.stock.quantite_disponible / (produit.stock.niveau_critique * 5)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2 text-blue-500" />
                  Statistiques des ventes
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total des ventes:</span>
                    <span className="font-semibold">{totalVendus} unités</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chiffre d'affaires:</span>
                    <span className="font-semibold">
                      {(totalVendus * parseFloat(produit.prix_unitaire)).toLocaleString('fr-FR')} MAD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre de commandes:</span>
                    <span className="font-semibold">{produit.bonsorties.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section des graphiques */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* 1. Graphique en anneau - Nombre de produits par statut */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Répartition des statuts de commande</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataStatuts}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {dataStatuts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} commandes`, 'Quantité']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Graphique en barres - Total des quantités vendues par mois */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Quantités vendues par mois</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dataVentesMensuelles}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, 'Quantité']} />
                    <Legend />
                    <Bar dataKey="quantite" name="Ventes" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. Graphique en ligne - Niveau de stock restant par mois */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Niveau de stock par mois</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dataStockMensuel}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, 'Stock']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="stock" 
                      name="Stock restant" 
                      stroke="#FF8042" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. Graphique en barres comparatives - Entrées vs Sorties */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Mouvements de stock par mois</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={dataEntreesSorties}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="entrees" name="Entrées" fill="#00C49F" />
                    <Bar dataKey="sorties" name="Sorties" fill="#FF8042" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Dernières commandes */}
          <div className="bg-gray-50 p-6 rounded-lg mt-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-500" />
              Dernières commandes
            </h2>
            <div className="space-y-4">
              {produit.bonsorties.slice(0, 3).map((sortie) => (
                <div key={sortie.id} className="bg-white p-3 rounded-md border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{sortie.reference}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      sortie.status === 'livre' ? 'bg-green-100 text-green-800' : 
                      sortie.status === 'valide' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {sortie.status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Quantité:</span>
                      <span className="font-medium">{sortie.pivot.quantite}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium">{new Date(sortie.date_sortie).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              ))}
              {produit.bonsorties.length > 3 && (
                <button className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 text-center">
                  Voir toutes les commandes ({produit.bonsorties.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}