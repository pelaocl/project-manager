import { PrismaClient, Project, Prisma, Role } from '@prisma/client';
import { ListProjectsQuery, CreateProjectInput, UpdateProjectInput } from '../schemas/project.schema';

const prisma = new PrismaClient();

// --- Selectores de Campos y Tipos ---
const publicProjectFields = Prisma.validator<Prisma.ProjectSelect>()({ id: true, codigoUnico: true, nombre: true, estado: { select: { nombre: true } }, unidad: { select: { nombre: true, abreviacion: true } }, tipologia: { select: { nombre: true, abreviacion: true, colorChip: true } }, direccion: true, superficieTerreno: true, superficieEdificacion: true, sector: { select: { nombre: true } }, ano: true, proyectoPriorizado: true, createdAt: true, updatedAt: true, });
const internalProjectFields = Prisma.validator<Prisma.ProjectSelect>()({ ...publicProjectFields, descripcion: true, estadoId: true, unidadId: true, tipologiaId: true, sectorId: true, lineaFinanciamientoId: true, programaId: true, etapaFinanciamientoId: true, proyectistaId: true, formuladorId: true, proyectista: { select: { id: true, name: true, email: true } }, formulador: { select: { id: true, name: true, email: true } }, lineaFinanciamiento: { select: { nombre: true } }, programa: { select: { nombre: true } }, etapaActualFinanciamiento: { select: { nombre: true } }, codigoExpediente: true, fechaPostulacion: true, monto: true, tipoMoneda: true, montoAdjudicado: true, codigoLicitacion: true, });
type PublicProjectPayload = Prisma.ProjectGetPayload<{ select: typeof publicProjectFields }>;
type InternalProjectPayload = Prisma.ProjectGetPayload<{ select: typeof internalProjectFields }>;


// --- SERVICIO PARA LISTAR PROYECTOS ---
export const findAllProjects = async (
    query: ListProjectsQuery,
    user?: Express.Request['user']
): Promise<{ projects: Partial<Project>[]; total: number; page: number; limit: number }> => {
    try {
        const {
            page: pageInput = 1,
            limit: limitInput = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            searchText,
            ...filters
        } = query;

        // Asegurar que page y limit sean números
        const page = parseInt(String(pageInput), 10);
        const limit = parseInt(String(limitInput), 10);

        // Calcular skip (ahora 'page' y 'limit' son números garantizados)
        const skip = (page - 1) * limit;

        // Construir WHERE
        const where: Prisma.ProjectWhereInput = {};
        for (const key in filters) { if (filters[key as keyof typeof filters] !== undefined && ['estadoId', 'tipologiaId', 'unidadId', 'sectorId', 'lineaFinanciamientoId', 'programaId', 'etapaFinanciamientoId', 'proyectistaId', 'formuladorId', 'ano', 'proyectoPriorizado'].includes(key)) { const filterValue = key === 'proyectoPriorizado' ? filters[key] === true : filters[key as keyof typeof filters]; where[key as keyof Prisma.ProjectWhereInput] = filterValue; } }
        if (searchText) { where.OR = [ { nombre: { contains: searchText, mode: 'insensitive' } }, { codigoUnico: { contains: searchText, mode: 'insensitive' } }, { descripcion: { contains: searchText, mode: 'insensitive' } }, { direccion: { contains: searchText, mode: 'insensitive' } }, ]; }

        const selectFields = user ? internalProjectFields : publicProjectFields;

        // Opciones de Prisma (asegurando que skip y take estén)
        const findManyOptions: Prisma.ProjectFindManyArgs = {
             where,
             select: selectFields,
             skip: skip,  // <-- Incluir skip
             take: limit, // <-- Incluir take (limit ya es número)
             orderBy: { [sortBy]: sortOrder, },
        };
        const countOptions: Prisma.ProjectCountArgs = { where };

        // Realizar las dos consultas
        const [projects, total] = await prisma.$transaction([
            prisma.project.findMany(findManyOptions),
            prisma.project.count(countOptions),
        ]);

        return { projects, total, page, limit };

    } catch (error) {
        console.error("[Service.findAllProjects] Error:", error);
        throw error;
    }
};

// --- SERVICIO PARA OBTENER PROYECTO POR ID ---
export const findProjectById = async (
    id: number, // Recibe id numérico
    user?: Express.Request['user']
): Promise<PublicProjectPayload | InternalProjectPayload | null> => {
    try {
        const selectFields = user ? internalProjectFields : publicProjectFields;
        const project = await prisma.project.findUnique({
            where: { id: id }, // Usar id numérico explícito
            select: selectFields
        });
        if (!project) { return null; }
        return project;
    } catch (error) {
        console.error(`[Service.findProjectById] Error para ID ${id}:`, error);
        throw error;
    }
};


