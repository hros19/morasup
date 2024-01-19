import { useState, useEffect } from 'react';
import axios from 'axios';

import FilterSection from '../../components/FilterSection';
import TicketsSection from '../../components/TicketsSection';
import { useNavigate } from 'react-router-dom';

const HomeStudent = () => {
    // Estados y funciones existentes
    const [user, setUser] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [activeCourses, setActiveCourses] = useState([]);
    const [selectedActiveCourse, setSelectedActiveCourse] = useState('N/A');
    const [selectedAssignment, setSelectedAssignment] = useState('N/A');
    const [assignments, setAssignments] = useState([]);
    const [newTicket, setNewTicket] = useState({ title: '', description: '', assignment_id: null, course_id: null });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedTicketStatus, setSelectedTicketStatus] = useState('Todos');
    const [selectedTicketOrdering, setSelectedTicketOrdering] = useState('Título A-Z');

    // estados para el modal para cursos y asignaciones
    const [modalSelectedActiveCourse, setModalSelectedActiveCourse] = useState(null);
    const [modalAssignments, setModalAssignments] = useState([]);
    const [modalSelectedAssignment, setModalSelectedAssignment] = useState(null);

    const navigate = useNavigate();

    const orderMappings = {
        'Título A-Z': { field: 'title', direction: 'ASC' },
        'Título Z-A': { field: 'title', direction: 'DESC' },
        'Más Antiguos': { field: 'created_at', direction: 'ASC' },
        'Más Recientes': { field: 'created_at', direction: 'DESC' }
    };
    

    // ... useEffect y funciones existentes ...
    const API_URL = "http://24.144.87.218";

    const fetchTickets = async () => {
        try {

            if (!user) {
                return;
            }

            console.log("Traer tiquetes del usuario: " + user.id);
            const response = await axios.get(`${API_URL}/api/tickets/user/${user.id}`);

            console.log("Traer tiquetes del usuario: " + user.id);
            console.log(response.data);

            setTickets(response.data.tickets);
        } catch (err) {
            console.log("Error al traer los tiquetes del usuario: " + user.id);
        }
    };

    const fetchActiveCourses = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/courses/active`);

            response.data.unshift({ id: 0, name: 'N/A' });
            setActiveCourses(response.data);

            if (response.data.length > 0) {
                setSelectedActiveCourse(response.data[0].id);
            }
        }
        catch (err) {
            // setError('Error fetching active courses');
        }
    };

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/api/verifyToken`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Si el token es válido y el usuario es estudiante
                const userData = response.data.user;
                if (userData && userData.role === 'student') {
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
        fetchTickets();
        fetchActiveCourses();
    }, [user]);
    
    if (user && user.role !== 'student') {
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

    if (!tickets) {
        return (
            <div className="flex justify-center items-center h-screen ">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleSearch = async () => {
        console.log("Buscando...");
    
        const userId = user.id;
        const ordering = orderMappings[selectedTicketOrdering];
    
        let params = new URLSearchParams();

        if (selectedAssignment !== '0' && selectedAssignment !== 'N/A' && selectedAssignment !== 0) {
            params.append('assignment_id', selectedAssignment);
        }

        if (selectedActiveCourse !== '0' && selectedActiveCourse !== 'N/A' && selectedActiveCourse !== 0) {
            params.append('course_id', selectedActiveCourse);
        }

        let status = null;

        if (selectedTicketStatus !== 'Todos') {
            if (selectedTicketStatus === 'Pendiente') {
                status = 'pending';
            }
            else if (selectedTicketStatus === 'Cerrado') {
                status = 'closed';
            }
        }
        if (status) {
            params.append('status', status);
        }

        params.append('order_by_field', ordering.field);
        params.append('order_by_direction', ordering.direction);
        params.append('page', 1);
        params.append('page_size', 100);

        const url = `${API_URL}/api/tickets/user/${userId}?${params}`;

        console.log(url);
    
        try {
            const response = await axios.get(`${API_URL}/api/tickets/user/${userId}?${params}`);
            setTickets(response.data);
        } catch (error) {
            console.error('Error al obtener los tickets:', error);
            // Aquí puedes manejar el error como lo consideres apropiado
        }
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Verifica que el usuario esté definido
        if (!user) {
            console.error('Error: No user data available');
            return;
        }
    
        // Verifica que los campos necesarios estén presentes
        if (!newTicket.title || !newTicket.description) {
            console.error('Error: Title and description are required');
            return;
        }
    
        try {
            const response = await axios.post(`${API_URL}/api/tickets`, {
                user_id: user.id,
                assignment_id: newTicket.assignment_id, // Puede ser null
                course_id: newTicket.course_id, // Puede ser null
                title: newTicket.title,
                description: newTicket.description
            });
    
            if (response.status === 201) {
                console.log('Ticket created successfully:', response.data);
                // Aquí puedes limpiar el formulario o realizar acciones adicionales
                setNewTicket({ title: '', description: '', assignment_id: null, course_id: null });
                fetchTickets();
            } else {
                console.error('Failed to create ticket:', response.data);
            }
        } catch (error) {
            console.error('Error creating ticket:', error);
        }
    }    

    const handleModalCourseChange = async (e) => {
        setModalSelectedActiveCourse(e.target.value);
        setNewTicket({ ...newTicket, course_id: e.target.value });
        try {
            const response = await axios.get(`${API_URL}/api/assignments/course/${e.target.value}`);

            const id = modalSelectedActiveCourse;

            // Inicializar la lista de asignaciones con la opción 'N/A'
            const initialAssignments = [{ id: 0, name: 'N/A' }];

            if (id !== 0 && id !== '0' && id !== 'N/A') {
                // Añadir las asignaciones al principio de la lista si hay un curso seleccionado válido
                const assignments = response.data;
                initialAssignments.push(...assignments);
            }

            // Establecer las asignaciones en el estado
            setModalAssignments(initialAssignments);

            // Establecer la asignación seleccionada en el estado (selecciona 'N/A' por defecto)
            setModalSelectedAssignment(initialAssignments[0].id);

        
            //setModalAssignments(response.data);
        } catch (err) {

            // Si el id actual es 0, entonces no hay asignaciones, poner el mensaje de error "Seleccione un curso"
            if (modalSelectedActiveCourse === 0 || modalSelectedActiveCourse === '0' || modalSelectedActiveCourse === 'N/A') {
                setModalAssignments([{ id: 0, name: 'N/A' }]);
                return;
            }

            setModalAssignments([
                {
                    id: 0,
                    name: 'N/A'
                }
            ]);
        }
    }

    const handleModalSelectedAssignment = (assignmentId) => {

        console.log("Asignación seleccionada: " + assignmentId);

        if (assignmentId === 0 || assignmentId === '0' || assignmentId === 'N/A') {
            setModalSelectedAssignment(0);
            setNewTicket({ ...newTicket, assignment_id: null });
            return;
        }
        setModalSelectedAssignment(assignmentId);
        setNewTicket({ ...newTicket, assignment_id: assignmentId });
    }

    const toggleModal = async () => { 
        setIsModalOpen(!isModalOpen);

        // Si el modal se está abriendo, setear el primer curso de la lista como el curso activo seleccionado
        if (!isModalOpen) {
            if (activeCourses.length > 0) {
                setModalSelectedActiveCourse(activeCourses[0].id);
                setModalAssignments([{ id: 0, name: 'N/A' }]);
            }

            try {
                // Traer las asignaciones del primer curso de la lista
                const response = await axios.get(`${API_URL}/api/assignments/course/${activeCourses[0].id}`);

                // Si el curso actual seleccionado tiene id 0, entonces no hay asignaciones
                if (modalSelectedActiveCourse === 0 || modalSelectedActiveCourse === '0' || modalSelectedActiveCourse === 'N/A') {
                    setModalAssignments([{ id: 0, name: 'N/A' }]);
                    return;
                }

                // Si no hay asignaciones, poner el mensaje de error "Seleccione un curso"
                if (response.data.length === 0) {
                    setModalAssignments([{ id: 0, name: 'N/A' }]);
                    return;
                }

                // Antes de setear, poner como la primera opcion como "Seleccione una asignación"
                response.data.unshift({ id: 0, name: 'N/A' });

                setModalAssignments(response.data);

                // Por defecto, seleccionar la primera asignación de la lista solo si hay asignaciones
                if (response.data.length > 0) {
                    setModalSelectedAssignment(response.data[0].id);
                }

                console.log(0);

            }
            catch (error) {
                //console.error('Error al traer las asignaciones del curso seleccionado:', error);

                // Si el id actual es 0, entonces no hay asignaciones, poner el mensaje de error "Seleccione un curso"
                if (modalSelectedActiveCourse === 0 || modalSelectedActiveCourse === '0' || modalSelectedActiveCourse === 'N/A') {
                    setModalAssignments([{ id: 0, name: 'N/A' }]);
                    return;
                }
            }
            
        }
    };

    const onTicketClick = async (ticket) => {
        const token = localStorage.getItem('token'); // Obtener el token JWT
    
        // Verificar primero si el token es válido
        try {
            const verifyResponse = await axios.get(`${API_URL}/api/verifyToken`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            // Si el token es válido, proceder con la lógica adicional
            if (verifyResponse.status === 200) {
                // Verificar si el usuario tiene el rol adecuado y es el propietario del ticket o es un administrador/moderador
                if (user && (user.role === 'student' && user.id === ticket.user_id) || user.role === 'moderator' || user.role === 'admin') {
                    // Aquí se puede añadir lógica adicional si es necesario
                    // Por ejemplo, redireccionar a una página de detalles del ticket
                    navigate(`/ticket-details/${ticket.id}`, { state: { ticketDetails: ticket } });
                } else {
                    console.error('Acceso denegado. Usuario no autorizado para ver este ticket.');
                    // Manejar la situación de acceso denegado
                }
            } else {
                console.error('Token no válido o expirado');
                // Manejar el error de token inválido o expirado
            }
        } catch (error) {
            console.error('Error al verificar el token:', error);
            // Manejar el error de la verificación del token
        }
    };

    return (
        <div className="container p-4 w-screen h-screen bg-slate-950 relative overflow-hidden">

            {/* Botón para cerrar sesión */}
            <button
                className="absolute bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full shadow-lg"
                onClick={handleLogout}
                style={{ zIndex: 1000 }}
            >
                Cerrar Sesión
            </button>

            <h1 className="text-2xl font-bold mb-4 text-white">Student Dashboard</h1>
            <button onClick={toggleModal} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4">
                Crear Tiquete
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 overflow-auto">
                    <div className="bg-gray-950 rounded-lg w-1/2 m-20 top-20">
                    <div className="flex justify-between items-center border-b p-3 text-xl">
                        <h3 className="text-lg font-semibold">Crear Tiquete</h3>
                        <button onClick={toggleModal}>&times;</button>
                    </div>
                    <div className="p-3">
                        <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-white text-sm font-bold mb-2" htmlFor="title">
                            Título
                            </label>
                            <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                            id="title"
                            type="text"
                            placeholder="Introduce el título"
                            value={newTicket.title}
                            onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-white text-sm font-bold mb-2" htmlFor="description">
                            Descripción
                            </label>
                            <textarea
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                            id="description"
                            placeholder="Introduce una descripción"
                            value={newTicket.description}
                            onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                            maxLength={510}
                            style={
                                {
                                    resize: 'none',
                                    height: '100px'
                                }
                            }
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-white text-sm font-bold mb-2" htmlFor="course">
                            Curso
                            </label>
                            <select
                            className="shadow border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                            id="course"
                            value={modalSelectedActiveCourse}
                            onChange={e => handleModalCourseChange(e)}
                            >
                            {activeCourses.map((course) => (
                                <option key={course.id} value={course.id}>{course.name}</option>
                            ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-white text-sm font-bold mb-2" htmlFor="assignment">
                            Asignación
                            </label>
                            <select
                            className="shadow border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                            id="assignment"
                            value={modalSelectedAssignment}
                            onChange={e => handleModalSelectedAssignment(e.target.value)}
                            disabled={!modalSelectedActiveCourse}
                            >
                            {modalAssignments.map((assignment) => (
                                <option key={assignment.id} value={assignment.id}>{assignment.name}</option>
                            ))}
                            </select>
                        </div>
                        <div className="flex items-center justify-between">
                            <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                            >
                            Enviar Tiquete
                            </button>
                            <button
                            className="bg-red-700 hover:bg-red-900 text-white font-semibold py-2 px-4 border border-gray-500 rounded"
                            type="button"
                            onClick={toggleModal}
                            >
                            Cancelar
                            </button>
                        </div>
                        </form>
                    </div>
                    </div>
                </div>
            )}

            <FilterSection 
                activeCourses={activeCourses} 
                selectedActiveCourse={selectedActiveCourse} 
                setSelectedActiveCourse={setSelectedActiveCourse}
                assignments={assignments}
                selectedAssignment={selectedAssignment}
                setSelectedAssignment={setSelectedAssignment}
                onSearchClick={handleSearch}
                setAssignments={setAssignments}
                selectedTicketStatus={selectedTicketStatus}
                setSelectedTicketStatus={setSelectedTicketStatus}
                selectedTicketOrdering={selectedTicketOrdering}
                setSelectedTicketOrdering={setSelectedTicketOrdering}
            />

            {/* Contenedor de tiquetes con overflow y padding */}
            <div className="tickets-section overflow-y-auto pb-10" style={{ maxHeight: 'calc(100vh - 150px)' }}>
                {/* Aquí va el contenido de los tiquetes */}
                <TicketsSection tickets={tickets} onTicketClick={onTicketClick} />
            </div>
        </div>
    );
};

export default HomeStudent;

