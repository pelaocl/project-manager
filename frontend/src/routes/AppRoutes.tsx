import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import ProjectListPage from '../pages/ProjectListPage';
import ProjectDetailPage from '../pages/ProjectDetailPage';
import ProjectCreatePage from '../pages/ProjectCreatePage';
// import ProjectEditPage from '../pages/ProjectEditPage'; // <-- Comentado
import { useAuthStore } from '../store/authStore';

// --- Componente ProtectedRoute ---
type ProtectedRouteProps = { children: JSX.Element; };
function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    // console.log("[ProtectedRoute] Check. isAuthenticated:", isAuthenticated); // Log opcional
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// --- Componente PlaceholderComponent ---
type PlaceholderComponentProps = { title: string; };
function PlaceholderComponent({ title }: PlaceholderComponentProps): JSX.Element {
    return ( <div> <h2>{title}</h2> <p>Página en construcción.</p> </div> );
}

// --- Componente Principal AppRoutes ---
const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protegidas */}
        <Route path="/" element={ <ProtectedRoute> <ProjectListPage /> </ProtectedRoute> } />
        <Route path="/projects/new" element={ <ProtectedRoute> <ProjectCreatePage /> </ProtectedRoute> } />
        <Route path="/projects/:id" element={ <ProtectedRoute> <ProjectDetailPage /> </ProtectedRoute> } />
        {/* --- RUTA DE EDICIÓN COMENTADA --- */}
        {/* <Route path="/projects/:id/edit" element={ <ProtectedRoute> <ProjectEditPage /> </ProtectedRoute> } /> */}

        {/* Otras rutas (Placeholders) */}
        <Route path="/dashboard" element={ <ProtectedRoute> <PlaceholderComponent title="Dashboard"/> </ProtectedRoute> } />
        <Route path="/admin" element={ <ProtectedRoute> <PlaceholderComponent title="Administración"/> </ProtectedRoute> } />

        {/* Not Found */}
        <Route path="*" element={<PlaceholderComponent title="404 - Página No Encontrada" />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;