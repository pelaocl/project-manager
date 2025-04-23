#!/bin/bash

# Crear estructura del Backend
mkdir -p backend/prisma/migrations
mkdir -p backend/src/config
mkdir -p backend/src/controllers
mkdir -p backend/src/middlewares
mkdir -p backend/src/routes
mkdir -p backend/src/services
mkdir -p backend/src/types
mkdir -p backend/src/utils

touch backend/prisma/schema.prisma
touch backend/src/config/index.ts
touch backend/src/controllers/auth.controller.ts
touch backend/src/controllers/project.controller.ts
touch backend/src/controllers/user.controller.ts
touch backend/src/middlewares/auth.middleware.ts
touch backend/src/middlewares/error.middleware.ts
touch backend/src/middlewares/role.middleware.ts
touch backend/src/middlewares/validate.middleware.ts
touch backend/src/routes/auth.routes.ts
touch backend/src/routes/project.routes.ts
touch backend/src/routes/user.routes.ts
touch backend/src/routes/index.ts # Para combinar rutas
touch backend/src/services/auth.service.ts
touch backend/src/services/project.service.ts
touch backend/src/services/user.service.ts
touch backend/src/types/index.d.ts # Tipos generales
touch backend/src/utils/helpers.ts
touch backend/.env
touch backend/.env.example
touch backend/.gitignore
touch backend/package.json
touch backend/tsconfig.json
touch backend/server.ts

# Crear estructura del Frontend
mkdir -p frontend/public
mkdir -p frontend/src/assets
mkdir -p frontend/src/components/common
mkdir -p frontend/src/components/layout
mkdir -p frontend/src/components/map
mkdir -p frontend/src/components/project
mkdir -p frontend/src/components/auth
mkdir -p frontend/src/components/admin
mkdir -p frontend/src/components/dashboard
mkdir -p frontend/src/components/bitacora
mkdir -p frontend/src/hooks
mkdir -p frontend/src/layouts
mkdir -p frontend/src/pages
mkdir -p frontend/src/routes
mkdir -p frontend/src/services
mkdir -p frontend/src/store
mkdir -p frontend/src/styles
mkdir -p frontend/src/types
mkdir -p frontend/src/utils

touch frontend/public/favicon.ico # Placeholder
touch frontend/src/assets/.gitkeep # Para mantener la carpeta
touch frontend/src/components/common/.gitkeep
touch frontend/src/components/layout/Navbar.tsx
touch frontend/src/components/layout/Sidebar.tsx
touch frontend/src/components/map/ProjectMap.tsx
touch frontend/src/components/project/ProjectForm.tsx
touch frontend/src/components/project/ProjectList.tsx
touch frontend/src/components/project/ProjectCard.tsx
touch frontend/src/hooks/useAuth.ts
touch frontend/src/layouts/MainLayout.tsx
touch frontend/src/layouts/AuthLayout.tsx
touch frontend/src/pages/LoginPage.tsx
touch frontend/src/pages/ProjectListPage.tsx
touch frontend/src/pages/ProjectDetailPage.tsx
touch frontend/src/pages/ProjectCreatePage.tsx
touch frontend/src/pages/AdminPage.tsx
touch frontend/src/pages/DashboardPage.tsx
touch frontend/src/pages/NotFoundPage.tsx
touch frontend/src/routes/AppRoutes.tsx
touch frontend/src/services/api.ts
touch frontend/src/services/authService.ts
touch frontend/src/services/projectService.ts
touch frontend/src/store/authStore.ts
touch frontend/src/store/uiStore.ts
touch frontend/src/styles/theme.ts # Configuración tema MUI
touch frontend/src/styles/global.css # Estilos globales si son necesarios
touch frontend/src/types/index.ts # Tipos compartidos del frontend
touch frontend/src/utils/helpers.ts
touch frontend/.env
touch frontend/.env.example
touch frontend/.gitignore
touch frontend/index.html
touch frontend/package.json
touch frontend/tsconfig.json
touch frontend/vite.config.ts
touch frontend/src/main.tsx # Punto de entrada de React
touch frontend/src/App.tsx # Componente raíz de React

echo "Estructura de carpetas y archivos creada."
echo "No olvides ejecutar 'npm install' o 'yarn install' en las carpetas 'backend' y 'frontend'."