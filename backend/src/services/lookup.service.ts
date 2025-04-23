import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getFormOptions = async () => {
    // Usar $transaction para ejecutar múltiples queries en paralelo
    const [
        estados,
        tipologias,
        unidades,
        sectores,
        usuarios, // Obtener usuarios para asignar como proyectista/formulador
        lineasFinanciamiento,
        programas, // Considerar si cargar todos o filtrar por línea en el frontend
        etapasFinanciamiento
    ] = await prisma.$transaction([
        prisma.estadoProyecto.findMany({ orderBy: { nombre: 'asc' } }),
        prisma.tipologiaProyecto.findMany({ orderBy: { nombre: 'asc' } }),
        prisma.unidadMunicipal.findMany({ orderBy: { nombre: 'asc' } }),
        prisma.sector.findMany({ orderBy: { nombre: 'asc' } }),
        prisma.user.findMany({ // Seleccionar solo campos necesarios para el selector
            select: { id: true, name: true, email: true }, // Incluir email puede ayudar a diferenciar
            orderBy: { name: 'asc' }
        }),
        prisma.lineaFinanciamiento.findMany({ orderBy: { nombre: 'asc' } }),
        prisma.programa.findMany({ // Incluir ID de línea para filtrar en frontend
            select: { id: true, nombre: true, lineaFinanciamientoId: true },
            orderBy: { nombre: 'asc' }
        }),
        prisma.etapaFinanciamiento.findMany({ orderBy: { nombre: 'asc' } })
    ]);

    // Devolver un objeto con todas las listas
    return {
        estados,
        tipologias,
        unidades,
        sectores,
        usuarios, // Lista de posibles proyectistas/formuladores/colaboradores
        lineasFinanciamiento,
        programas,
        etapasFinanciamiento
    };
};