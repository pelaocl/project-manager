import { PrismaClient, Role, TipoMoneda } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// --- DATOS INICIALES (igual que antes) ---
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@concepcion.cl';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SALT_ROUNDS = 10;

const etiquetasData = [ { nombre: 'PROYECTISTA', color: '#3498DB' }, { nombre: 'FORMULADOR', color: '#F1C40F' }, { nombre: 'COORDINADOR', color: '#E74C3C' }, { nombre: 'ARQUITECTO', color: '#2ECC71' }, { nombre: 'INGENIERO', color: '#9B59B6' }, ];
const estadosData = [ { nombre: 'APROBADO' }, { nombre: 'DISEÑO' }, { nombre: 'EJECUCIÓN' }, { nombre: 'EJECUTADO' }, { nombre: 'FINANCIADO' }, { nombre: 'LICITACIÓN' }, { nombre: 'POSTULACIÓN' }, { nombre: 'POR DEFINIR' }, ];
const unidadesData = [ { nombre: 'ARQUITECTURA', abreviacion: 'ARQ' }, { nombre: 'ASESORÍA URBANA', abreviacion: 'AU' }, { nombre: 'INGENIERÍA', abreviacion: 'ING' }, { nombre: 'SECPLAN', abreviacion: 'SECPLAN' }, ];
const tipologiasData = [ { nombre: 'ACTIVO', abreviacion: 'ACT', colorChip: '#F39C12' }, { nombre: 'EQUIPAMIENTO', abreviacion: 'EQ', colorChip: '#3498DB' }, { nombre: 'ESPACIO PÚBLICO', abreviacion: 'EP', colorChip: '#27AE60' }, { nombre: 'INFRAESTRUCTURA', abreviacion: 'INF', colorChip: '#8E44AD' }, { nombre: 'MIXTO', abreviacion: 'MIX', colorChip: '#7F8C8D' }, { nombre: 'VIVIENDA', abreviacion: 'VIV', colorChip: '#E74C3C' }, ];
const sectoresData = [ { nombre: 'Concepción Centro' }, { nombre: 'Pedro de Valdivia' }, { nombre: 'Lorenzo Arenas' }, { nombre: 'Barrio Norte' }, { nombre: 'Pedro del Río Zañartu' }, ];
const lineasFinanciamientoData = [ { nombre: 'POR DEFINIR' }, { nombre: 'SUBDERE' }, { nombre: 'GORE' }, { nombre: 'MINVU' }, { nombre: 'MUNICIPAL' }, { nombre: 'OTRO' }, ];
const programasDataInput = [ { nombre: 'PMU', lineaNombre: 'SUBDERE' }, { nombre: 'PMB', lineaNombre: 'SUBDERE' }, { nombre: 'FNDR', lineaNombre: 'GORE' }, { nombre: 'DS49', lineaNombre: 'MINVU' }, { nombre: 'DS19', lineaNombre: 'MINVU' }, { nombre: 'PROPIO', lineaNombre: 'MUNICIPAL' }, { nombre: 'SIN PROGRAMA', lineaNombre: 'POR DEFINIR' }, { nombre: 'EXTERNO', lineaNombre: 'OTRO' }, ];
const etapasFinanciamientoData = [ { nombre: 'IDENTIFICACIÓN' }, { nombre: 'POSTULACIÓN' }, { nombre: 'ADMISIBILIDAD' }, { nombre: 'RECOMENDADO (RS)' }, { nombre: 'FINANCIADO' }, { nombre: 'LICITACIÓN' }, { nombre: 'ADJUDICADO' }, { nombre: 'EJECUCIÓN' }, { nombre: 'TERMINADO' }, ];


