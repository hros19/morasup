import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TicketsPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [activeCourses, setActiveCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [selectedTicketState, setSelectedTicketState] = useState('Todos');
    const [selectedTicketOrdering, setSelectedTicketOrdering] = useState('Más Recientes');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    const ticketStates = ['Todos', 'Pendiente', 'Cerrado'];
    const sortingOptions = ['Título A-Z', 'Título Z-A', 'Más Antiguos', 'Más Recientes'];

    const API_URL = "http://24.144.87.218";

    // Revisar si la url actual es distinta de /homeAdmin
    // Si es distinta, navegar a /homeAdmin

    if (window.location.pathname !== '/homeAdmin') {
        navigate('/homeAdmin');
    }

    useEffect(() => {
        const init = async () => {
            await verifyTokenAndLoadData();
            await loadActiveCourses();
            await loadTickets();
        };
        init();
    }, []);

    useEffect(() => {
        loadTickets(); // Llama a loadTickets cada vez que cambian los filtros o la página
    }, [selectedCourse, selectedAssignment, selectedTicketState, selectedTicketOrdering, currentPage]);

    useEffect(() => {
        console.log('Cambio en total de páginas:', totalPages);
        console.log('Typeof:', typeof totalPages);
    }, [totalPages]);


    const handleAssignmentChange = (e) => {
        setSelectedAssignment(e.target.value);
    };

    const handleTicketStatusChange = (e) => {
        setSelectedTicketState(e.target.value);
    };

    const handleTicketOrderingChange = (e) => {
        setSelectedTicketOrdering(e.target.value);
    };

    const verifyTokenAndLoadData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        try {
            const verifyResponse = await axios.get(`${API_URL}/api/verifyToken`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const userData = verifyResponse.data.user;
            if (userData && (userData.role === 'admin' || userData.role === 'moderator')) {
                setUser(userData);
                loadActiveCourses();
                // Cargar tiquetes aquí si es necesario
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Error al verificar el token:', error);
            navigate('/');
        }
    };

    const loadActiveCourses = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/courses/active`);
            if (response.status === 200) {
                setActiveCourses([{ id: 'N/A', name: 'N/A' }, ...response.data]);
            } else {
                throw new Error('No se pudieron obtener los cursos activos');
            }
        } catch (error) {
            console.error('Error al cargar cursos:', error);
        }
    };

    const handleCourseChange = async (e) => {
        const courseId = e.target.value;
        setSelectedCourse(courseId);

        if (courseId === 'N/A') {
            setAssignments([{ id: 'N/A', name: 'N/A' }]);
            return;
        }

        // Cargar asignaciones para el curso seleccionado
        try {
            const response = await axios.get(`${API_URL}/api/assignments/course/${courseId}`);
            if (response.status === 200) {
                setAssignments([{ id: 'N/A', name: 'N/A' }, ...response.data]);
            } else {
                throw new Error('No se pudieron obtener las asignaciones');
            }
        } catch (error) {
            console.error('Error al cargar asignaciones:', error);
        }
    };

    const loadTickets = async () => {
        try {

            console.log('Cargando tiquetes...');

            let selectedCourseApiParam = null;
            let selectedAssignmentApiParam = null;

            // Si el curso o asignación es null o es 'N/A', no se incluye en la petición
            if (selectedCourse !== 'N/A' && selectedCourse !== null) {
                selectedCourseApiParam = selectedCourse;
            }

            if (selectedAssignment !== 'N/A' && selectedAssignment !== null) {
                selectedAssignmentApiParam = selectedAssignment;
            }

            if (currentPage < 1 || currentPage > totalPages) {
                console.log(currentPage, totalPages);
                return;
            }

            if (!ticketStates.includes(selectedTicketState) || !sortingOptions.includes(selectedTicketOrdering)) {
                return;
            }

            let statusParam = null;

            if (selectedTicketState === 'Pendiente') {
                statusParam = 'pending';
            } else if (selectedTicketState === 'Cerrado') {
                statusParam = 'closed';
            }

            let orderByField = 'id';
            let orderByDirection = 'ASC';

            switch (selectedTicketOrdering) {
                case 'Título A-Z':
                    orderByField = 'title';
                    orderByDirection = 'ASC';
                    break;
                case 'Título Z-A':
                    orderByField = 'title';
                    orderByDirection = 'DESC';
                    break;
                case 'Más Antiguos':
                    orderByField = 'created_at';
                    orderByDirection = 'ASC';
                    break;
                case 'Más Recientes':
                    orderByField = 'created_at';
                    orderByDirection = 'DESC';
                    break;
                default:
                    // Mantén los valores por defecto si la opción seleccionada no es reconocida
                    break;
            }

            let params = new URLSearchParams({
                order_by_field: orderByField,
                order_by_direction: orderByDirection,
                page: currentPage,
                page_size: 10
            });

            if (selectedCourseApiParam) {
                params.append('course_id', selectedCourseApiParam);
            }

            if (selectedAssignmentApiParam) {
                params.append('assignment_id', selectedAssignmentApiParam);
            }

            if (statusParam && statusParam !== 'Todos') {
                params.append('status', statusParam);
            }

            console.log('Parámetros de la URL:', params.toString());


            const response = await axios.get(`${API_URL}/api/tickets`, { params });

            console.log(response.data);

            if (response.status === 200) {
                setTickets(response.data.tickets);
                //setTotalPages(response.data.pages_count);

                // console.log('Tiquetes cargados');
                // console.log("Total de páginas:", totalPages);
                // console.log("Total segun api:", response.data.pages_count)

                if (response.data.pages_count.pages_count < 1) {
                    setTotalPages(1);
                } else {

                    setTotalPages(response.data.pages_count.pages_count);
                }

            } else {
                console.log('No se pudieron cargar los tiquetes');
            }
        } catch (error) {
            console.error('Error al cargar tiquetes:', error);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleTicketClick = (ticketId) => {
        // Navegar a una página de detalles o realizar otra acción al hacer clic en un tiquete
        console.log(`Tiquete clickeado: ${ticketId}`);
        navigate(`/ticket-details/${ticketId}`);
    };

    const renderTickets = () => {
        return tickets.map((ticket) => (
            <div
                key={ticket.id}
                className="bg-gray-600 p-4 rounded-lg shadow hover:bg-gray-500 cursor-pointer transition duration-300 m-5 relative"
                onClick={() => handleTicketClick(ticket.id)}
            >
                <h3 className="text-xl text-white font-bold">{ticket.title}</h3>
                <p className="text-gray-300">{ticket.description}</p>
                <div className="flex items-center text-sm text-white mt-2 mb-6">
                    {ticket.course && <span className="bg-blue-500 px-2 py-1 rounded-full mr-2">{ticket.course.name}</span>}
                    {ticket.assignment && <span className="bg-green-500 px-2 py-1 rounded-full">{ticket.assignment.name}</span>}
                </div>
                {/* Usuario y fecha en la parte inferior izquierda */}
                <div className="absolute bottom-2 left-4 text-sm text-gray-300">
                    <span>{ticket.user.username} - {new Date(ticket.created_at).toLocaleDateString()}</span>
                </div>
                {/* Estado del ticket en la esquina inferior derecha */}
                <div className={`absolute bottom-2 right-4 ${ticket.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'} text-white text-sm font-semibold px-2 py-1 rounded-full`}>
                    {ticket.status === 'pending' ? 'Pendiente' : 'Cerrado'}
                </div>
            </div>
        ));
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
    

    // Renderiza la lista de tiquetes y los controles para filtrado y paginación
    return (
        <div className="tickets-page-container">
            {/* Controles para el filtrado y ordenación */}
            <div className="flex flex-wrap justify-between items-center mb-4 bg-gray-800 p-4 rounded-lg shadow m-5">
                {/* Dropdown para cursos activos */}
                <div className="flex flex-col mx-2 mb-4 md:mb-0">
                    <label htmlFor="course-select" className="text-sm text-gray-300 mb-2">Curso</label>
                    <select
                        id="course-select"
                        className="border border-gray-400 bg-gray-700 text-white rounded-md p-2"
                        value={selectedCourse}
                        onChange={handleCourseChange}
                    >
                        {activeCourses.map((course) => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                        ))}
                    </select>
                </div>

                {/* Dropdown para asignaciones */}
                <div className="flex flex-col mx-2 mb-4 md:mb-0">
                    <label htmlFor="assignment-select" className="text-sm text-gray-300 mb-2">Asignación</label>
                    <select
                        id="assignment-select"
                        className="border border-gray-400 bg-gray-700 text-white rounded-md p-2"
                        value={selectedAssignment}
                        onChange={handleAssignmentChange}
                    >
                        {assignments.map((assignment) => (
                            <option key={assignment.id} value={assignment.id}>{assignment.name}</option>
                        ))}
                    </select>
                </div>

                {/* Dropdown para estado de tiquetes */}
                <div className="flex flex-col mx-2 mb-4 md:mb-0">
                    <label htmlFor="status-select" className="text-sm text-gray-300 mb-2">Estado</label>
                    <select
                        id="status-select"
                        className="border border-gray-400 bg-gray-700 text-white rounded-md p-2"
                        value={selectedTicketState}
                        onChange={handleTicketStatusChange}
                    >
                        {ticketStates.map((state) => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                </div>

                {/* Dropdown para ordenamiento */}
                <div className="flex flex-col mx-2">
                    <label htmlFor="sorting-select" className="text-sm text-gray-300 mb-2">Ordenar por</label>
                    <select
                        id="sorting-select"
                        className="border border-gray-400 bg-gray-700 text-white rounded-md p-2"
                        value={selectedTicketOrdering}
                        onChange={handleTicketOrderingChange}
                    >
                        {sortingOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            </div>

            
            {/* Lista de tiquetes */}
            <div className="tickets-list mt-4">
                {renderTickets()}
            </div>

            {/* Controles de paginación */}
            <div className="pagination-controls m-8">
                {getPaginationRange(currentPage, totalPages).map((page, index) => (
                    <button
                        key={index}
                        onClick={() => page !== "..." && handlePageChange(page)}
                        className={`mx-1 ${page === currentPage ? 'text-blue-600' : 'text-gray-600'} ${page === "..." ? 'cursor-default' : ''}`}
                    >
                        {page}
                    </button>
                ))}
            </div>

        </div>
    );
};

export default TicketsPage;
