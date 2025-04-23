import React, { Suspense } from 'react'; // <-- Añadir Suspense
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Importar solo lo necesario directamente
import LoginPage from '../pages/LoginPage';
import { useAuthStore } from '../store/authStore';
import { Box, CircularProgress } from '@mui/material';

// --- Componente ProtectedRoute (sin cambios) ---
type ProtectedRouteProps = { children: JSX.Element; };
function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    // console.log("[ProtectedRoute] Check. isAuthenticated:", isAuthenticated);
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// --- Componente PlaceholderComponent (sin cambios) ---
type PlaceholderComponentProps = { title: string; };
function PlaceholderComponent({ title }: PlaceholderComponentProps): JSX.Element {
    return ( <div> <h2>{title}</h2> <p>Página en construcción.</p> </div> );
}

// --- Componente de Carga para Suspense (sin cambios) ---
function LoadingFallback() {
    return ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}> <CircularProgress /> </Box> );
}

// --- >>> Importaciones Dinámicas para TODAS las páginas principales <<< ---
const ProjectListPage = React.lazy(() => import('../pages/ProjectListPage'));
const ProjectDetailPage = React.lazy(() => import('../pages/ProjectDetailPage'));
const ProjectCreatePage = React.lazy(() => import('../pages/ProjectCreatePage'));
const ProjectEditPage = React.lazy(() => import('../pages/ProjectEditPage')); // Mantener activa
// const DashboardPage = React.lazy(() => import('../pages/DashboardPage')); // Futuro
// const AdminPage = React.lazy(() => import('../pages/AdminPage')); // Futuro


// --- Componente Principal AppRoutes ---
const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      {/* Envolver TODAS las rutas (o al menos las que usan lazy) en UN Suspense */}
      <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Pública */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protegidas (Ahora todas usan Suspense implícitamente) */}
            <Route path="/" element={ <ProtectedRoute> <ProjectListPage /> </ProtectedRoute> } />
            <Route path="/projects/new" element={ <ProtectedRoute> <ProjectCreatePage /> </ProtectedRoute> } />
            <Route path="/projects/:id" element={ <ProtectedRoute> <ProjectDetailPage /> </ProtectedRoute> } />
            <Route path="/projects/:id/edit" element={ <ProtectedRoute> <ProjectEditPage /> </ProtectedRoute> } />

            {/* Otras rutas (Placeholders, no necesitan lazy/Suspense si son simples) */}
            <Route path="/dashboard" element={ <ProtectedRoute> <PlaceholderComponent title="Dashboard"/> </ProtectedRoute> } />
            <Route path="/admin" element={ <ProtectedRoute> <PlaceholderComponent title="Administración"/> </ProtectedRoute> } />

            {/* Not Found */}
            <Route path="*" element={<PlaceholderComponent title="404 - Página No Encontrada" />} />

          </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;