// --- SERVICIO PARA CREAR PROYECTO ---
export const createProject = async (
    data: CreateProjectInput,
    user: Express.Request['user']
): Promise<Project> => {
    // ... (Código de createProject sin cambios respecto a #105) ...
    console.log('[Service.createProject] Iniciando creación...');
    if (!user) throw new Error("Usuario no autenticado.");
    const tipologia = await prisma.tipologiaProyecto.findUnique({ where: { id: data.tipologiaId }, select: { abreviacion: true } });
    if (!tipologia?.abreviacion) throw new Error(`Tipología con ID ${data.tipologiaId} no encontrada o inválida.`);
    const abreviaturaTipo = tipologia.abreviacion;
    const ultimoProyectoMismaTipologia = await prisma.project.findFirst({ where: { tipologiaId: data.tipologiaId }, orderBy: { createdAt: 'desc' }, select: { codigoUnico: true } });
    let nuevoCorrelativo = 1;
    if (ultimoProyectoMismaTipologia?.codigoUnico) { const partes = ultimoProyectoMismaTipologia.codigoUnico.split('-'); if (partes.length === 2) { const ultimoNumero = parseInt(partes[1], 10); if (!isNaN(ultimoNumero)) { nuevoCorrelativo = ultimoNumero + 1; } } }
    const correlativoFormateado = String(nuevoCorrelativo).padStart(3, '0');
    const codigoUnicoGenerado = `${abreviaturaTipo}-${correlativoFormateado}`;
    console.log(`[Service.createProject] Código Único Generado: ${codigoUnicoGenerado}`);
    const dataToCreate: Prisma.ProjectCreateInput = {
        ...data, codigoUnico: codigoUnicoGenerado,
        estado: data.estadoId ? { connect: { id: data.estadoId } } : undefined,
        unidad: data.unidadId ? { connect: { id: data.unidadId } } : undefined,
        tipologia: { connect: { id: data.tipologiaId } },
        sector: data.sectorId ? { connect: { id: data.sectorId } } : undefined,
        proyectista: data.proyectistaId ? { connect: { id: data.proyectistaId } } : undefined,
        formulador: data.formuladorId ? { connect: { id: data.formuladorId } } : undefined,
        lineaFinanciamiento: data.lineaFinanciamientoId ? { connect: { id: data.lineaFinanciamientoId } } : undefined,
        programa: data.programaId ? { connect: { id: data.programaId } } : undefined,
        etapaActualFinanciamiento: data.etapaFinanciamientoId ? { connect: { id: data.etapaFinanciamientoId } } : undefined,
        estadoId: undefined, unidadId: undefined, tipologiaId: undefined, sectorId: undefined, proyectistaId: undefined, formuladorId: undefined, lineaFinanciamientoId: undefined, programaId: undefined, etapaFinanciamientoId: undefined,
        descripcion: data.descripcion || null, direccion: data.direccion || null, superficieTerreno: data.superficieTerreno ?? null, superficieEdificacion: data.superficieEdificacion ?? null, ano: data.ano ?? null, codigoExpediente: data.codigoExpediente || null, fechaPostulacion: data.fechaPostulacion || null, monto: data.monto ?? null, montoAdjudicado: data.montoAdjudicado ?? null, codigoLicitacion: data.codigoLicitacion || null,
    };
    Object.keys(dataToCreate).forEach(key => dataToCreate[key as keyof typeof dataToCreate] === undefined && delete dataToCreate[key as keyof typeof dataToCreate]);
    try {
        const newProject = await prisma.project.create({ data: dataToCreate });
        console.log(`[Service.createProject] Proyecto ${newProject.id} creado.`);
        return newProject;
    } catch (error) { console.error("[Service.createProject] Error de Prisma al crear:", error); throw error; }
};

