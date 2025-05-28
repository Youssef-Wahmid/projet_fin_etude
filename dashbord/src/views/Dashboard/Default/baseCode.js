import React, { useState, useEffect } from 'react';
import { 
  useTheme, 
  Grid, 
  Card, 
  Typography, 
  CircularProgress, 
  Box,
  Tooltip,
  Zoom,
  Paper,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import ReactApexChart from 'react-apexcharts';
import ReportCard from './ReportCard';
import { gridSpacing } from 'config.js';

// icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import MonetizationOnTwoTone from '@mui/icons-material/MonetizationOnTwoTone';
import WarningTwoTone from '@mui/icons-material/WarningTwoTone';
import LocalShippingTwoTone from '@mui/icons-material/LocalShippingTwoTone';
import PendingActionsTwoTone from '@mui/icons-material/PendingActionsTwoTone';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import InventoryIcon from '@mui/icons-material/Inventory';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Default = () => {
  const theme = useTheme();
  const [produitsData, setProduitsData] = useState(null);
  const [bonsSortiesData, setBonsSortiesData] = useState(null);
  const [bonsEntreesData, setBonsEntreesData] = useState(null);
  const [clientsData, setClientsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [produitsEnRuptureList, setProduitsEnRuptureList] = useState([]);
  const [sortBy, setSortBy] = useState('quantite');
  const [clientChartType, setClientChartType] = useState('bar');
  const [stockChartPeriod, setStockChartPeriod] = useState('7');
  const [stockChartData, setStockChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [produitsResponse, sortiesResponse, entreesResponse, clientsResponse] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/v1/produits'),
          fetch('http://127.0.0.1:8000/api/v1/bonsorties'),
          fetch('http://127.0.0.1:8000/api/v1/bonentrees'),
          fetch('http://127.0.0.1:8000/api/v1/clients')
        ]);

        if (!produitsResponse.ok) throw new Error('Erreur produits');
        if (!sortiesResponse.ok) throw new Error('Erreur bons de sortie');
        if (!entreesResponse.ok) throw new Error('Erreur bons d\'entrée');
        if (!clientsResponse.ok) throw new Error('Erreur clients');

        const produitsJson = await produitsResponse.json();
        const sortiesJson = await sortiesResponse.json();
        const entreesJson = await entreesResponse.json();
        const clientsJson = await clientsResponse.json();

        setProduitsData(produitsJson);
        setBonsSortiesData(sortiesJson);
        setBonsEntreesData(entreesJson);
        setClientsData(clientsJson.data[0]);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (produitsData) {
      const produitsCritiques = produitsData.data.filter(
        produit => produit.stock.quantite_disponible <= produit.stock.niveau_critique
      );
      setProduitsEnRuptureList(produitsCritiques);
    }
  }, [produitsData]);

  useEffect(() => {
    if (bonsSortiesData && bonsEntreesData) {
      prepareStockMovementData();
    }
  }, [bonsSortiesData, bonsEntreesData, stockChartPeriod]);

  const prepareStockMovementData = () => {
    const days = parseInt(stockChartPeriod);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Format: { '2023-05-01': { entree: 0, sortie: 0 }, ... }
    const dateMap = {};
    
    // Initialize all dates in the period
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dateMap[dateStr] = { entree: 0, sortie: 0 };
    }

    // Process entrées
    bonsEntreesData.data.forEach(entree => {
      const dateStr = entree.dateEntree;
      if (dateStr >= startDate.toISOString().split('T')[0] && dateStr <= endDate.toISOString().split('T')[0]) {
        entree.produits.forEach(produit => {
          dateMap[dateStr].entree += parseInt(produit.quantite);
        });
      }
    });

    // Process sorties
    bonsSortiesData.data.forEach(sortie => {
      const dateStr = sortie.dateSortie;
      if (dateStr >= startDate.toISOString().split('T')[0] && dateStr <= endDate.toISOString().split('T')[0] && sortie.status === 'livre') {
        sortie.produits.forEach(produit => {
          dateMap[dateStr].sortie += parseInt(produit.quantite);
        });
      }
    });

    // Convert to array for chart
    const categories = Object.keys(dateMap).sort();
    const entreeData = categories.map(date => dateMap[date].entree);
    const sortieData = categories.map(date => dateMap[date].sortie);

    setStockChartData({
      categories,
      entreeData,
      sortieData
    });
  };

  const calculateKPIs = () => {
    if (!produitsData || !bonsSortiesData) return {};
    
    let valeurTotaleStock = 0;
    produitsData.data.forEach(produit => {
      const prixUnitaire = parseFloat(produit.prix_unitaire.replace(/,/g, ''));
      valeurTotaleStock += prixUnitaire * produit.stock.quantite_disponible;
    });

    const totalSorties = bonsSortiesData.data.length;
    const sortiesLivrees = bonsSortiesData.data.filter(bs => bs.status === 'livre').length;
    const commandesEnAttente = bonsSortiesData.data.filter(bs => bs.status === 'en_attente').length;
    
    const tauxLivraison = totalSorties > 0 ? Math.round((sortiesLivrees / totalSorties) * 100) : 0;

    return {
      valeurTotaleStock: valeurTotaleStock.toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' }),
      produitsEnRupture: produitsEnRuptureList.length,
      commandesEnAttente,
      tauxLivraison,
      nombreTotalProduits: produitsData.data.length,
      totalSorties,
      sortiesLivrees
    };
  };

  const getProductSalesData = () => {
    if (!produitsData || !bonsSortiesData) return { topProducts: [], bottomProducts: [] };

    const productSales = {};
    produitsData.data.forEach(produit => {
      productSales[produit.id] = {
        ...produit,
        quantiteVendue: 0,
        chiffreAffaires: 0,
        stockActuel: produit.stock.quantite_disponible
      };
    });

    bonsSortiesData.data.forEach(bon => {
      if (bon.status === 'livre' && bon.produits) {
        bon.produits.forEach(produit => {
          if (productSales[produit.id]) {
            productSales[produit.id].quantiteVendue += parseInt(produit.quantite);
            productSales[produit.id].chiffreAffaires += parseFloat(produit.prixVente) * parseInt(produit.quantite);
          }
        });
      }
    });

    const productsArray = Object.values(productSales);
    
    const topProducts = [...productsArray]
      .sort((a, b) => sortBy === 'quantite' 
        ? b.quantiteVendue - a.quantiteVendue 
        : b.chiffreAffaires - a.chiffreAffaires)
      .slice(0, 5);

    const bottomProducts = [...productsArray]
      .sort((a, b) => sortBy === 'quantite' 
        ? a.quantiteVendue - b.quantiteVendue 
        : a.chiffreAffaires - b.chiffreAffaires)
      .slice(0, 5);

    return { topProducts, bottomProducts };
  };

  const getTopClients = () => {
    if (!clientsData) return [];
    
    return clientsData
      .filter(client => client.nombre_bonsorties > 0)
      .sort((a, b) => b.nombre_bonsorties - a.nombre_bonsorties)
      .slice(0, 5);
  };

  const { topProducts, bottomProducts } = getProductSalesData();
  const topClients = getTopClients();
  const kpis = calculateKPIs();

  const stockChartOptions = {
    chart: {
      type: 'line',
      height: 350,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      }
    },
    colors: ['#4CAF50', '#F44336'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    markers: {
      size: 5
    },
    xaxis: {
      categories: stockChartData?.categories || [],
      labels: {
        formatter: function(value) {
          return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
      }
    },
    yaxis: {
      title: {
        text: 'Quantité'
      },
      min: 0
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (value) {
          return value + " unités";
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      floating: true,
      offsetY: -25,
      offsetX: -5
    }
  };

  const stockChartSeries = [
    {
      name: 'Entrées',
      data: stockChartData?.entreeData || []
    },
    {
      name: 'Sorties',
      data: stockChartData?.sortieData || []
    }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px" color="error.main">
        {error}
      </Box>
    );
  }

  const TooltipContent = () => (
    <Paper sx={{ p: 2, maxWidth: 300, maxHeight: 200, overflow: 'auto' }}>
      <Typography variant="subtitle2" gutterBottom>
        Produits en rupture de stock:
      </Typography>
      <List dense>
        {produitsEnRuptureList.length > 0 ? (
          produitsEnRuptureList.map((produit, index) => (
            <ListItem key={index}>
              <ListItemText 
                primary={`${produit.nom} (${produit.ref})`} 
                secondary={`Stock: ${produit.stock.quantite_disponible}/${produit.stock.niveau_critique}`}
              />
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="Aucun produit en rupture" />
          </ListItem>
        )}
      </List>
    </Paper>
  );

  const renderProductChart = (data, title) => (
    <Card sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <FormControl size="small" sx={{ minWidth: 120, mb: 2 }}>
        <InputLabel>Tri par</InputLabel>
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          label="Tri par"
        >
          <MenuItem value="quantite">Quantité vendue</MenuItem>
          <MenuItem value="chiffreAffaires">Chiffre d'affaires</MenuItem>
        </Select>
      </FormControl>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis 
            type="category" 
            dataKey="nom" 
            width={100}
            tick={{ fontSize: 12 }}
          />
          <RechartsTooltip 
            formatter={(value) => sortBy === 'quantite' 
              ? [`${value} unités`, 'Quantité vendue'] 
              : [`${value.toLocaleString('fr-FR')} MAD`, 'Chiffre d\'affaires']}
            labelFormatter={(label) => {
              const product = data.find(p => p.nom === label);
              return `${label} (Stock: ${product?.stockActuel || 0})`;
            }}
          />
          <Legend />
          <Bar 
            dataKey={sortBy === 'quantite' ? 'quantiteVendue' : 'chiffreAffaires'} 
            name={sortBy === 'quantite' ? 'Quantité vendue' : 'Chiffre d\'affaires (MAD)'}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );

  const renderClientChart = () => (
    <Card sx={{ p: 2, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" display="flex" alignItems="center">
          <LoyaltyIcon color="primary" sx={{ mr: 1 }} />
          Clients fidèles
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Type de graphique</InputLabel>
          <Select
            value={clientChartType}
            onChange={(e) => setClientChartType(e.target.value)}
            label="Type de graphique"
          >
            <MenuItem value="bar">Barres</MenuItem>
            <MenuItem value="pie">Camembert</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {topClients.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          {clientChartType === 'bar' ? (
            <BarChart
              data={topClients}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip 
                formatter={(value) => [`${value} commandes`, 'Nombre de commandes']}
              />
              <Legend />
              <Bar 
                dataKey="nombre_bonsorties" 
                name="Nombre de commandes"
                fill={theme.palette.primary.main}
              />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={topClients}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="nombre_bonsorties"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {topClients.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value, name, props) => [
                  `${value} commandes`,
                  props.payload.name
                ]}
              />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      ) : (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height={250}
          flexDirection="column"
        >
          <Typography variant="body1" color="textSecondary" gutterBottom>
            Aucun client avec des commandes pour le moment
          </Typography>
          <Typography variant="body2" color="textSecondary">
            (Seuls les clients avec au moins 1 commande sont affichés)
          </Typography>
        </Box>
      )}
    </Card>
  );

  const renderStockMovementChart = () => (
    <Card sx={{ p: 2, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" display="flex" alignItems="center">
          <InventoryIcon color="primary" sx={{ mr: 1 }} />
          Mouvements de stock
        </Typography>
        <Tabs
          value={stockChartPeriod}
          onChange={(e, newValue) => setStockChartPeriod(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="7 jours" value="7" />
          <Tab label="30 jours" value="30" />
        </Tabs>
      </Box>
      {stockChartData ? (
        <ReactApexChart 
          options={stockChartOptions} 
          series={stockChartSeries} 
          type="line" 
          height={350} 
        />
      ) : (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height={350}
        >
          <CircularProgress />
        </Box>
      )}
    </Card>
  );

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          {/* Valeur Totale du Stock */}
          <Grid item lg={3} md={6} xs={12}>
            <ReportCard
              primary={kpis.valeurTotaleStock}
              secondary="Valeur Totale du Stock"
              color={theme.palette.success.main}
              footerData={`${kpis.nombreTotalProduits} produits`}
              iconPrimary={MonetizationOnTwoTone}
              iconFooter={TrendingUpIcon}
            />
          </Grid>

          {/* Articles en Rupture avec Tooltip */}
          <Grid item lg={3} md={6} xs={12}>
            <Tooltip 
              title={<TooltipContent />} 
              arrow 
              TransitionComponent={Zoom}
              placement="top"
            >
              <div>
                <ReportCard
                  primary={kpis.produitsEnRupture.toString()}
                  secondary="Articles en Rupture"
                  color={kpis.produitsEnRupture > 0 ? theme.palette.error.main : theme.palette.success.main}
                  footerData={kpis.produitsEnRupture > 0 ? "Attention stock critique" : "Stock OK"}
                  iconPrimary={WarningTwoTone}
                  iconFooter={kpis.produitsEnRupture > 0 ? TrendingDownIcon : TrendingUpIcon}
                />
              </div>
            </Tooltip>
          </Grid>

          {/* Commandes en Attente */}
          <Grid item lg={3} md={6} xs={12}>
            <ReportCard
              primary={kpis.commandesEnAttente.toString()}
              secondary="Commandes en Attente"
              color={kpis.commandesEnAttente > 0 ? theme.palette.warning.main : theme.palette.success.main}
              footerData={kpis.commandesEnAttente > 0 ? "À traiter" : "Toutes traitées"}
              iconPrimary={PendingActionsTwoTone}
              iconFooter={kpis.commandesEnAttente > 0 ? TrendingDownIcon : TrendingUpIcon}
            />
          </Grid>

          {/* Taux de Livraison */}
          <Grid item lg={3} md={6} xs={12}>
            <ReportCard
              primary={`${kpis.tauxLivraison}%`}
              secondary="Taux de Livraison"
              color={
                kpis.tauxLivraison >= 90 ? theme.palette.success.main : 
                kpis.tauxLivraison >= 70 ? theme.palette.warning.main : 
                theme.palette.error.main
              }
              footerData={`${kpis.sortiesLivrees}/${kpis.totalSorties} livrées`}
              iconPrimary={LocalShippingTwoTone}
              iconFooter={kpis.tauxLivraison >= 90 ? TrendingUpIcon : TrendingDownIcon}
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Graphique des mouvements de stock */}
      <Grid item xs={12}>
        {renderStockMovementChart()}
      </Grid>

      {/* Graphiques des produits et clients */}
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          {/* Produits les plus vendus */}
          <Grid item xs={12} md={6} lg={4}>
            {renderProductChart(topProducts, "Produits les plus vendus")}
          </Grid>

          {/* Produits les moins vendus */}
          <Grid item xs={12} md={6} lg={4}>
            {renderProductChart(bottomProducts, "Produits les moins vendus")}
          </Grid>

          {/* Clients fidèles */}
          <Grid item xs={12} md={12} lg={4}>
            {renderClientChart()}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Default;