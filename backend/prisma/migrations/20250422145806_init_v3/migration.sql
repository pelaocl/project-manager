-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'COORDINADOR', 'USUARIO');

-- CreateEnum
CREATE TYPE "TipoMoneda" AS ENUM ('CLP', 'UF');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USUARIO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etiquetas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#FFFFFF',

    CONSTRAINT "etiquetas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "codigoUnico" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "direccion" TEXT,
    "superficie_terreno_m2" DOUBLE PRECISION,
    "superficie_edificacion_m2" DOUBLE PRECISION,
    "ano_inicio" INTEGER,
    "proyecto_priorizado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "estado_id" INTEGER,
    "unidad_id" INTEGER,
    "tipologia_id" INTEGER,
    "sector_id" INTEGER,
    "proyectista_user_id" INTEGER,
    "formulador_user_id" INTEGER,
    "linea_financiamiento_id" INTEGER,
    "programa_id" INTEGER,
    "etapa_financiamiento_id" INTEGER,
    "codigo_expediente" TEXT,
    "fecha_postulacion" TIMESTAMP(3),
    "monto" DECIMAL(15,2),
    "tipo_moneda" "TipoMoneda" NOT NULL DEFAULT 'CLP',
    "monto_adjudicado" DECIMAL(15,2),
    "codigo_licitacion" TEXT,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_proyecto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "estados_proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidades_municipales" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "abreviacion" TEXT NOT NULL,

    CONSTRAINT "unidades_municipales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipologias_proyecto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "abreviacion" TEXT NOT NULL,
    "color_chip" TEXT NOT NULL DEFAULT '#CCCCCC',

    CONSTRAINT "tipologias_proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sectores" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "sectores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lineas_financiamiento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "lineas_financiamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "linea_financiamiento_id" INTEGER NOT NULL,

    CONSTRAINT "programas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etapas_financiamiento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "etapas_financiamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tareas_bitacora" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_plazo" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "proyecto_id" INTEGER NOT NULL,
    "creada_por_user_id" INTEGER NOT NULL,
    "asignado_a_user_id" INTEGER,

    CONSTRAINT "tareas_bitacora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comentarios_bitacora" (
    "id" SERIAL NOT NULL,
    "contenido" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "tarea_id" INTEGER NOT NULL,
    "creado_por_user_id" INTEGER NOT NULL,

    CONSTRAINT "comentarios_bitacora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserEtiquetas" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ProjectCollaborators" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "etiquetas_nombre_key" ON "etiquetas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "projects_codigoUnico_key" ON "projects"("codigoUnico");

-- CreateIndex
CREATE UNIQUE INDEX "estados_proyecto_nombre_key" ON "estados_proyecto"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "unidades_municipales_nombre_key" ON "unidades_municipales"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "unidades_municipales_abreviacion_key" ON "unidades_municipales"("abreviacion");

-- CreateIndex
CREATE UNIQUE INDEX "tipologias_proyecto_nombre_key" ON "tipologias_proyecto"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tipologias_proyecto_abreviacion_key" ON "tipologias_proyecto"("abreviacion");

-- CreateIndex
CREATE UNIQUE INDEX "sectores_nombre_key" ON "sectores"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "lineas_financiamiento_nombre_key" ON "lineas_financiamiento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "etapas_financiamiento_nombre_key" ON "etapas_financiamiento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "_UserEtiquetas_AB_unique" ON "_UserEtiquetas"("A", "B");

-- CreateIndex
CREATE INDEX "_UserEtiquetas_B_index" ON "_UserEtiquetas"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectCollaborators_AB_unique" ON "_ProjectCollaborators"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectCollaborators_B_index" ON "_ProjectCollaborators"("B");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "estados_proyecto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "unidades_municipales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_tipologia_id_fkey" FOREIGN KEY ("tipologia_id") REFERENCES "tipologias_proyecto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_proyectista_user_id_fkey" FOREIGN KEY ("proyectista_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_formulador_user_id_fkey" FOREIGN KEY ("formulador_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_linea_financiamiento_id_fkey" FOREIGN KEY ("linea_financiamiento_id") REFERENCES "lineas_financiamiento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_etapa_financiamiento_id_fkey" FOREIGN KEY ("etapa_financiamiento_id") REFERENCES "etapas_financiamiento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programas" ADD CONSTRAINT "programas_linea_financiamiento_id_fkey" FOREIGN KEY ("linea_financiamiento_id") REFERENCES "lineas_financiamiento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas_bitacora" ADD CONSTRAINT "tareas_bitacora_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas_bitacora" ADD CONSTRAINT "tareas_bitacora_creada_por_user_id_fkey" FOREIGN KEY ("creada_por_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas_bitacora" ADD CONSTRAINT "tareas_bitacora_asignado_a_user_id_fkey" FOREIGN KEY ("asignado_a_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios_bitacora" ADD CONSTRAINT "comentarios_bitacora_tarea_id_fkey" FOREIGN KEY ("tarea_id") REFERENCES "tareas_bitacora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios_bitacora" ADD CONSTRAINT "comentarios_bitacora_creado_por_user_id_fkey" FOREIGN KEY ("creado_por_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserEtiquetas" ADD CONSTRAINT "_UserEtiquetas_A_fkey" FOREIGN KEY ("A") REFERENCES "etiquetas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserEtiquetas" ADD CONSTRAINT "_UserEtiquetas_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectCollaborators" ADD CONSTRAINT "_ProjectCollaborators_A_fkey" FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectCollaborators" ADD CONSTRAINT "_ProjectCollaborators_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
