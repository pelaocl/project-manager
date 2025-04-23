import axios from 'axios';

// Obtener la URL base de la API desde las variables de entorno de Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

console.log("API Base URL:", API_BASE_URL); // Para depuración

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptor para añadir el Token JWT a las peticiones ---
apiClient.interceptors.request.use(
  (config) => {
    // Obtener el token (ej. desde localStorage o Zustand store)
    const token = localStorage.getItem('authToken'); // O usa tu store de Zustand
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Interceptor de respuestas (opcional, ej. para manejar errores 401 globalmente) ---
apiClient.interceptors.response.use(
    (response) => response, // Simplemente devuelve la respuesta si es exitosa
    (error) => {
        if (error.response && error.response.status === 401) {
            // Ej: Token inválido o expirado
            console.error("Error 401: No autorizado. Redirigiendo a login...");
            // Aquí podrías llamar a una función de logout global de tu store
            // y redirigir al usuario al login.
            localStorage.removeItem('authToken'); // Ejemplo simple
            // window.location.href = '/login'; // Redirección simple
        }
        // Propagar el error para manejo local si es necesario
        return Promise.reject(error);
    }
);


export default apiClient;