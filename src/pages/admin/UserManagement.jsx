import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderBy, setOrderBy] = useState('Nombre A-Z');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [timer, setTimer] = useState(null);

    const navigate = useNavigate();

    const API_URL = "http://24.144.87.218/";

    const loadUsers = async () => {
        try {
            let orderField = 'username'; // o 'email', dependiendo de orderBy
            let orderDirection = orderBy.includes('A-Z') ? 'ASC' : 'DESC';

            const response = await axios.get(`${API_URL}api/users`, {
                params: {
                    search: searchTerm,
                    order_by_field: orderField,
                    order_by_direction: orderDirection,
                    page: currentPage,
                    page_size: 10
                }
            });

            if (response.status === 200) {
                setUsers(response.data.users); // Asume que la respuesta tiene este formato
                setTotalPages(response.data.pages_count.pages_count); // Asume que la respuesta incluye el conteo total de páginas
            }
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    };

    useEffect(() => {
        const verifyToken = async () => {
            let token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            try {
                const response = await axios.get(`${API_URL}api/verifyToken`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Si el token es válido y el usuario es admin
                const userData = response.data.user;
                if (userData && userData.role === 'admin') {
                    setUser(userData);
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error('Error al verificar el token:', error);
                navigate('/');
            }
        };

        verifyToken();
    }, [navigate]);

    useEffect(() => {
        if (timer) {
            clearTimeout(timer);
        }
        const newTimer = setTimeout(() => {
            loadUsers();
        }, 300); // Espera 1 segundo después de la última edición para llamar al API
        setTimer(newTimer);
    }, [searchTerm, orderBy, currentPage]);

    if (user && user.role !== 'admin') {
        navigate('/');
        return null;
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center h-screen ">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleOrderByChange = (event) => {
        setOrderBy(event.target.value);
    };

    const getPaginationRange = (currentPage, totalPages) => {
        const delta = 2; // Número de páginas adicionales a mostrar alrededor de la página actual
        let range = [];
    
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }
    
        if (currentPage - delta > 2) {
            range.unshift("...");
        }
        if (currentPage + delta < totalPages - 1) {
            range.push("...");
        }
    
        range.unshift(1);
        if (totalPages !== 1) {
            range.push(totalPages);
        }
    
        return range;
    };

    const handleUserClick = (userId) => {
        navigate(`/admin/users/${userId}`);
    };

    

    return (
        <div className="user-management-container mx-auto my-8 m-5">
            {/* Barra de búsqueda y dropdown para ordenar */}
            <div className="flex flex-wrap justify-between items-center mb-4 bg-gray-800 p-4 rounded-lg shadow m-5">
                {/* Barra de búsqueda */}
                <div className="flex flex-col mx-2 mb-4 md:mb-0">
                    <label htmlFor="search-users" className="text-sm text-gray-300 mb-2">Buscar Usuarios</label>
                    <input
                        id="search-users"
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Buscar usuarios..."
                        className="border border-gray-400 bg-gray-700 text-white rounded-md p-2"
                    />
                </div>
    
                {/* Dropdown para ordenar */}
                <div className="flex flex-col mx-2">
                    <label htmlFor="order-by" className="text-sm text-gray-300 mb-2">Ordenar por</label>
                    <select
                        id="order-by"
                        value={orderBy}
                        onChange={handleOrderByChange}
                        className="border border-gray-400 bg-gray-700 text-white rounded-md p-2"
                    >
                        <option value="Nombre A-Z">Nombre A-Z</option>
                        <option value="Nombre Z-A">Nombre Z-A</option>
                        <option value="Correo A-Z">Correo A-Z</option>
                        <option value="Correo Z-A">Correo Z-A</option>
                    </select>
                </div>
            </div>
    
            {/* Lista de usuarios */}
            <div className="users-list mt-4 m-5">
                {users.map(user => (
                    <div 
                        key={user.id} 
                        className="p-4 mb-2 bg-gray-900 shadow-lg rounded-lg cursor-pointer hover:bg-gray-700"
                        onClick={() => handleUserClick(user.id)}
                    >
                        <p className="text-gray-100 text-lg font-semibold">Username: {user.username}</p>
                        <p className="text-gray-200">Email: {user.email}</p>
                        <p className="text-gray-200">Role: {user.role}</p>
                    </div>
                ))}
            </div>
    
            {/* Controles de paginación */}
            <div className="pagination-controls flex justify-center mt-8">
                {getPaginationRange(currentPage, totalPages).map((page, index) => (
                    <button
                        key={index}
                        onClick={() => page !== "..." && handlePageChange(page)}
                        className={`mx-1 px-3 py-1 border rounded ${page === currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                    >
                        {page}
                    </button>
                ))}
            </div>
        </div>
    );
    
};

export default UserManagement;