// --- SERVICIO PARA ACTUALIZAR PROYECTO ---
export const updateProject = async (
    id: number,
    data: UpdateProjectInput,
    user: Express.Request['user']
): Promise<Project | null> => {
    // ... (Código de updateProject sin cambios respecto a #105) ...
     console.log(`[Service.updateProject] Iniciando actualización para ID: ${id}`);
    if (!user) throw new Error("Usuario no autenticado.");
    const project = await prisma.project.findUnique({ where: { id }, select: { proyectistaId: true } });
    if (!project) { console.log(`[Service.updateProject] Proyecto con ID ${id} no encontrado.`); return null; }
    const isAdmin = user.role === Role.ADMIN; const isCoordinator = user.role === Role.COORDINADOR; const isOwnerProyectista = user.role === Role.USUARIO && project.proyectistaId === user.userId;
    console.log(`[Service.updateProject] Permisos - isAdmin: ${isAdmin}, isCoordinator: ${isCoordinator}, isOwnerProyectista: ${isOwnerProyectista}`);
    if (!(isAdmin || isCoordinator || isOwnerProyectista)) { console.warn(`[Service.updateProject] Usuario ${user.userId} (${user.role}) intentó editar proyecto ${id} sin permiso.`); throw new Error("Permiso denegado: No puedes editar este proyecto."); }
    const { tipologiaId, codigoUnico, ...dataToUpdate } = data;
    const prismaUpdateData: Prisma.ProjectUpdateInput = {
      ...dataToUpdate,
      estado: data.estadoId !== undefined ? (data.estadoId === null ? { disconnect: true } : { connect: { id: data.estadoId } }) : undefined,
      unidad: data.unidadId !== undefined ? (data.unidadId === null ? { disconnect: true } : { connect: { id: data.unidadId } }) : undefined,
      sector: data.sectorId !== undefined ? (data.sectorId === null ? { disconnect: true } : { connect: { id: data.sectorId } }) : undefined,
      proyectista: data.proyectistaId !== undefined ? (data.proyectistaId === null ? { disconnect: true } : { connect: { id: data.proyectistaId } }) : undefined,
      formulador: data.formuladorId !== undefined ? (data.formuladorId === null ? { disconnect: true } : { connect: { id: data.formuladorId } }) : undefined,
      lineaFinanciamiento: data.lineaFinanciamientoId !== undefined ? (data.lineaFinanciamientoId === null ? { disconnect: true } : { connect: { id: data.lineaFinanciamientoId } }) : undefined,
      programa: data.programaId !== undefined ? (data.programaId === null ? { disconnect: true } : { connect: { id: data.programaId } }) : undefined,
      etapaActualFinanciamiento: data.etapaFinanciamientoId !== undefined ? (data.etapaFinanciamientoId === null ? { disconnect: true } : { connect: { id: data.etapaFinanciamientoId } }) : undefined,
      estadoId: undefined, unidadId: undefined, sectorId: undefined, proyectistaId: undefined, formuladorId: undefined, lineaFinanciamientoId: undefined, programaId: undefined, etapaFinanciamientoId: undefined,
      descripcion: data.descripcion, direccion: data.direccion, codigoExpediente: data.codigoExpediente, fechaPostulacion: data.fechaPostulacion, monto: data.monto, montoAdjudicado: data.montoAdjudicado, codigoLicitacion: data.codigoLicitacion, superficieTerreno: data.superficieTerreno, superficieEdificacion: data.superficieEdificacion, ano: data.ano
    };
     Object.keys(prismaUpdateData).forEach(key => prismaUpdateData[key as keyof typeof prismaUpdateData] === undefined && delete prismaUpdateData[key as keyof typeof prismaUpdateData]);
    console.log(`[Service.updateProject] Datos finales para Prisma update (ID: ${id}):`, prismaUpdateData);
    try {
        await prisma.project.update({ where: { id: id }, data: prismaUpdateData });
        console.log(`[Service.updateProject] Proyecto ${id} actualizado en BD.`);
         return await findProjectById(id, user);
    } catch (error) { console.error(`[Service.updateProject] Error de Prisma al actualizar ID ${id}:`, error); throw error; }
};

// --- Servicio para Opciones de Formularios ---
// Reemplaza las referencias a modelos específicos si los nombres cambiaron en tu schema.prisma
 export const getFormOptions = async () => {
    try {
        // Asegúrate que los nombres de modelo como 'programaFinanciamiento' coincidan con tu schema.prisma
        const [estados, tipologias, unidades, sectores, lineasFinanciamiento, programas, etapasFinanciamiento, usuarios] = await Promise.all([
            prisma.estadoProyecto.findMany({ orderBy: { nombre: 'asc' } }),
            prisma.tipologiaProyecto.findMany({ orderBy: { nombre: 'asc' } }),
            prisma.unidadMunicipal.findMany({ orderBy: { nombre: 'asc' } }),
            prisma.sector.findMany({ orderBy: { nombre: 'asc' } }),
            prisma.lineaFinanciamiento.findMany({ orderBy: { nombre: 'asc' } }),
            prisma.programa.findMany({ select: { id: true, nombre: true, lineaFinanciamientoId: true }, orderBy: { nombre: 'asc' } }), // Usar 'Programa' si ese es el nombre del modelo
            prisma.etapaFinanciamiento.findMany({ orderBy: { nombre: 'asc' } }),
            prisma.user.findMany({ /*where: { isActive: true },*/ select: { id: true, name: true, email: true }, orderBy: { name: 'asc' } }) // Quitar filtro isActive si no existe
        ]);
        return { estados, tipologias, unidades, sectores, lineasFinanciamiento, programas, etapasFinanciamiento, usuarios };
    } catch (error) {
        console.error("Error fetching form options:", error);
        throw new Error("Error al obtener opciones para formularios.");
    }
};