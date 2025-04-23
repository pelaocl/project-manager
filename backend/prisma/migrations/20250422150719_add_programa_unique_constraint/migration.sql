/*
  Warnings:

  - A unique constraint covering the columns `[nombre,linea_financiamiento_id]` on the table `programas` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "programa_nombre_linea_idx" ON "programas"("nombre", "linea_financiamiento_id");
