import { Router } from 'express';
import { validateRequest } from '../middlewares/validate.middleware';
import { authenticateToken } from '../middlewares/auth.middleware'; // Asegúrate que esté importado
import { authorizeRole } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';
import {
    listProjectsSchema,
    projectIdSchema,
    createProjectSchema,
    updateProjectSchema
} from '../schemas/project.schema';
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject
} from '../controllers/project.controller';

const projectRouter = Router();

// GET /api/projects - Listar Proyectos (Público/Autenticado, authenticateToken es opcional y se maneja en servicio)
projectRouter.get( '/', validateRequest(listProjectsSchema), getProjects );

// POST /api/projects - Crear Proyecto (Requiere Auth: Admin/Coord)
projectRouter.post(
    '/',
    authenticateToken,
    authorizeRole([Role.ADMIN, Role.COORDINADOR]),
    validateRequest(createProjectSchema),
    createProject
);

// GET /api/projects/:id - Obtener un Proyecto por ID (Requiere Auth)
projectRouter.get(
    '/:id',
    authenticateToken, // <-- AÑADIDO AQUÍ
    validateRequest(projectIdSchema),
    getProjectById
);

// PUT /api/projects/:id - Actualizar un Proyecto (Requiere Auth, permisos específicos en servicio)
projectRouter.put(
    '/:id',
    authenticateToken,
    validateRequest(updateProjectSchema),
    updateProject
);

// DELETE ... (Comentado)

export default projectRouter;