// --- FUNCIÓN PRINCIPAL DE SEED ---
async function main() {
  console.log('Iniciando el proceso de seeding...');

  // --- Crear datos de Lookup ---
  console.log('Creando/Verificando datos de Lookup...');
  await prisma.etiqueta.createMany({ data: etiquetasData, skipDuplicates: true });
  await prisma.estadoProyecto.createMany({ data: estadosData, skipDuplicates: true });
  await prisma.unidadMunicipal.createMany({ data: unidadesData, skipDuplicates: true });
  await prisma.tipologiaProyecto.createMany({ data: tipologiasData, skipDuplicates: true });
  await prisma.sector.createMany({ data: sectoresData, skipDuplicates: true });
  await prisma.lineaFinanciamiento.createMany({ data: lineasFinanciamientoData, skipDuplicates: true });
  const lineasExistentes = await prisma.lineaFinanciamiento.findMany({ select: { id: true, nombre: true } });
  const lineasMap = new Map(lineasExistentes.map(l => [l.nombre, l.id]));
  const programasParaCrear = programasDataInput.map(progInput => { const lineaId = lineasMap.get(progInput.lineaNombre); if (!lineaId) { console.warn(`Advertencia: Línea '${progInput.lineaNombre}' no encontrada para programa '${progInput.nombre}'.`); return null; } return { nombre: progInput.nombre, lineaFinanciamientoId: lineaId }; }).filter(p => p !== null);
  if (programasParaCrear.length > 0) { for (const prog of programasParaCrear) { await prisma.programa.upsert({ where: { nombre_lineaFinanciamientoId: { nombre: prog.nombre, lineaFinanciamientoId: prog.lineaFinanciamientoId }}, update: {}, create: prog, }); } }
  await prisma.etapaFinanciamiento.createMany({ data: etapasFinanciamientoData, skipDuplicates: true });
  console.log('Datos de Lookup creados/verificados.');

  // --- Crear Usuario Administrador ---
  console.log(`Creando/Actualizando usuario administrador (${ADMIN_EMAIL})...`);
  const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, SALT_ROUNDS);
  const adminUser = await prisma.user.upsert({ where: { email: ADMIN_EMAIL }, update: { password: hashedPassword, role: Role.ADMIN, name: 'Administrador del Sistema', }, create: { email: ADMIN_EMAIL, password: hashedPassword, name: 'Administrador del Sistema', role: Role.ADMIN, }, });
  if(adminUser) {
    console.log(`Usuario administrador '${adminUser.name}' (${adminUser.email}) creado/actualizado.`);
  } else {
    console.error("¡ERROR! El usuario administrador no se pudo crear/actualizar.");
  }

  // --- Buscar Datos para Proyectos (CON LOGS DETALLADOS) ---
  console.log('--- [DEBUG] Iniciando búsqueda de datos para proyectos ---');
  const estadoDiseno = await prisma.estadoProyecto.findUnique({ where: { nombre: 'DISEÑO' } });
  console.log('[DEBUG] Resultado estadoDiseno:', estadoDiseno ? `ID: ${estadoDiseno.id}` : 'NO ENCONTRADO');

  const estadoEjecucion = await prisma.estadoProyecto.findUnique({ where: { nombre: 'EJECUCIÓN' } });
  console.log('[DEBUG] Resultado estadoEjecucion:', estadoEjecucion ? `ID: ${estadoEjecucion.id}` : 'NO ENCONTRADO');

  const tipologiaEP = await prisma.tipologiaProyecto.findUnique({ where: { nombre: 'ESPACIO PÚBLICO' } });
  console.log('[DEBUG] Resultado tipologiaEP:', tipologiaEP ? `ID: ${tipologiaEP.id}` : 'NO ENCONTRADO');

  const tipologiaEQ = await prisma.tipologiaProyecto.findUnique({ where: { nombre: 'EQUIPAMIENTO' } });
  console.log('[DEBUG] Resultado tipologiaEQ:', tipologiaEQ ? `ID: ${tipologiaEQ.id}` : 'NO ENCONTRADO');

  const unidadArq = await prisma.unidadMunicipal.findUnique({ where: { abreviacion: 'ARQ' } });
  console.log('[DEBUG] Resultado unidadArq:', unidadArq ? `ID: ${unidadArq.id}` : 'NO ENCONTRADO');

  const sectorCentro = await prisma.sector.findUnique({ where: { nombre: 'Concepción Centro' } });
  console.log('[DEBUG] Resultado sectorCentro:', sectorCentro ? `ID: ${sectorCentro.id}` : 'NO ENCONTRADO');

  const sectorLorenzo = await prisma.sector.findUnique({ where: { nombre: 'Lorenzo Arenas' } });
  console.log('[DEBUG] Resultado sectorLorenzo:', sectorLorenzo ? `ID: ${sectorLorenzo.id}` : 'NO ENCONTRADO');

  const lineaGore = await prisma.lineaFinanciamiento.findUnique({ where: { nombre: 'GORE'} });
  console.log('[DEBUG] Resultado lineaGore:', lineaGore ? `ID: ${lineaGore.id}` : 'NO ENCONTRADO');

  const programaFNDR = lineaGore ? await prisma.programa.findUnique({ where: { nombre_lineaFinanciamientoId: { nombre: 'FNDR', lineaFinanciamientoId: lineaGore.id } }}) : null;
  console.log('[DEBUG] Resultado programaFNDR:', programaFNDR ? `ID: ${programaFNDR.id}` : 'NO ENCONTRADO');

  const etapaPostulacion = await prisma.etapaFinanciamiento.findUnique({ where: { nombre: 'POSTULACIÓN' }});
  console.log('[DEBUG] Resultado etapaPostulacion:', etapaPostulacion ? `ID: ${etapaPostulacion.id}` : 'NO ENCONTRADO');

  console.log('[DEBUG] Valor adminUser antes del IF:', adminUser ? `ID: ${adminUser.id}` : 'NULO/UNDEFINED');

  // Verificar que obtuvimos los IDs necesarios (simplificado)
  console.log('--- [DEBUG] Verificando datos necesarios antes de crear proyectos ---');
  if (!estadoDiseno || !tipologiaEP || !unidadArq || !sectorCentro || !adminUser) {
      console.error("!!! [DEBUG] CONDICIÓN DE SALIDA CUMPLIDA: No se encontraron datos de lookup necesarios o adminUser es nulo/undefined.");
      console.error("[DEBUG] Valores que causaron la salida:", {
          estadoDiseno: !!estadoDiseno,
          tipologiaEP: !!tipologiaEP,
          unidadArq: !!unidadArq,
          sectorCentro: !!sectorCentro,
          adminUser: !!adminUser
      });
      console.error("Error: No se encontraron datos de lookup necesarios para crear proyectos de ejemplo.");
      return; // Salir si falta algo esencial
  }

  console.log('--- [DEBUG] Datos necesarios encontrados. Procediendo a crear proyectos... ---');

  // --- >>> AÑADIR CREACIÓN DE PROYECTOS DE EJEMPLO <<< ---
  console.log('Creando proyectos de ejemplo...');

  // Crear Proyecto 1 (Plaza)
  try {
      await prisma.project.upsert({
          where: { codigoUnico: 'EP-001' },
          update: {},
          create: {
              codigoUnico: 'EP-001',
              nombre: 'Mejoramiento Plaza Perú',
              descripcion: 'Remodelación integral de la Plaza Perú, incluyendo pavimentos, áreas verdes, iluminación y mobiliario urbano.',
              direccion: 'Av. Chacabuco con Paicaví, Concepción',
              superficieTerreno: 5000,
              ano: 2024,
              proyectoPriorizado: true,
              estado: { connect: { id: estadoDiseno.id } },
              unidad: { connect: { id: unidadArq.id } },
              tipologia: { connect: { id: tipologiaEP.id } },
              sector: { connect: { id: sectorCentro.id } },
              proyectista: { connect: { id: adminUser.id } },
              monto: 550000000,
              tipoMoneda: TipoMoneda.CLP,
              lineaFinanciamiento: lineaGore ? { connect: { id: lineaGore.id } } : undefined,
              programa: programaFNDR ? { connect: { id: programaFNDR.id } } : undefined,
              etapaActualFinanciamiento: etapaPostulacion ? { connect: { id: etapaPostulacion.id } } : undefined,
          },
      });
      console.log("Proyecto 'Mejoramiento Plaza Perú' (EP-001) creado/verificado.");
  } catch (error) {
      console.error("Error al crear/verificar proyecto EP-001:", error);
  }


  // Crear Proyecto 2 (Centro Comunitario)
   if (estadoEjecucion && tipologiaEQ && sectorLorenzo && adminUser) { // Añadido chequeo adminUser por si acaso
       try {
           await prisma.project.upsert({
               where: { codigoUnico: 'EQ-001' },
               update: {},
               create: {
                   codigoUnico: 'EQ-001',
                   nombre: 'Construcción Centro Comunitario Lorenzo Arenas',
                   descripcion: 'Edificio de 2 pisos para actividades vecinales.',
                   direccion: 'Calle Tanto #123, Lorenzo Arenas',
                   superficieTerreno: 800,
                   superficieEdificacion: 650,
                   ano: 2023,
                   proyectoPriorizado: false,
                   estado: { connect: { id: estadoEjecucion.id } },
                   unidad: { connect: { id: unidadArq.id } },
                   tipologia: { connect: { id: tipologiaEQ.id } },
                   sector: { connect: { id: sectorLorenzo.id } },
                   formulador: { connect: { id: adminUser.id } },
                   monto: 320000000, // <--- La línea anterior a la que faltaba la coma
                   tipoMoneda: TipoMoneda.CLP, // <--- Coma añadida implícitamente al pegar
               },
           });
           console.log("Proyecto 'Construcción Centro Comunitario Lorenzo Arenas' (EQ-001) creado/verificado.");
       } catch (error) {
            console.error("Error al crear/verificar proyecto EQ-001:", error);
       }
   } else {
        console.warn("[DEBUG] No se intentó crear el proyecto EQ-001 por falta de datos de lookup (estadoEjecucion, tipologiaEQ, sectorLorenzo o adminUser).");
   }


  console.log('Seeding finalizado.');
}

// --- EJECUCIÓN DEL SEED ---
main()
  .catch((e) => {
    console.error('Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });