import { Prisma, PrismaClient, Role } from '@prisma/client';
import { CreateProjectData, UpdateProjectData } from '../schemas/project.schema';

const prisma = new PrismaClient();

// Define qué campos devolver públicamente
const publicProjectFields = Prisma.validator<Prisma.ProjectSelect>()({
    id: true, codigoUnico: true, nombre: true,
    estado: { select: { nombre: true } }, // Incluir nombre del estado
    unidad: { select: { nombre: true, abreviacion: true } },
    tipologia: { select: { nombre: true, abreviacion: true, colorChip: true } },
    direccion: true, superficieTerreno: true, superficieEdificacion: true,
    sector: { select: { nombre: true } },
    ano: true, proyectoPriorizado: true, createdAt: true, updatedAt: true,
    // No incluir: descripcion, equipo, financiera, IDs de relaciones
});

// Define campos internos adicionales (para usuarios logueados)
const internalProjectFields = Prisma.validator<Prisma.ProjectSelect>()({
    ...publicProjectFields, // Incluir todos los públicos
    descripcion: true,
    proyectista: { select: { id: true, name: true, email: true } },
    formulador: { select: { id: true, name: true, email: true } },
    // TODO: Colaboradores (cuando se implemente many-to-many)
    lineaFinanciamiento: { select: { id:true, nombre: true } },
    programa: { select: { id: true, nombre: true } },
    etapaActualFinanciamiento: { select: { id: true, nombre: true } },
    monto: true, tipoMoneda: true, codigoExpediente: true, fechaPostulacion: true,
    montoAdjudicado: true, codigoLicitacion: true,
    // Incluir IDs de relaciones puede ser útil para edición/internos
    estadoId: true, unidadId: true, tipologiaId: true, sectorId: true,
    proyectistaId: true, formuladorId: true, lineaFinanciamientoId: true,
    programaId: true, etapaFinanciamientoId: true,
});


// --- Servicio para Listar Proyectos ---
export const findAllProjects = async (page: number, limit: number, user?: { userId: number; role: Role }) => {
    const skip = (page - 1) * limit;
    const selectFields = user ? internalProjectFields : publicProjectFields; // Seleccionar campos según usuario

    try {
        const [projects, totalCount] = await prisma.$transaction([
            prisma.project.findMany({
                skip: skip,
                take: limit,
                select: selectFields,
                orderBy: { // Ejemplo de ordenamiento, ajustar según necesidad
                    updatedAt: 'desc',
                }
            }),
            prisma.project.count(),
        ]);
        return { projects, totalCount };
    } catch (error) {
        console.error("Error fetching projects:", error);
        throw new Error("Error al obtener los proyectos.");
    }
};

// --- Servicio para Crear Proyecto ---
export const createNewProject = async (data: CreateProjectData) => {
     try {
        const newProject = await prisma.project.create({
            data: {
                codigoUnico: data.codigoUnico, nombre: data.nombre,
                tipologiaId: data.tipologiaId, estadoId: data.estadoId || null, descripcion: data.descripcion || null,
                unidadId: data.unidadId || null, direccion: data.direccion || null, superficieTerreno: data.superficieTerreno || null,
                superficieEdificacion: data.superficieEdificacion || null, sectorId: data.sectorId || null, ano: data.ano || null,
                proyectoPriorizado: data.proyectoPriorizado ?? false, proyectistaId: data.proyectistaId || null, formuladorId: data.formuladorId || null,
                lineaFinanciamientoId: data.lineaFinanciamientoId || null, programaId: data.programaId || null, etapaFinanciamientoId: data.etapaFinanciamientoId || null,
                monto: data.monto || null, tipoMoneda: data.tipoMoneda || 'CLP', codigoExpediente: data.codigoExpediente || null,
                fechaPostulacion: data.fechaPostulacion || null, montoAdjudicado: data.montoAdjudicado || null, codigoLicitacion: data.codigoLicitacion || null,
                // TODO: Añadir lógica para Colaboradores
            }
        });
        return newProject;
    } catch (error: any) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002' && error.meta?.target === 'Project_codigoUnico_key') { throw new Error('El Código Único ya existe.'); }
            if (error.code === 'P2003') { throw new Error('Error de clave foránea: Alguno de los IDs relacionados no existe.'); }
        }
        console.error("Error creating project:", error);
        throw new Error("Error al crear el proyecto.");
    }
};

