/* eslint-disable react/prop-types */
import axios from 'axios';
import { useEffect } from 'react';

const FilterSection = ({ 
    activeCourses, 
    selectedActiveCourse, 
    setSelectedActiveCourse, 
    assignments,
    setAssignments,
    selectedAssignment, 
    setSelectedAssignment, 
    onSearchClick,
    selectedTicketStatus,
    setSelectedTicketStatus,
    selectedTicketOrdering,
    setSelectedTicketOrdering
}) => {


    const API_URL = "http://24.144.87.218";

    // Asegúrate de que se establece una opción por defecto para los cursos y las asignaciones
    useEffect(() => {
        // Opción por defecto para cursos
        setSelectedActiveCourse('0');
        
        // Opción por defecto para asignaciones
        setAssignments([{
            id: '0',
            name: "N/A"
        }]);

    }, []);

    // Función para manejar el cambio en el curso activo seleccionado
    const handleCourseChange = async (e) => {
        const courseId = e.target.value;

        console.log(`Curso seleccionado: ${courseId}`);
        setSelectedActiveCourse(courseId);

        if (courseId === '0' || courseId === 0 || courseId === 'N/A') {
            // Opción por defecto cuando no se ha seleccionado un curso específico
            setAssignments([{
                id: '0',
                name: "N/A"
            }]);
        } else {
            // Llamada a la API para obtener las asignaciones del curso seleccionado
            await axios.get(`${API_URL}/api/assignments/course/${courseId}`)
                .then((response) => {
                    const assignmentData = response.data.length > 0
                        ? response.data
                        : [{ id: '0', name: "No hay asignaciones" }];


                    // Si no existe una asignacion con id 0, añadimos una
                    if (!assignmentData.find((assignment) => assignment.id === '0')) {
                        assignmentData.unshift({ id: '0', name: "N/A" });
                    }

                    setAssignments(assignmentData);
                })
                .catch((err) => {
                    setAssignments([{ id: '0', name: "No se pudieron cargar las asignaciones" }]);
                });
        }
    };

    // Función para manejar el cambio en la asignación seleccionada
    const handleAssignmentChange = (e) => {
        setSelectedAssignment(e.target.value);
    };

    // Opciones de filtros y ordenamiento
    const ticketStatusOptions = ['Todos', 'Pendiente', 'Cerrado'];
    const sortingOptions = ['Título A-Z', 'Título Z-A', 'Más Antiguos', 'Más Recientes'];

    const handleTicketStatusChange = (e) => {
        setSelectedTicketStatus(e.target.value);
    }

    const handleTicketOrderingChange = (e) => {
        setSelectedTicketOrdering(e.target.value);
    }

    return (
        <div className="flex flex-wrap items-center justify-between p-4 bg-gray-800 text-white">
            {/* Dropdown para cursos activos */}
            <div className="flex flex-col mx-2">
                <label htmlFor="activeCourse" className="mb-2 font-bold">Curso Activo</label>
                <select
                    id="activeCourse"
                    value={selectedActiveCourse}
                    onChange={handleCourseChange}
                    className="dropdown bg-gray-700 border border-gray-600 text-white rounded p-2"
                >
                    {activeCourses.map((course) => (
                        <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                </select>
            </div>

            {/* Dropdown para asignaciones */}
            <div className="flex flex-col mx-2">
                <label htmlFor="assignment" className="mb-2 font-bold">Asignación</label>
                <select
                    id="assignment"
                    value={selectedAssignment}
                    onChange={handleAssignmentChange}
                    className="dropdown bg-gray-700 border border-gray-600 text-white rounded p-2"
                >
                    {assignments.map((assignment) => (
                        <option key={assignment.id} value={assignment.id}>{assignment.name}</option>
                    ))}
                </select>
            </div>

            {/* Dropdown para estado de los tiquetes */}
            <div className="flex flex-col mx-2">
                <label htmlFor="ticketStatus" className="mb-2 font-bold">Estado del Tiquete</label>
                <select
                    id="ticketStatus"
                    value={selectedTicketStatus}
                    onChange={handleTicketStatusChange}
                    className="dropdown bg-gray-700 border border-gray-600 text-white rounded p-2"
                >
                    {ticketStatusOptions.map((status, index) => (
                        <option key={index} value={status}>{status}</option>
                    ))}
                </select>
            </div>

            {/* Dropdown para ordenar */}
            <div className="flex flex-col mx-2">
                <label htmlFor="sorting" className="mb-2 font-bold">Ordenar por</label>
                <select
                    id="sorting"
                    value={selectedTicketOrdering}
                    onChange={handleTicketOrderingChange}
                    className="dropdown bg-gray-700 border border-gray-600 text-white rounded p-2"
                >
                    {sortingOptions.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                    ))}
                </select>
            </div>

            <button onClick={onSearchClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2">
                Buscar
            </button>
        </div>
    );
        
};

export default FilterSection;
