import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../../components/Modal.jsx';

const TicketDetails = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [currentUser, setCurrentUser] = useState(null); // Usuario actual

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [commentText, setCommentText] = useState('');
    const API_URL = "http://24.144.87.218";

    const handleResponseTicket = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCommentText('');
    };

    const handleAddComment = () => {
        if (!commentText) {
            alert('Por favor, escribe un comentario');
            return;
        }

        if (commentText.trim()) {
            addCommentToTicket(commentText.trim());
            setIsModalOpen(false);
            setCommentText('');
        }
    };

    const addCommentToTicket = async (commentText) => {
        const token = localStorage.getItem('token'); // Asume que el token JWT ya está almacenado en localStorage
        const user = JSON.parse(localStorage.getItem('user')); // Asume que la información del usuario ya está almacenada en localStorage
    
        if (!token || !user) {
            console.error('No autenticado');
            return;
        }
    
        try {
            const response = await axios.post(
                `${API_URL}/api/comments`, // Asume que API_URL es la URL base de tu API
                {
                    ticket_id: ticket.id, // Asume que ticket.id es el ID del ticket al cual se le agrega el comentario
                    user_id: user.id, // ID del usuario autenticado
                    comment: commentText // Texto del comentario
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}` // Pasa el token JWT en el encabezado de autorización
                    }
                }
            );
    
            if (response.status === 201) {
                console.log(response.data.message);
                // Volver a cargar la página para mostrar el nuevo comentario
                window.location.reload();
            } else {
                throw new Error('Respuesta inesperada del servidor');
            }
        } catch (error) {
            if (error.response) {
                // La solicitud se hizo y el servidor respondió con un estado de error
                console.error('Error en la respuesta:', error.response.data);
            } else if (error.request) {
                // La solicitud se hizo pero no se recibió respuesta
                console.error('Sin respuesta:', error.request);
            } else {
                // Algo más causó un error en la solicitud
                console.error('Error en la solicitud:', error.message);
            }
        }
    };

    const handleChangeState = async () => {
        const token = localStorage.getItem('token'); // Asumimos que el token JWT ya está almacenado
        const newStatus = ticket.status === 'pending' ? 'closed' : 'pending'; // Alternar entre 'pending' y 'closed'
    
        if (!token) {
            console.error('No autenticado');
            return;
        }
    
        try {
            const response = await axios.put(
                `${API_URL}/api/tickets/${ticket.id}/status`, // Endpoint para actualizar el estado
                { status: newStatus }, // Estado nuevo que queremos establecer
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
    
            if (response.status === 204) {
                console.log("Estado del ticket actualizado con éxito.");
                setTicket({ ...ticket, status: newStatus }); // Actualizar el estado local del ticket
            } else {
                throw new Error('No se pudo actualizar el estado del ticket');
            }
        } catch (error) {
            if (error.response) {
                // La solicitud se hizo y el servidor respondió con un estado de error
                console.error('Error en la respuesta:', error.response.data);
            } else if (error.request) {
                // La solicitud se hizo pero no se recibió respuesta
                console.error('Sin respuesta:', error.request);
            } else {
                // Algo más causó un error en la solicitud
                console.error('Error en la solicitud:', error.message);
            }
        }
    };
    


    useEffect(() => {
        const verifyAndFetchTicket = async () => {
            const token = localStorage.getItem('token');
            const storedUser = JSON.parse(localStorage.getItem('user')); // Datos del usuario actual
    
            if (!token || !storedUser) {
                navigate('/');
                return;
            }
    
            setCurrentUser(storedUser); // Establecer el usuario actual
    
            // Si el usuario es admin o moderator, obtener los detalles del ticket directamente
            if (['admin', 'moderator'].includes(storedUser.role)) {
                try {
                    const response = await axios.get(`${API_URL}/api/tickets/${ticketId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setTicket(response.data[0]);
                } catch (error) {
                    console.error('Error al obtener los detalles del ticket:', error);
                    navigate('/');
                }
            } else { // Si el usuario es un estudiante, verificar la propiedad del ticket
                try {
                    const ownershipResponse = await axios.post(`${API_URL}/api/tickets/checkOwnership`, {
                        user_id: storedUser.id,
                        ticket_id: ticketId
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
    
                    if (ownershipResponse.status === 200) {
                        const response = await axios.get(`${API_URL}/api/tickets/${ticketId}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setTicket(response.data[0]);
                    } else {
                        throw new Error('No autorizado para ver este ticket');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/');
                }
            }
        };
    
        verifyAndFetchTicket();
    }, [ticketId, navigate]);

    // Si no hay ticket, mostrar mensaje de carga
    if (!ticket || !currentUser) {
        return (
            <div className="flex justify-center items-center h-screen ">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 w-full min-h-screen flex justify-center py-10 px-4">
            <div className="max-w-4xl w-full bg-gray-700 p-5 rounded-lg shadow-xl">
                {ticket ? (
                    <>
                        <h1 className="text-3xl font-bold text-white">{ticket.title}</h1>
                        <p className="text-white text-lg">{ticket.description}</p>
                        <div className="mt-4 mb-2 text-sm text-gray-300">
                            <p>Fecha de creación: {new Date(ticket.created_at).toLocaleDateString()}</p>
                            <p>Autor: {ticket.user.username} ({ticket.user.role})</p>
                        </div>
        
                        <div className="flex space-x-2 my-2">
                            {ticket.course && <span className="bg-blue-500 px-3 py-1 rounded-full text-sm text-white">{ticket.course.name}</span>}
                            {ticket.assignment && <span className="bg-green-500 px-3 py-1 rounded-full text-sm text-white">{ticket.assignment.name}</span>}
                        </div>
        
                        <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold text-white mr-2 mb-2 ${ticket.status === 'pending' ? 'bg-yellow-500' : 'bg-black'}`}>
                            Estado: {ticket.status === 'pending' ? 'Pendiente' : 'Cerrado'}
                        </span>
        
                        <div className="comments-section mt-5">
                            <h2 className="text-2xl font-bold text-white">Comentarios</h2>
                            <div className="mt-3 max-h-96 overflow-y-auto space-y-4 p-4 bg-gray-600 rounded">
                                {ticket.comments && ticket.comments.length > 0 ? (
                                    ticket.comments.map((comment) => (
                                        <div key={comment.id} className="bg-gray-500 p-3 rounded-lg">
                                            <p className="text-white">{comment.comment}</p>
                                            <p className="text-sm text-gray-200">Por: {comment.user.username} - {new Date(comment.created_at).toLocaleDateString()}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-white">No hay comentarios para este ticket.</p>
                                )}
                            </div>
                        </div>
    
                        {/* Botones de acción */}
                        <div className="flex justify-between my-5">
                            <button onClick={() => navigate(currentUser.role === 'student' ? '/homeStudent' : '/homeAdmin')} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
                                Regresar
                            </button>
                            
                            <button onClick={handleResponseTicket} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                Responder
                            </button>
    
                            {['admin', 'moderator'].includes(currentUser.role) && (
                                <button onClick={handleChangeState} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                                    Cambiar Estado
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <p className="text-white">Cargando detalles del ticket...</p>
                )}
            </div>
            {isModalOpen &&
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onAdd={handleAddComment}
                    comment={commentText}
                    setComment={setCommentText}
                />
            }
        </div>
    );
    
};

export default TicketDetails;
