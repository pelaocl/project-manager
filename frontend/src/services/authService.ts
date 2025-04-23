import apiClient from './api';
import { LoginInput } from '../../../backend/src/schemas/auth.schema'; // Reutilizar tipo del backend? O definir uno local.
                                                                      // Mejor definir uno local para desacoplar frontend/backend.

// Definir tipo local para los datos de entrada del login
interface FrontendLoginInput {
    email: string;
    password: string;
}

// Definir tipo local para la respuesta esperada del backend
interface LoginResponse {
    message: string;
    token: string;
    user: {
        id: number;
        email: string;
        name: string;
        role: string;
    };
}

export const login = async (credentials: FrontendLoginInput): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  } catch (error: any) {
    // Propagar o manejar el error específico de login
    console.error("Error en servicio de login:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al intentar iniciar sesión.');
  }
};

// Aquí podrían ir otras funciones como register, forgotPassword, etc.