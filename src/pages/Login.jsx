import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios"; // Asegúrate de tener axios instalado

const API_URL = "http://24.144.87.218";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {

            console.log("Enviando datos de inicio de sesión...");
            console.log(email);
            console.log(password);

            const response = await axios.post(`${API_URL}/api/login`, {
                email,
                password
            });

            console.log(response.data);

            const { token, user } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            console.log("Inicio de sesión exitoso");

            console.log(user)
            console.log(token)

            // Redirige basándote en el rol del usuario
            if (user.role === "admin") {
                console.log("Redirigiendo a /homeAdmin");
                navigate("/homeAdmin");
            } else if (user.role === "student") {
                navigate("/homeStudent");
            }

        } catch (error) {
            console.error("Error al iniciar sesión:", error.response?.data?.error || error.message);
        }
    };

    return (
        <div className="flex items-center justify-center w-screen h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
            <div className="w-full max-w-sm p-8 bg-gray-800 rounded-lg shadow-md">
                <h3 className="mb-8 text-3xl font-semibold text-center text-white">
                    Iniciar sesión
                </h3>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-white" htmlFor="email">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            placeholder="Correo Electrónico"
                            className="w-full px-4 py-3 mt-2 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-white">Contraseña</label>
                        <input
                            type="password"
                            placeholder="Contraseña"
                            className="w-full px-4 py-3 mt-2 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full px-4 py-3 text-sm font-medium text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
        
}

export default Login;
