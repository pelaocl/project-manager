import apiClient from './api';

// --- Tipos ---
interface ProjectListParams { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc'; searchText?: string; estadoId?: number; tipologiaId?: number; unidadId?: number; sectorId?: number; lineaFinanciamientoId?: number; programaId?: number; etapaFinanciamientoId?: number; proyectistaId?: number; formuladorId?: number; ano?: number; proyectoPriorizado?: boolean; }
interface ProjectListItem { id: number; codigoUnico: string; nombre: string; estado?: { nombre: string }; tipologia?: { nombre: string; abreviacion: string; colorChip: string }; unidad?: { abreviacion: string }; sector?: { nombre: string }; ano?: number; proyectoPriorizado?: boolean; proyectista?: { name: string }; monto?: number; tipoMoneda?: string; updatedAt?: string; }
interface ProjectListResponse { projects: ProjectListItem[]; total: number; page: number; limit: number; }
interface ProjectDetail { id: number; codigoUnico: string; nombre: string; descripcion?: string | null; estado?: { nombre: string }; unidad?: { nombre: string; abreviacion: string }; tipologia?: { nombre: string; abreviacion: string; colorChip: string }; direccion?: string | null; superficieTerreno?: number | null; superficieEdificacion?: number | null; sector?: { nombre: string }; ano?: number | null; proyectoPriorizado: boolean; createdAt: string; updatedAt: string; estadoId?: number | null; unidadId?: number | null; tipologiaId?: number | null; sectorId?: number | null; lineaFinanciamientoId?: number | null; programaId?: number | null; etapaFinanciamientoId?: number | null; proyectistaId?: number | null; formuladorId?: number | null; proyectista?: { id: number; name: string; email: string } | null; formulador?: { id: number; name: string; email: string } | null; lineaFinanciamiento?: { nombre: string } | null; programa?: { nombre: string } | null; etapaActualFinanciamiento?: { nombre: string } | null; codigoExpediente?: string | null; fechaPostulacion?: string | null; monto?: number | null; tipoMoneda?: string | null; montoAdjudicado?: number | null; codigoLicitacion?: string | null; }
interface EstadoOption { id: number; nombre: string; }
interface TipologiaOption { id: number; nombre: string; abreviacion: string; colorChip: string; }
interface UnidadOption { id: number; nombre: string; abreviacion: string; }
interface SectorOption { id: number; nombre: string; }
interface UserOption { id: number; name: string; email: string; }
interface LineaFinanciamientoOption { id: number; nombre: string; }
interface ProgramaOption { id: number; nombre: string; lineaFinanciamientoId: number; }
interface EtapaFinanciamientoOption { id: number; nombre: string; }
export interface FormOptions { estados: EstadoOption[]; tipologias: TipologiaOption[]; unidades: UnidadOption[]; sectores: SectorOption[]; usuarios: UserOption[]; lineasFinanciamiento: LineaFinanciamientoOption[]; programas: ProgramaOption[]; etapasFinanciamiento: EtapaFinanciamientoOption[]; }
export interface CreateProjectData { nombre: string; tipologiaId: number; estadoId?: number | null; descripcion?: string | null; unidadId?: number | null; direccion?: string | null; superficieTerreno?: number | null; superficieEdificacion?: number | null; sectorId?: number | null; ano?: number | null; proyectoPriorizado?: boolean; proyectistaId?: number | null; formuladorId?: number | null; lineaFinanciamientoId?: number | null; programaId?: number | null; etapaFinanciamientoId?: number | null; codigoExpediente?: string | null; fechaPostulacion?: Date | string | null; monto?: number | null; tipoMoneda?: 'CLP' | 'UF'; montoAdjudicado?: number | null; codigoLicitacion?: string | null; }
export interface UpdateProjectData { nombre?: string; estadoId?: number | null; descripcion?: string | null; unidadId?: number | null; direccion?: string | null; superficieTerreno?: number | null; superficieEdificacion?: number | null; sectorId?: number | null; ano?: number | null; proyectoPriorizado?: boolean; proyectistaId?: number | null; formuladorId?: number | null; lineaFinanciamientoId?: number | null; programaId?: number | null; etapaFinanciamientoId?: number | null; codigoExpediente?: string | null; fechaPostulacion?: Date | string | null; monto?: number | null; tipoMoneda?: 'CLP' | 'UF'; montoAdjudicado?: number | null; codigoLicitacion?: string | null; }


// --- Funciones de Servicio ---

export const getAllProjects = async (params: ProjectListParams): Promise<ProjectListResponse> => {
    console.log('[projectService] Iniciando getAllProjects con params:', params); // Log ANTES
    try {
        console.log('[projectService] Intentando llamar a apiClient.get...'); // Log ANTES await
        const response = await apiClient.get<ProjectListResponse>('/projects', { params });
        console.log('[projectService] Llamada a apiClient.get completada. Response status:', response.status); // Log DESPUÉS await
        console.log('[projectService] Datos recibidos de Axios (response.data):', response.data); // Log de datos

        if (response && response.data) {
             return response.data; // <-- Devuelve los datos
        } else {
             console.error('[projectService] La respuesta de Axios o response.data es null/undefined.');
             throw new Error('No se recibieron datos válidos de la API.');
        }
    } catch (error: any) {
        console.error("[projectService] Error capturado en el CATCH de getAllProjects:", error);
        if (error.response) { console.error("[projectService] Error Response Data:", error.response.data); console.error("[projectService] Error Response Status:", error.response.status); }
        else if (error.request) { console.error("[projectService] Error Request (no response):", error.request); }
        else { console.error('[projectService] Error Message:', error.message); }
        throw new Error(error.response?.data?.message || 'Error al obtener la lista de proyectos.');
    }
};

export const getProjectById = async (id: number): Promise<ProjectDetail> => {
     console.log(`[projectService] Iniciando getProjectById para ID: ${id}`);
    try {
        console.log(`[projectService] Intentando llamar a apiClient.get para ID: ${id}...`);
        const response = await apiClient.get<ProjectDetail>(`/projects/${id}`);
        console.log(`[projectService] Llamada a apiClient.get para ID ${id} completada. Response status:`, response.status);
        console.log(`[projectService] Datos recibidos de Axios para ID ${id} (response.data):`, response.data);
        if (response && response.data) { return response.data; }
        else { console.error(`[projectService] La respuesta de Axios o response.data es null/undefined para ID ${id}.`); throw new Error('No se recibieron datos válidos de la API para este proyecto.'); }
    } catch (error: any) {
        console.error(`[projectService] Error capturado en el CATCH para ID ${id}:`, error);
        if (error.response) { console.error("[projectService] Error Response Data:", error.response.data); console.error("[projectService] Error Response Status:", error.response.status); }
        else if (error.request) { console.error("[projectService] Error Request (no response):", error.request); }
        else { console.error('[projectService] Error Message:', error.message); }
        throw new Error(error.response?.data?.message || `Error al obtener el proyecto ${id}.`);
    }
};

export const getFormOptions = async (): Promise<FormOptions> => {
    console.log('[projectService] Iniciando getFormOptions'); // Log
    try {
        const response = await apiClient.get<FormOptions>('/lookups/form-options');
        console.log('[projectService] Opciones de formulario recibidas:', response.data); // Log
        return response.data;
    } catch (error: any) {
        console.error("Error en servicio getFormOptions:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al obtener las opciones del formulario.');
    }
};

export const createProject = async (data: CreateProjectData): Promise<ProjectDetail> => {
     console.log('[projectService] Iniciando createProject con datos:', data); // Log
    try {
        const response = await apiClient.post<ProjectDetail>('/projects', data);
        console.log('[projectService] Proyecto creado:', response.data); // Log
        return response.data;
    } catch (error: any) {
        console.error("Error en servicio createProject:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al crear el proyecto.');
    }
};

export const updateProject = async (id: number, data: UpdateProjectData): Promise<ProjectDetail> => {
     console.log(`[projectService] Iniciando updateProject para ID ${id} con datos:`, data); // Log
    try {
        const response = await apiClient.put<ProjectDetail>(`/projects/${id}`, data);
        console.log('[projectService] Proyecto actualizado:', response.data); // Log
        return response.data;
    } catch (error: any) {
        console.error(`[projectService] Error en servicio updateProject (ID: ${id}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || `Error al actualizar el proyecto ${id}.`);
    }
};