// --- Servicio para Obtener Proyecto por ID ---
export const findProjectById = async (id: number, user?: { userId: number; role: Role }) => {
    const selectFields = user ? internalProjectFields : publicProjectFields;
     // console.log(`[projectService] findProjectById - ID: ${id}, user exists: ${!!user}, selecting fields: ${user ? 'INTERNAL' : 'PUBLIC'}`); // Log opcional
    try {
        const project = await prisma.project.findUnique({
            where: { id: id },
            select: selectFields,
        });
         // console.log(`[projectService] findProjectById - Project found:`, project); // Log opcional
        // No necesitamos el if/else aquí, findUnique devuelve null si no lo encuentra
        return project; // Devuelve el proyecto o null
    } catch (error) {
        console.error(`Error fetching project by ID ${id}:`, error);
        throw new Error(`Error al obtener el proyecto ${id}.`);
    }
};


// --- Servicio para Actualizar Proyecto ---
export const updateExistingProject = async (id: number, data: UpdateProjectData, requestingUser: { userId: number; role: Role }) => {
    // 1. Verificar que el proyecto existe (opcional, update fallará si no existe)
    const projectToUpdate = await prisma.project.findUnique({ where: { id } });
    if (!projectToUpdate) { throw new Error(`Proyecto con ID ${id} no encontrado.`); }

    // 2. Verificar Permisos (simplificado, podría ser más complejo)
    // Solo Admin, Coordinador, o el Proyectista asignado pueden editar
    const canUserEdit = requestingUser.role === Role.ADMIN || requestingUser.role === Role.COORDINADOR || (requestingUser.role === Role.USUARIO && projectToUpdate.proyectistaId === requestingUser.userId);
    if (!canUserEdit) { throw new Error('No tienes permiso para editar este proyecto.'); }

    // 3. Realizar la actualización
     try {
        const updatedProject = await prisma.project.update({
            where: { id: id },
            data: {
                // Actualizar solo los campos proporcionados (Prisma maneja undefined)
                 ...data,
                 // Prisma ignora los campos relacionales si no los envías como connect/disconnect
                 // Los IDs foráneos se actualizan directamente si están en 'data'
            }
        });
        return updatedProject;
    } catch (error: any) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002' && error.meta?.target === 'Project_codigoUnico_key') { throw new Error('El Código Único ya existe.'); }
            if (error.code === 'P2003') { throw new Error('Error de clave foránea: Alguno de los IDs relacionados no existe.'); }
        }
        console.error(`Error updating project ID ${id}:`, error);
        throw new Error(`Error al actualizar el proyecto ${id}.`);
    }
};


// --- Servicio para Opciones de Formularios ---
 export const getFormOptions = async () => {
    try {
        const [estados, tipologias, unidades, sectores, lineas, programas, etapas, usuarios] = await Promise.all([
            prisma.estadoProyecto.findMany({ orderBy: { nombre: 'asc' } }),
            prisma.tipologiaProyecto.findMany({ orderBy: { nombre: 'asc' } }),
            prisma.unidadMunicipal.findMany({ orderBy: { nombre: 'asc' } }),
            prisma.sector.findMany({ orderBy: { nombre: 'asc' } }),
            prisma.lineaFinanciamiento.findMany({ orderBy: { nombre: 'asc' } }),
            prisma.programaFinanciamiento.findMany({ orderBy: { nombre: 'asc' } }),
            prisma.etapaFinanciamiento.findMany({ orderBy: { nombre: 'asc' } }),
            prisma.user.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }) // Solo usuarios activos
        ]);
        return { estados, tipologias, unidades, sectores, lineas, programas, etapas, usuarios };
    } catch (error) {
        console.error("Error fetching form options:", error);
        throw new Error("Error al obtener opciones para formularios.");
    }
};