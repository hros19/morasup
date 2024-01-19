import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminTicketDetailsOfUser = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    const [orderBy, setOrderBy] = useState('title_ASC');
    const [filterByStatus, setFilterByStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [apiCallTimer, setApiCallTimer] = useState(null);

    const API_URL = "http://24.144.87.218";

    useEffect(() => {
        if (apiCallTimer) {
            clearTimeout(apiCallTimer);
        }
    
        const newTimer = setTimeout(() => {
            fetchUserTickets();
        }, 300); // Cooldown de 1 segundo
    
        setApiCallTimer(newTimer);
    
        return () => clearTimeout(newTimer);
    }, [userId, orderBy, filterByStatus, currentPage]);

    const fetchUserTickets = async () => {
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (!token || !storedUser) {
            navigate('/');
            return;
        }

        setCurrentUser(storedUser);

        const params = {
            order_by_field: orderBy.split('_')[0], // 'username' o 'email'
            order_by_direction: orderBy.split('_')[1], // 'ASC' o 'DESC'
            status: filterByStatus !== 'Todos' ? filterByStatus : null,
            page: currentPage,
            page_size: 10 // Ajusta según tus necesidades
        };

        if (storedUser.role === 'admin') {
            try {
                const response = await axios.get(`${API_URL}/api/tickets/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params
                });
                console.log(response.data);
                setTickets(response.data.tickets); // Asume que la respuesta tiene este formato
                setTotalPages(response.data.pages_count.pages_count); // Asume que la respuesta incluye el conteo total de páginas
            } catch (error) {
                console.error('Error al obtener los tiquetes del usuario:', error);
                navigate('/');
            }
        } else {
            navigate('/');
        }
    };
    
    const onTicketClick = async (ticket) => {
        navigate(`/ticket-details/${ticket.id}`);
    };
    

    return (
        <div className="bg-gray-800 w-full min-h-screen flex justify-center py-10 px-4">
            <div className="max-w-4xl w-full bg-gray-700 p-5 rounded-lg shadow-xl flex flex-col">
                {/* Filtros */}
                <div className="flex justify-between mb-4">
                    {/* Dropdown para Ordenamiento */}
                    <div>
                        <label htmlFor="order-by" className="text-white">Ordenar por:</label>
                        <select value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
                            <option value="title_ASC">Título A-Z</option>
                            <option value="title_DESC">Título Z-A</option>
                        </select>
                    </div>

    
                    {/* Dropdown para Estado */}
                    <div>
                        <label htmlFor="filter-status" className="text-white">Estado:</label>
                        <select value={filterByStatus} onChange={(e) => setFilterByStatus(e.target.value)}>
                            <option value="">Todos</option>
                            <option value="pending">Pendiente</option>
                            <option value="closed">Cerrado</option>
                        </select>
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-white self-start">Tiquetes del Usuario</h1>

                {tickets.length > 0 ? (
                    <div className="tickets-list mt-4 overflow-auto" style={{ maxHeight: '65vh' }}>
                            {tickets.map(ticket => (
                                <div 
                                    key={ticket.id} 
                                    className="p-4 mb-4 bg-white shadow-lg rounded-lg hover:bg-gray-100 cursor-pointer transition duration-300"
                                    onClick={() => onTicketClick(ticket)}
                                >
                                    <h3 className="text-xl font-bold text-gray-800">{ticket.title}</h3>
                                    <p className="text-gray-600">{ticket.description}</p>
                                    <div className="mt-2">
                                        <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold text-white mr-2 mb-2 ${ticket.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                                            Estado: {ticket.status === 'pending' ? 'Pendiente' : 'Cerrado'}
                                        </span>
                                        {ticket.course && (
                                            <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                                Curso: {ticket.course.name}
                                            </span>
                                        )}
                                        {ticket.assignment && (
                                            <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded">
                                                Tarea: {ticket.assignment.name}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400">Creado el: {new Date(ticket.created_at).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white">Cargando tiquetes del usuario...</p>
                    )}
                {/* Paginación */}
                <div className="pagination-controls flex justify-center mt-8">
                    {[...Array(totalPages).keys()].map(page => (
                        <button
                            key={page + 1}
                            onClick={() => setCurrentPage(page + 1)}
                            className={`mx-1 px-3 py-1 border rounded ${page + 1 === currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                        >
                            {page + 1}
                        </button>
                    ))}
                </div>
                {/* Botón que retorna a /homeAdmin */}
                <button
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 mt-2"
                    onClick={() => navigate('/homeAdmin')}
                >
                    Volver
                </button>
            </div>
            

        </div>

    );
};

export default AdminTicketDetailsOfUser;
