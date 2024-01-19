import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import "../../App.css"
import SemesterManagement from './SemesterManagement';
import axios from 'axios';
import TicketsPage from './TicketsPage';
import UserManagement from './UserManagement';

function HomeAdmin() {
    const [user, setUser] = useState(null);
    const [selectedOption, setSelectedOption] = useState('Tickets');
    const navigate = useNavigate();

    const API_URL = "http://24.144.87.218/api/verifyToken";

    useEffect(() => {
        const verifyToken = async () => {
            let token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            try {
                const response = await axios.get(API_URL, {
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

    const handleLogout = () => {
        // Aquí puedes añadir lógica para manejar la lista negra de tokens en el servidor si es necesario
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    if (!user) {
        return (
            <div className="flex justify-center items-center h-screen ">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="flex w-screen h-screen relative">
            {/* Botón para cerrar sesión */}
            <button
                className="absolute bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full shadow-lg"
                onClick={handleLogout}
                style={{ zIndex: 1000 }}
            >
                Cerrar Sesión
            </button>

            {/* Sidebar */}
            <div className="w-64 h-screen shadow-md bg-gray-700 px-1 fixed">
                <h2 className="text-xl font-semibold text-white text-center p-4">Admin Dashboard</h2>
                <nav className="flex flex-col p-4">
                <button
                    className={`p-2 my-2 text-white hover:text-gray-200 hover:bg-blue-500 ${selectedOption === 'Tickets' ? 'bg-blue-500 text-white' : ''}`}
                    onClick={() => setSelectedOption('Tickets')}
                >
                    Tickets
                </button>
                <button
                    className={`p-2 my-2 text-white hover:text-gray-200 hover:bg-blue-500 ${selectedOption === 'Semester Management' ? 'bg-blue-500 text-white' : ''}`}
                    onClick={() => setSelectedOption('Semester Management')}
                >
                    Semester Management
                </button>
                <button
                    className={`p-2 my-2 text-white hover:text-gray-200 hover:bg-blue-500 ${selectedOption === 'User Management' ? 'bg-blue-500 text-white' : ''}`}
                    onClick={() => setSelectedOption('User Management')}
                >
                    User Management
                </button>
                </nav>
            </div>

        {/* Contenido principal */}
            <div className="container mx-auto ml-64 bg-slate-950 overflow-x-hidden pb-8">
                {/* Contenido específico de la opción seleccionada */}
                {selectedOption === 'Tickets' && (
                <div className='bg-blue'>
                    <TicketsPage />
                </div>
                )}
                {selectedOption === 'Semester Management' && (
                <div className='bg-blue'>
                    <SemesterManagement />
                </div>
                )}
                {selectedOption === 'User Management' && (
                <div className='bg-blue'>
                    <UserManagement />
                </div>
                )}
            </div>
        </div>
    );
}

export default HomeAdmin;
