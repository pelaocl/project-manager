import { Request, Response } from 'express';
import { Project, Prisma, Role } from '@prisma/client'; // Importar Role
import * as projectService from '../services/project.service';
import {
    ListProjectsQuery,
    ProjectIdParams,
    CreateProjectInput,
    UpdateProjectParams,
    UpdateProjectInput
} from '../schemas/project.schema';

// --- LISTAR PROYECTOS ---
export const getProjects = async (req: Request, res: Response): Promise<Response> => {
  console.log('[Controller.getProjects] Solicitud recibida.'); // Log de inicio simple
  try {
    const queryParams = req.query as ListProjectsQuery;
    const user = req.user;

    const result = await projectService.findAllProjects(queryParams, user);
    return res.status(200).json(result);

  } catch (error: any) {
    console.error("[Controller.getProjects] Error:", error.message); // Loguear solo el mensaje de error
    return res.status(500).json({ message: error.message || 'Error interno al obtener proyectos.' });
  }
};

// --- OBTENER PROYECTO POR ID ---
export const getProjectById = async (req: Request, res: Response): Promise<Response> => {
   console.log(`[Controller.getProjectById] Solicitud recibida para ID (raw): ${req.params.id}`);
   try {
       const idFromParams = (req.params as ProjectIdParams).id;
       // --- CORRECCIÓN: Convertir ID a número antes de pasarlo al servicio ---
       const projectId = parseInt(String(idFromParams), 10);
       // --- Fin Corrección ---

       if (isNaN(projectId)) {
           console.error(`[Controller.getProjectById] Error: ID inválido después de parseInt: ${idFromParams}`);
           return res.status(400).json({ message: 'ID de proyecto inválido.'});
       }

       const user = req.user;
       const project = await projectService.findProjectById(projectId, user); // Pasar el ID numérico

       if (!project) {
           return res.status(404).json({ message: `Proyecto con ID ${projectId} no encontrado.` });
       }

       return res.status(200).json(project);

   } catch (error: any) {
       console.error(`[Controller.getProjectById] Error (ID: ${req.params.id}):`, error.message);
       return res.status(500).json({ message: error.message || 'Error interno al obtener el proyecto.' });
   }
};

// --- CREAR PROYECTO ---
export const createProject = async (req: Request, res: Response): Promise<Response> => {
    console.log('[Controller.createProject] Solicitud recibida.');
    try {
        const projectData = req.body as CreateProjectInput;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "No autorizado para crear proyecto." });
        }

        const newProject = await projectService.createProject(projectData, user);
        console.log(`[Controller.createProject] Proyecto ${newProject.id} creado exitosamente.`);
        return res.status(201).json(newProject);

    } catch (error: any) {
        console.error("[Controller.createProject] Error:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
             return res.status(409).json({ message: "Error: Conflicto al generar código único o dato duplicado.", details: error.meta });
        }
        return res.status(500).json({ message: error.message || 'Error interno al crear el proyecto.' });
    }
};

// --- ACTUALIZAR PROYECTO ---
export const updateProject = async (req: Request, res: Response): Promise<Response> => {
    console.log(`[Controller.updateProject] Solicitud recibida para ID: ${req.params.id}`);
    try {
        const { id } = req.params as UpdateProjectParams; // ID validado por Zod
        const projectData = req.body as UpdateProjectInput; // Body validado por Zod
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "No autorizado para actualizar proyecto." });
        }

        const updatedProject = await projectService.updateProject(id, projectData, user);

        if (!updatedProject) {
             return res.status(404).json({ message: `Proyecto con ID ${id} no encontrado.` });
        }

        console.log(`[Controller.updateProject] Proyecto ${updatedProject.id} actualizado exitosamente.`);
        return res.status(200).json(updatedProject);

    } catch (error: any) {
        console.error(`[Controller.updateProject] Error capturado (ID: ${req.params.id}):`, error);
        if (error.message === "Permiso denegado: No puedes editar este proyecto.") {
            return res.status(403).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message || 'Error interno al actualizar el proyecto.' });
    }
};

// --- ELIMINAR PROYECTO (Placeholder) ---
/* export const deleteProject = async ... */