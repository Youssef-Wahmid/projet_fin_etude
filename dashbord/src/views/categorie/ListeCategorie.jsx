import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, ChevronLeft, ChevronRight, FileText, FileSpreadsheet, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import './style.css';
import { Link } from 'react-router-dom';
import CreateCategory from './CreateCategory';
import Breadcrumb from 'component/Breadcrumb';
import { Typography } from '@mui/material';
import EditCategory from './EditCategory';
import axios from 'axios';

function ListeCategories() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [deleteAlert, setDeleteAlert] = useState({ show: false, message: '', type: '' });
    
    // Add state for edit dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    
    //! Fetch data from API using axios =======================
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://127.0.0.1:8000/api/v1/categories');
            
            //! Handle the data from axios response
            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                setData(response.data.data);
            } else {
                setData([]);
            }
            
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setData([]);
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };
    //!=============================================

    //! ===========================================
    useEffect(() => {
        fetchData();
    }, []);

    // Search and sort data
    useEffect(() => {
        let tempData = [...data];

        // Filter data based on search term
        if (searchTerm) {
            tempData = tempData.filter(item =>
                Object.values(item).some(value =>
                    value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        // Sort data
        if (sortConfig.key) {
            tempData.sort((a, b) => {
                if (!a[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                if (!b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        setFilteredData(tempData);
    }, [data, searchTerm, sortConfig]);

    // Request sort
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Get current items for pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => {
        if (currentPage < Math.ceil(filteredData.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Export to PDF function
    const exportToPDF = () => {
        alert('Exporting to PDF...');

        // Mock implementation - in a real application, you would use a PDF library
        const dataToExport = filteredData;
        console.log('Exporting to PDF:', dataToExport);

        // This would be replaced with actual PDF generation code
        const pdfWindow = window.open('', '_blank');
        pdfWindow.document.write('<html><head><title>Category Management Export</title>');
        pdfWindow.document.write('<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }</style>');
        pdfWindow.document.write('</head><body>');
        pdfWindow.document.write('<h1>Category Management Export</h1>');
        pdfWindow.document.write('<table>');
        pdfWindow.document.write('<tr><th>ID</th><th>Nom Catégorie</th></tr>');

        dataToExport.forEach(item => {
            pdfWindow.document.write(`<tr><td>${item.id}</td><td>${item.nom_categorie}</td></tr>`);
        });

        pdfWindow.document.write('</table>');
        pdfWindow.document.write('</body></html>');
        pdfWindow.document.close();
        pdfWindow.print();
    };

    // Export to Excel function
    const exportToExcel = () => {
        alert('Exporting to Excel...');

        // Mock implementation - in a real application, you would use an Excel/CSV library
        const dataToExport = filteredData;
        console.log('Exporting to Excel:', dataToExport);

        // Convert data to CSV format
        const headers = ['ID', 'Nom Catégorie'];
        const csvContent = [
            headers.join(','),
            ...dataToExport.map(item => [
                item.id,
                `"${item.nom_categorie}"`
            ].join(','))
        ].join('\n');

        // Create a download link
        const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'category_management_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Edit category function
    const handleEdit = (id) => {
        const categoryToEdit = data.find(category => category.id === id);
        if (categoryToEdit) {
            setSelectedCategory(categoryToEdit);
            setEditDialogOpen(true);
        }
    };

    // Close edit dialog
    const closeEditDialog = () => {
        setEditDialogOpen(false);
        setSelectedCategory(null);
    };

    //! delete category with axios
    const handleDelete = async (id) => {
        console.log(id);
        
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer cette catégorie ?`)) {
          try {
            const response = await axios.delete(`http://127.0.0.1:8000/api/v1/categories/${id}`);
            
            // Show success alert
            setDeleteAlert({ 
              show: response.data.success, 
              message: response.data.message , 
              type: 'success' 
            });
            
            // Refresh the data
            fetchData();
            
          } 
          
          
          
          
          catch (error) {
            // Show error alert
            setDeleteAlert({ 
              show: true, 
              message: error.response?.data?.message || 'Une erreur est survenue lors de la suppression', 
              type: 'error' 
            });
            console.error('Delete error:', error);
          }
          
          // Hide the alert after 3 seconds
          setTimeout(() => {
            setDeleteAlert({ show: false, message: '', type: '' });
          }, 3000);
        }
    };

    return (
        <>
            {deleteAlert.show && (
                <div className={`alert alert-${deleteAlert.type}`}>
                    {deleteAlert.type === 'success' ? (
                        <CheckCircle className="alert-icon" size={18} />
                    ) : (
                        <AlertCircle className="alert-icon" size={18} />
                    )}
                    <span className="alert-message">{deleteAlert.message}</span>
                </div>
            )}
            
            <Breadcrumb title="Gérer vos catégories">
                <Typography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
                    Accueil
                </Typography>
                <Typography variant="subtitle2" color="primary" className="link-breadcrumb">
                    Catégories
                </Typography>
            </Breadcrumb>
         
            <div style={{ display: 'flex', margin: '40px auto 0px auto' }}>
                <div style={{ width: '45%', marginRight: '20px' }}>
                    <CreateCategory fetchData={fetchData} />
                </div>

                <div style={{ width: '100%' }}>
                    <div className="user-management-container">
                        <div className="header-container">
                            <h2 className="title">Liste des catégories</h2>
                            <div className="export-buttons">
                                <button onClick={exportToPDF} className="export-button pdf-button">
                                    <FileText className="export-icon" />
                                    Export to PDF
                                </button>
                                <button onClick={exportToExcel} className="export-button excel-button">
                                    <FileSpreadsheet className="export-icon" />
                                    Export to Excel
                                </button>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="search-container">
                            <div className="search-icon">
                                <Search className="icon" />
                            </div>
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Table */}
                        <div className="table-container">
                            {loading ? (
                                <div className="loading-message">Chargement des catégories...</div>
                            ) : error ? (
                                <div className="error-message">Erreur: {error}</div>
                            ) : (
                                <table className="user-table">
                                    <thead>
                                        <tr>
                                            <th
                                                className="table-header"
                                                onClick={() => requestSort('id')}
                                            >
                                                <div className="header-content">
                                                    ID
                                                    {sortConfig.key === 'id' && (
                                                        sortConfig.direction === 'ascending' ?
                                                            <ChevronUp className="sort-icon" /> :
                                                            <ChevronDown className="sort-icon" />
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                className="table-header"
                                                onClick={() => requestSort('nom_categorie')}
                                            >
                                                <div className="header-content">
                                                    Nom Catégorie
                                                    {sortConfig.key === 'nom_categorie' && (
                                                        sortConfig.direction === 'ascending' ?
                                                            <ChevronUp className="sort-icon" /> :
                                                            <ChevronDown className="sort-icon" />
                                                    )}
                                                </div>
                                            </th>
                                            <th className="table-header actions-header">
                                                <div className="header-content">
                                                    Actions
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.length > 0 ? (
                                            currentItems.map((item) => (
                                                <tr key={item.id} className="table-row">
                                                    <td className="table-cell id-cell">{item.id}</td>
                                                    <td className="table-cell">{item.nom_categorie}</td>
                                                    <td className="table-cell actions-cell">
                                                        <div className="action-buttons">
                                                            <button 
                                                                onClick={() => handleEdit(item.id)} 
                                                                className="action-button edit-button" 
                                                                title="Modifier catégorie"
                                                            >
                                                                <Edit className="action-icon" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(item.id)} 
                                                                className="action-button delete-button" 
                                                                title="Supprimer catégorie"
                                                            >
                                                                <Trash2 className="action-icon" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="no-data">Aucune donnée trouvée</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="pagination-container">
                            <div className="pagination-info">
                                Affichage <span className="pagination-bold">{Math.min(indexOfFirstItem + 1, filteredData.length) || 0}</span> à{' '}
                                <span className="pagination-bold">{Math.min(indexOfLastItem, filteredData.length) || 0}</span> sur{' '}
                                <span className="pagination-bold">{filteredData.length || 0}</span> résultats
                            </div>
                            <div className="pagination-controls">
                                <button
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                    className={`pagination-button ${currentPage === 1 ? 'pagination-disabled' : ''}`}
                                >
                                    <ChevronLeft className="pagination-icon" />
                                    Précédent
                                </button>
                                {Array.from({ length: Math.ceil(filteredData.length / itemsPerPage) || 1 }).map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => paginate(index + 1)}
                                        className={`pagination-number ${currentPage === index + 1 ? 'pagination-active' : ''}`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={nextPage}
                                    disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage) || filteredData.length === 0}
                                    className={`pagination-button ${currentPage === Math.ceil(filteredData.length / itemsPerPage) || filteredData.length === 0
                                        ? 'pagination-disabled'
                                        : ''}`}
                                >
                                    Suivant
                                    <ChevronRight className="pagination-icon" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Edit Dialog */}
            {selectedCategory && (
                <EditCategory 
                    category={selectedCategory}
                    isOpen={editDialogOpen}
                    onClose={closeEditDialog}
                    fetchData={fetchData}
                />
            )}
        </>
    );
}

export default ListeCategories;