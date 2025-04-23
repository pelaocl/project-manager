import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // Para persistir en localStorage

// Definir la forma de los datos del usuario que guardaremos
interface UserData {
  id: number;
  email: string;
  name: string;
  role: string; // 'ADMIN', 'COORDINADOR', 'USUARIO'
  // Añadir etiquetas si las necesitas globalmente: etiquetas: { nombre: string, color: string }[]
}

// Definir el estado y las acciones del store
interface AuthState {
  token: string | null;
  user: UserData | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: UserData) => void;
  logout: () => void;
}

// Crear el store con persistencia en localStorage
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      // Acción para establecer la autenticación (después del login exitoso)
      setAuth: (token, user) => {
        set({ token, user, isAuthenticated: true });
        // También guardamos en localStorage directamente aquí por si acaso
        // aunque el middleware 'persist' ya lo hace.
        // Opcional: puedes quitar el middleware persist y manejar localStorage aquí manualmente.
        localStorage.setItem('authToken', token);
      },

      // Acción para limpiar la autenticación (logout)
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
        localStorage.removeItem('authToken');
        // Opcional: Limpiar otros datos persistidos si los hubiera
        // window.location.href = '/login'; // O manejar redirección en otro lugar
      },
    }),
    {
      name: 'auth-storage', // Nombre para el item en localStorage
      storage: createJSONStorage(() => localStorage), // Usar localStorage
      // Opcional: especificar qué partes del estado persistir
      // partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Inicializar el estado desde localStorage al cargar la app (si no se usa middleware persist)
// Esto es útil si NO usas el middleware 'persist' o quieres control más fino.
// Si usas 'persist', esto es redundante.
/*
const initialToken = localStorage.getItem('authToken');
if (initialToken) {
  // Aquí necesitarías una forma de obtener los datos del usuario asociados al token,
  // por ejemplo, haciendo una llamada a un endpoint '/api/auth/me' al cargar la app
  // o decodificando el token (si es seguro y contiene los datos necesarios).
  // Por simplicidad, el middleware 'persist' es más directo si contiene user data.
}
*/