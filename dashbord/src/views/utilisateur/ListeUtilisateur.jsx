import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, ChevronLeft, ChevronRight, FileText, FileSpreadsheet, Edit, Trash2, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import './style.css';
import { Link, useNavigate } from 'react-router-dom';
import Create from './Create';
import Breadcrumb from 'component/Breadcrumb';
import { Typography } from '@mui/material';
import EditUser from './EditUser'; // Import du composant d'édition

function ListeUtilisateur() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [deleteAlert, setDeleteAlert] = useState({ show: false, message: '', type: '' });
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const navigate = useNavigate();
    // Récupération des données depuis l'API
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://127.0.0.1:8000/api/v1/users/');

            if (!response.ok) {
                throw new Error(`Erreur API: statut ${response.status}`);
            }

            const result = await response.json();

            // Gestion de la structure de données spécifique
            if (result.data && Array.isArray(result.data)) {
                setData(result.data);
            } else {
                setData([]);
            }

            setError(null);
        } catch (err) {
            setError(err.message);
            setData([]);
            console.error("Erreur lors de la récupération des données:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filtrage et tri des données
    useEffect(() => {
        let tempData = [...data];

        // Filtre par terme de recherche
        if (searchTerm) {
            tempData = tempData.filter(user =>
                Object.values(user).some(value =>
                    value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        // Tri des données
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

    // Gestion du tri
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

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

    // Édition d'un utilisateur
    const handleEdit = (id) => {
        const userToEdit = data.find(user => user.id === id);
        if (userToEdit) {
            setSelectedUser(userToEdit);
            setEditDialogOpen(true);
        }
    };

    const closeEditDialog = () => {
        setEditDialogOpen(false);
        setSelectedUser(null);
    };

    // Suppression d'un utilisateur
    const handleDelete = async (id) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer cet utilisateur ?`)) {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/v1/users/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Erreur ${response.status}`);
                }

                const result = await response.json();

                setDeleteAlert({
                    show: true,
                    message: result.message || 'Utilisateur supprimé avec succès',
                    type: 'success'
                });

                fetchData();

            } catch (error) {
                setDeleteAlert({
                    show: true,
                    message: error.message || 'Erreur lors de la suppression',
                    type: 'error'
                });
                console.error('Erreur de suppression:', error);
            }

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

            <Breadcrumb title="Gestion des utilisateurs">
                <Typography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
                    Accueil
                </Typography>
                <Typography variant="subtitle2" color="primary" className="link-breadcrumb">
                    Utilisateurs
                </Typography>
            </Breadcrumb>

            <div style={{ display: 'flex', margin: '40px auto 0px auto' }}>
                <div style={{ width: '45%', marginRight: '20px' }}>
                    <Create fetchData={fetchData} />
                </div>

                <div style={{ width: '100%' }}>
                    <div className="user-management-container">
                        <div className="header-container">
                            <h2 className="title">Liste des utilisateurs</h2>

                        </div>

                        {/* Barre de recherche */}
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

                        {/* Tableau */}
                        <div className="table-container">
                            {loading ? (
                                <div className="loading-message">Chargement des utilisateurs...</div>
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
                                                onClick={() => requestSort('name')}
                                            >
                                                <div className="header-content">
                                                    Nom
                                                    {sortConfig.key === 'name' && (
                                                        sortConfig.direction === 'ascending' ?
                                                            <ChevronUp className="sort-icon" /> :
                                                            <ChevronDown className="sort-icon" />
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                className="table-header"
                                                onClick={() => requestSort('email')}
                                            >
                                                <div className="header-content">
                                                    Email
                                                    {sortConfig.key === 'email' && (
                                                        sortConfig.direction === 'ascending' ?
                                                            <ChevronUp className="sort-icon" /> :
                                                            <ChevronDown className="sort-icon" />
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                className="table-header"
                                                onClick={() => requestSort('role')}
                                            >
                                                <div className="header-content">
                                                    Rôle
                                                    {sortConfig.key === 'role' && (
                                                        sortConfig.direction === 'ascending' ?
                                                            <ChevronUp className="sort-icon" /> :
                                                            <ChevronDown className="sort-icon" />
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                className="table-header"
                                                onClick={() => requestSort('dateCreation')}
                                            >
                                                <div className="header-content">
                                                    Date de création
                                                    {sortConfig.key === 'dateCreation' && (
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
                                            currentItems.map((user) => (
                                                <tr key={user.id} className="table-row">
                                                    <td className="table-cell id-cell">{user.id}</td>
                                                    <td className="table-cell">{user.name}</td>
                                                    <td className="table-cell">{user.email}</td>
                                                    <td className="table-cell">{user.role}</td>
                                                    <td className="table-cell">
                                                        {new Date(user.dateCreation).toLocaleDateString()}
                                                    </td>
                                                    <td className="table-cell actions-cell">
                                                        <div className="action-buttons">
                                                            <button
                                                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition"
                                                                title="Détails"
                                                                onClick={() => navigate(`/utilisateur/${user.id}`)}
                                                            >
                                                                <Eye className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(user.id)}
                                                                className="text-amber-600 hover:text-amber-900 p-1 rounded-full hover:bg-amber-50 transition"
                                                                title="Modifier"
                                                            >
                                                                <Edit className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(user.id)}
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
                                                <td colSpan="6" className="no-data">Aucun utilisateur trouvé</td>
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

            {/* Dialogue d'édition */}
            {selectedUser && (
                <EditUser
                    user={selectedUser}
                    isOpen={editDialogOpen}
                    onClose={closeEditDialog}
                    fetchData={fetchData}
                />
            )}
        </>
    );
}

export default ListeUtilisateur;