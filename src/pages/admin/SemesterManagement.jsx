import { useState, useEffect } from 'react';
import Course from '../../models/Course';
import Assignment from '../../models/Assigment';

import axios from 'axios';

function SemesterManagement() {
    const [courses, setCourses] = useState([]);
    const [assignments, setAssignments] = useState({});
    const [expandedCourses, setExpandedCourses] = useState({});

    const [courseData, setCourseData] = useState({
        courseId: '',
        courseName: '',
        courseCode: '',
    });


    useEffect(() => {
        Course.list().then(setCourses);
    }, []);

    useEffect(() => {
        courses.forEach(course => {
        Assignment.getByCourseId(course.id).then(assgns => {
            setAssignments(prev => ({ ...prev, [course.id]: assgns }));
        });
        });
    }, [courses]);

    const toggleCourse = (courseId) => {
        setExpandedCourses(prevExpandedCourses => ({
        ...prevExpandedCourses,
        [courseId]: !prevExpandedCourses[courseId]
        }));
    };


    const handleAddCourse = async () => {

        event.preventDefault();

        let { courseId, courseName, courseCode } = courseData;

        const json = JSON.stringify({
            "name": courseName,
            "code": courseCode,
            "active": 1
        });
    
        try {
            const response = await axios.post('http://24.144.87.218/api/courses', json, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                setCourseData({
                    courseId: '',
                    courseName: '',
                    courseCode: '',
                });
            }
            
            Course.list().then(setCourses);

        }
        catch (error) {
            console.log(error);
        }
        
    };

    const handleModifyCourse = async () => {
        // Lógica para modificar un curso

        event.preventDefault();

        let { courseId, courseName, courseCode } = courseData;

        const json = JSON.stringify({
            "name": courseName,
            "code": courseCode,
            "active": 1
        });

        try {
            const response = await axios.put(`http://24.144.87.218/api/courses/${courseId}`, json, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                setCourseData({
                    courseId: '',
                    courseName: '',
                    courseCode: '',
                });
            }

            Course.list().then(setCourses);
        }
        catch (error) {
            console.log(error);
        }
    };

    const handleCourseActivation = async (course) => {

        event.preventDefault();

        const courseId = course.id;
        const courseName = course.name;
        const courseCode = course.code;

        // Si course.active es 1, entonces courseActive es 0
        const courseActive = course.active ? 0 : 1;

        const json = JSON.stringify({
            "name": courseName,
            "code": courseCode,
            "active": courseActive
        });

        console.log(json);

        try {
            const response = await axios.put(`http://24.144.87.218/api/courses/${courseId}`, json, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                setCourseData({
                    courseId: '',
                    courseName: '',
                    courseCode: '',
                });
            }

            Course.list().then(setCourses);
        }
        catch (error) {
            console.log(error);
        }
    };

    const handleAddAssignment = async (courseId) => {
        // Lógica para agregar una asignación a un curso

        event.preventDefault();

        // Se usan los mismos datos que en el formulario de agregar curso
        let { courseName, courseCode } = courseData;

        const json = JSON.stringify({
            "course_id": courseId,
            "name": courseName,
            "code": courseCode
        });

        console.log(json);

        try {
            const response = await axios.post(`http://24.144.87.218/api/assignments`, json, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                setCourseData({
                    courseId: '',
                    courseName: '',
                    courseCode: '',
                });
            }

            Course.list().then(setCourses);
        }
        catch (error) {
            console.log(error);
        }
    };

    const handleDeleteCourse = async (courseId) => {
        // Lógica para eliminar un curso

        event.preventDefault();

        try {
            console.log(courseId);
            const response = await axios.delete(`http://24.144.87.218/api/courses/${courseId}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log(response);

            if (response.status === 200) {
                Course.list().then(setCourses);
            }
        }
        catch (error) {
            if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
            }
            else if (error.request) {
                console.log(error.request);
            }
            else {
                console.log('Error', error.message);
            }
        }

    }

    const handleDeleteAssignment = (assignmentId) => {
        // Lógica para eliminar una asignación

        event.preventDefault();

        try {
            console.log(assignmentId);
            const response = axios.delete(`http://24.144.87.218/api/assignments/${assignmentId}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Upload the "assignments" state to delete the assignment from the UI
            for (let course in assignments) {
                let newAssignments = assignments[course].filter(assignment => assignment.id !== assignmentId);
                setAssignments(prev => ({ ...prev, [course]: newAssignments }));
            }

        }
        catch (error) {
            if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
            }
            else if (error.request) {
                console.log(error.request);
            }
            else {
                console.log('Error', error.message);
            }
        }
    }

    return (
        <div className="container p-4 m-0 h-auto bg-slate-950">
            <h2 className="text-3xl font-bold text-center text-white mb-6">Gestión del Semestre</h2>
    
            <div className="curso-container mx-auto w-3/4 bg-gray-800 p-6 rounded-lg shadow-lg mb-10">
                <h3 className="text-2xl font-semibold text-white mb-4">Cursos</h3>
    
                <form>
                    <div className="mb-4">
                        <label htmlFor="courseId" className="block text-white text-sm font-bold mb-2">ID del Curso:</label>
                        <input
                            type="text"
                            id="courseId"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                            value={courseData.courseId}
                            onChange={(e) => setCourseData({ ...courseData, courseId: e.target.value })}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="courseName" className="block text-white text-sm font-bold mb-2">Nombre:</label>
                        <input
                            type="text"
                            id="courseName"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                            value={courseData.courseName}
                            onChange={(e) => setCourseData({ ...courseData, courseName: e.target.value })}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="courseCode" className="block text-white text-sm font-bold mb-2">Código:</label>
                        <input
                            type="text"
                            id="courseCode"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                            value={courseData.courseCode}
                            onChange={(e) => setCourseData({...courseData, courseCode: e.target.value})}
                        />
                    </div>
    
                    <div className="flex justify-between mb-4">
                        <button onClick={handleAddCourse} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Agregar Curso</button>
                        <button onClick={handleModifyCourse} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Guardar Cambios</button>
                    </div>
                </form>
            </div>
            
            <div className=''>
                {courses.map(course => (
                    <div key={course.id} className="mb-6">
                        <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                            <button onClick={() => toggleCourse(course.id)} className="bg-blue-200 hover:bg-blue-300 text-gray-800 font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline">
                                {expandedCourses[course.id] ? '-' : '+'}
                            </button>
                            <div>
                                <span className="font-semibold">{course.name}</span> 
                                <span className="text-sm ml-2">({course.code})</span>
                            </div>
                            <div className="flex items-center">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={course.active}
                                        onChange={() => handleCourseActivation(course)}
                                        className="form-checkbox"
                                    />
                                    <span className="ml-2">Activo</span>
                                </label>
                                <button onClick={() => handleAddAssignment(course.id)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded mx-2 focus:outline-none focus:shadow-outline">Agregar Asig.</button>
                                <button onClick={() => handleDeleteCourse(course.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline">Eliminar</button>
                            </div>
                        </div>
    
                        {expandedCourses[course.id] && assignments[course.id] && (
                            <table className="w-full mt-4 rounded-lg">
                                <thead className="bg-gray-200 text-black">
                                    <tr>
                                        <th className="px-4 py-2">Nombre Asignación</th>
                                        <th className="px-4 py-2">Código</th>
                                        <th className="px-4 py-2">Acciones</th>
                                    </tr>
                                </thead>
                            <tbody>
                    {assignments[course.id].map(assgn => (
                        <tr key={assgn.id} className="bg-white border-b text-black">
                        <td className="px-4 py-2">{assgn.name}</td>
                        <td className="px-4 py-2">{assgn.code}</td>
                        <td className="px-4 py-2">
                            <button onClick={() => handleDeleteAssignment(assgn.id)} className="bg-red-500 text-black px-3 py-1 rounded">Eliminar</button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                )}
            </div>
            ))}
        </div>
        </div>
    );
}

export default SemesterManagement;
