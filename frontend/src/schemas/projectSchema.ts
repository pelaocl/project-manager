import { z } from 'zod';

// Definir Enum localmente si no podemos importar de @prisma/client en frontend
const TipoMonedaEnum = z.enum(['CLP', 'UF']);

// Validadores/Transformadores auxiliares para campos opcionales numéricos/de fecha desde inputs de texto
const emptyStringToNull = z.literal('').transform(() => null);
const stringToPositiveNumberOptional = z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null; // Permitir vacíos o nulos explícitos
    const parsed = Number(val);
    return isNaN(parsed) ? val : parsed; // Devolver número o el string original si no es parseable (para que falle la validación de tipo)
}, z.number({ invalid_type_error: "Debe ser un número" }).positive({ message: "Debe ser un número positivo" }).nullable());

const stringToIntOptional = z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null;
    const parsed = Number(val);
    return isNaN(parsed) ? val : parsed;
}, z.number({ invalid_type_error: "Debe ser un número entero" }).int({ message: "Debe ser un número entero"}).nullable());

const stringToYearOptional = z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null;
    const parsed = Number(val);
    return isNaN(parsed) ? val : parsed;
}, z.number({invalid_type_error: "Año inválido"}).int().min(1900, "Año inválido").max(2100, "Año inválido").nullable());


// Schema Principal del Formulario
export const projectFormSchema = z.object({
    // Información Básica
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
    // Usar coerce.number para los <select> porque devuelven strings
    tipologiaId: z.coerce.number({ required_error: "Tipología es requerida", invalid_type_error: "Seleccione una tipología" }).positive("Tipología es requerida"),
    estadoId: z.coerce.number({invalid_type_error: "Seleccione un estado"}).positive().optional().nullable(),
    descripcion: z.string().optional().nullable(), // Permite string vacío o null
    unidadId: z.coerce.number({invalid_type_error: "Seleccione una unidad"}).positive().optional().nullable(),
    direccion: z.string().optional().nullable(), // Permite string vacío o null
    superficieTerreno: stringToPositiveNumberOptional,
    superficieEdificacion: stringToPositiveNumberOptional,
    sectorId: z.coerce.number({invalid_type_error: "Seleccione un sector"}).positive().optional().nullable(),
    ano: stringToYearOptional,
    proyectoPriorizado: z.boolean().optional().default(false),

    // Equipo
    proyectistaId: z.coerce.number({invalid_type_error: "Seleccione un proyectista"}).positive().optional().nullable(),
    formuladorId: z.coerce.number({invalid_type_error: "Seleccione un formulador"}).positive().optional().nullable(),
    // colaboradores: z.array(z.number().int().positive()).optional(),

    // Financiera
    lineaFinanciamientoId: z.coerce.number({invalid_type_error: "Seleccione una línea"}).positive().optional().nullable(),
    programaId: z.coerce.number({invalid_type_error: "Seleccione un programa"}).positive().optional().nullable(),
    etapaFinanciamientoId: z.coerce.number({invalid_type_error: "Seleccione una etapa"}).positive().optional().nullable(),
    codigoExpediente: z.string().optional().nullable(), // Permite string vacío o null
    // Zod puede parsear strings ISO a Date con coerce.date()
    fechaPostulacion: z.union([z.string(), z.date()]) // Aceptar string (del input date) o Date
                       .optional()
                       .nullable()
                       .transform(val => val === "" ? null : val) // Convertir "" a null
                       .refine(val => val === null || !isNaN(new Date(val).getTime()), { message: "Fecha inválida" }), // Validar que sea fecha válida si no es null
                       // .transform(val => val ? new Date(val) : null), // Opcional: convertir a Date object al final

    monto: stringToPositiveNumberOptional,
    tipoMoneda: TipoMonedaEnum.optional().default('CLP'),
    montoAdjudicado: stringToPositiveNumberOptional,
    codigoLicitacion: z.string().optional().nullable(), // Permite string vacío o null

});

// Exportar el tipo inferido para usar con react-hook-form
export type ProjectFormData = z.infer<typeof projectFormSchema>;