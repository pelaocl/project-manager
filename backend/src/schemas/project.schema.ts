import { z } from 'zod';
import { TipoMoneda } from '@prisma/client';

// Schemas anteriores (listProjectsSchema, projectIdSchema, createProjectSchema) sin cambios...
export const listProjectsSchema = z.object({ /* ... */ });
export type ListProjectsQuery = z.infer<typeof listProjectsSchema>['query'];
export const projectIdSchema = z.object({ /* ... */ });
export type ProjectIdParams = z.infer<typeof projectIdSchema>['params'];
export const createProjectSchema = z.object({ /* ... */ });
export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];

// --- NUEVO: Schema para ACTUALIZAR un Proyecto ---
// Similar a create, pero todos los campos del body son opcionales
// Se necesita el 'id' en los params
export const updateProjectSchema = z.object({
    // Validar params
    params: z.object({
        id: z.coerce.number().int().positive(), // ID del proyecto a actualizar
    }),
    // Query no se usa
    query: z.object({}).optional(),
    // Validar Body (todos opcionales)
    body: z.object({
        nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres.").optional(),
        // tipologiaId: z.number().int().positive().optional(), // ¿Permitir cambiar tipología? Podría afectar código único. Mejor no por ahora.
        estadoId: z.number({ invalid_type_error: "ID Estado debe ser número."}).int().positive().nullable().optional(),
        descripcion: z.string().nullable().optional(), // Permitir enviar null para borrar
        unidadId: z.number({ invalid_type_error: "ID Unidad debe ser número."}).int().positive().nullable().optional(),
        direccion: z.string().nullable().optional(),
        superficieTerreno: z.number({ invalid_type_error: "Superficie debe ser número."}).positive().nullable().optional(),
        superficieEdificacion: z.number({ invalid_type_error: "Superficie debe ser número."}).positive().nullable().optional(),
        sectorId: z.number({ invalid_type_error: "ID Sector debe ser número."}).int().positive().nullable().optional(),
        ano: z.number({ invalid_type_error: "Año debe ser número."}).int().min(1900).max(2100).nullable().optional(),
        proyectoPriorizado: z.boolean().optional(),
        proyectistaId: z.number({ invalid_type_error: "ID Proyectista debe ser número."}).int().positive().nullable().optional(),
        formuladorId: z.number({ invalid_type_error: "ID Formulador debe ser número."}).int().positive().nullable().optional(),
        // colaboradores: z.array(z.number().int().positive()).optional(),
        lineaFinanciamientoId: z.number({ invalid_type_error: "ID Línea Financ. debe ser número."}).int().positive().nullable().optional(),
        programaId: z.number({ invalid_type_error: "ID Programa debe ser número."}).int().positive().nullable().optional(),
        etapaFinanciamientoId: z.number({ invalid_type_error: "ID Etapa Financ. debe ser número."}).int().positive().nullable().optional(),
        codigoExpediente: z.string().nullable().optional(),
        fechaPostulacion: z.coerce.date({ invalid_type_error: "Fecha inválida."}).nullable().optional(),
        monto: z.number({ invalid_type_error: "Monto debe ser número."}).positive().nullable().optional(),
        tipoMoneda: z.nativeEnum(TipoMoneda).optional(),
        montoAdjudicado: z.number({ invalid_type_error: "Monto Adjudicado debe ser número."}).positive().nullable().optional(),
        codigoLicitacion: z.string().nullable().optional(),
    }).partial().refine(obj => Object.keys(obj).length > 0, { // Asegurar que al menos un campo se envíe para actualizar
         message: "Se requiere al menos un campo para actualizar.",
    }),
});

// Exportar tipos inferidos
export type UpdateProjectParams = z.infer<typeof updateProjectSchema>['params'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body'];