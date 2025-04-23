import React, { useMemo } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectFormSchema, ProjectFormData } from '@schemas/projectSchema';
import { FormOptions } from '@services/projectService';

import {
    Box, Button, CircularProgress, Grid, TextField, Typography, FormControl, InputLabel, Select,
    MenuItem, FormHelperText, Checkbox, FormControlLabel, Paper, Divider, Alert,
    Autocomplete
} from '@mui/material';

interface ProjectFormProps {
    onSubmit: SubmitHandler<ProjectFormData>;
    initialData?: Partial<ProjectFormData>;
    isLoading?: boolean;
    formOptions?: FormOptions | null;
    optionsLoading?: boolean;
    optionsError?: string | null;
    isEditMode?: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
    onSubmit,
    initialData = {},
    isLoading = false,
    formOptions,
    optionsLoading = false,
    optionsError = null,
    isEditMode = false,
}) => {

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
        setValue,
    } = useForm<ProjectFormData>({
        resolver: zodResolver(projectFormSchema),
        // Usar string vacío '' consistentemente para valores iniciales de inputs controlados (Select, TextField)
        // excepto para Autocomplete que prefiere null y Checkbox que prefiere boolean.
        defaultValues: {
            nombre: initialData?.nombre ?? "",
            tipologiaId: initialData?.tipologiaId ?? "",
            estadoId: initialData?.estadoId ?? "",
            descripcion: initialData?.descripcion ?? "",
            unidadId: initialData?.unidadId ?? "",
            direccion: initialData?.direccion ?? "",
            superficieTerreno: initialData?.superficieTerreno ?? "",
            superficieEdificacion: initialData?.superficieEdificacion ?? "",
            sectorId: initialData?.sectorId ?? "",
            ano: initialData?.ano ?? "",
            proyectoPriorizado: initialData?.proyectoPriorizado ?? false,
            proyectistaId: initialData?.proyectistaId ?? null, // null para Autocomplete
            formuladorId: initialData?.formuladorId ?? null,   // null para Autocomplete
            lineaFinanciamientoId: initialData?.lineaFinanciamientoId ?? "",
            programaId: initialData?.programaId ?? "",
            etapaFinanciamientoId: initialData?.etapaFinanciamientoId ?? "",
            codigoExpediente: initialData?.codigoExpediente ?? "",
            fechaPostulacion: initialData?.fechaPostulacion ? new Date(initialData.fechaPostulacion).toISOString().split('T')[0] : "",
            monto: initialData?.monto ?? "",
            tipoMoneda: initialData?.tipoMoneda ?? "CLP",
            montoAdjudicado: initialData?.montoAdjudicado ?? "",
            codigoLicitacion: initialData?.codigoLicitacion ?? "",
        },
    });

    // --- Lógica de selects dependientes ---
    const selectedLineaId = watch('lineaFinanciamientoId');
    const filteredProgramas = useMemo(() => {
        // Asegurarse de que selectedLineaId sea número para la comparación
        const lineaIdNumber = Number(selectedLineaId);
        if (!lineaIdNumber || isNaN(lineaIdNumber) || !formOptions?.programas) {
            return [];
        }
        // Comparar IDs numéricos
        return formOptions.programas.filter(p => p.lineaFinanciamientoId === lineaIdNumber);
    }, [selectedLineaId, formOptions?.programas]);

    React.useEffect(() => {
        const currentProgramaId = watch('programaId');
        const lineaIdNumber = Number(selectedLineaId); // Convertir a número

        if (!isNaN(lineaIdNumber) && lineaIdNumber) { // Si hay una línea válida seleccionada
             // Si hay un programa seleccionado Y no está en la lista filtrada, lo limpiamos a string vacío ''
             if (currentProgramaId && !filteredProgramas.some(p => p.id === Number(currentProgramaId))) {
                 setValue('programaId', '', { shouldValidate: true }); // Limpiar a string vacío
             }
        } else {
             // Si se deselecciona la línea ('' o null), también limpiar el programa a string vacío ''
              setValue('programaId', '', { shouldValidate: true });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLineaId, filteredProgramas, setValue]); // No incluir watch aquí


    // --- Renderizado ---
    if (optionsError) { return <Alert severity="error">Error al cargar opciones: {optionsError}</Alert>; }
    if (optionsLoading || !formOptions) { return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>; }

    // Handler para preparar y enviar datos
    const handleDataPreparation: SubmitHandler<ProjectFormData> = (data) => {
        // La limpieza ahora debería ser más simple porque el form usa tipos más consistentes
        const dataToSend = { ...data };
         (Object.keys(dataToSend) as Array<keyof ProjectFormData>).forEach(key => {
             const numericKeys = ['superficieTerreno', 'superficieEdificacion', 'ano', 'monto', 'montoAdjudicado'];
             const idKeys = ['estadoId', 'unidadId', 'sectorId', 'proyectistaId', 'formuladorId', 'lineaFinanciamientoId', 'programaId', 'etapaFinanciamientoId', 'tipologiaId']; // Incluir tipologiaId
             const stringKeys = ['descripcion', 'direccion', 'codigoExpediente', 'codigoLicitacion'];

             // Convertir a número o null (si era string vacío o inválido)
             if (numericKeys.includes(key) || idKeys.includes(key)) {
                 const value = dataToSend[key];
                 const numValue = Number(value); // Intentar convertir
                 dataToSend[key] = (value === '' || value === null || value === undefined || isNaN(numValue)) ? null : numValue;
             }
              // Convertir strings opcionales vacíos a null
             if (stringKeys.includes(key) && dataToSend[key] === '') {
                 dataToSend[key] = null;
             }
             // Manejar fecha
             if (key === 'fechaPostulacion' && (dataToSend[key] === '' || dataToSend[key] === null || dataToSend[key] === undefined) ) {
                  dataToSend[key] = null;
              } else if (key === 'fechaPostulacion' && typeof dataToSend[key] === 'string') {
                  // Opcional: convertir a Date object si API lo espera, sino dejar string yyyy-mm-dd
                  // dataToSend[key] = new Date(dataToSend[key] + 'T00:00:00'); // Asegurar hora local
              }
         });
        console.log("Datos Formulario (listos para API):", dataToSend);
        onSubmit(dataToSend as CreateProjectData); // Castear a tipo esperado por el servicio onSubmit
     };


    return (
        <Paper sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleSubmit(handleDataPreparation)} noValidate>

                {/* --- SECCIÓN: INFORMACIÓN BÁSICA --- */}
                <Typography variant="h6" gutterBottom>Información Básica</Typography>
                <Grid container spacing={2}>
                    {/* Nombre */}
                    <Grid item xs={12} sm={8}> <Controller name="nombre" control={control} render={({ field }) => ( <TextField {...field} label="Nombre Proyecto" fullWidth required error={!!errors.nombre} helperText={errors.nombre?.message} disabled={isLoading || isSubmitting} /> )} /> </Grid>
                    {/* Tipología */}
                     <Grid item xs={12} sm={4}> <FormControl fullWidth required error={!!errors.tipologiaId} disabled={isLoading || isSubmitting}> <InputLabel id="tipologia-select-label">Tipología</InputLabel> <Controller name="tipologiaId" control={control} render={({ field }) => ( <Select {...field} labelId="tipologia-select-label" label="Tipología"> <MenuItem value="" disabled><em>Seleccione...</em></MenuItem> {/* Guarda Robusta */} {(formOptions?.tipologias ?? []).map((o) => ( <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem> ))} </Select> )} /> {errors.tipologiaId && <FormHelperText>{errors.tipologiaId.message}</FormHelperText>} </FormControl> </Grid>
                    {/* Estado */}
                    <Grid item xs={12} sm={4}> <FormControl fullWidth error={!!errors.estadoId} disabled={isLoading || isSubmitting}> <InputLabel id="estado-select-label">Estado</InputLabel> <Controller name="estadoId" control={control} render={({ field }) => ( <Select {...field} labelId="estado-select-label" label="Estado"> <MenuItem value=""><em>(Opcional)...</em></MenuItem> {(formOptions?.estados ?? []).map((o) => ( <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem> ))} </Select> )} /> {errors.estadoId && <FormHelperText>{errors.estadoId.message}</FormHelperText>} </FormControl> </Grid>
                     {/* Unidad */}
                     <Grid item xs={12} sm={4}> <FormControl fullWidth error={!!errors.unidadId} disabled={isLoading || isSubmitting}> <InputLabel id="unidad-select-label">Unidad Municipal</InputLabel> <Controller name="unidadId" control={control} render={({ field }) => ( <Select {...field} labelId="unidad-select-label" label="Unidad Municipal"> <MenuItem value=""><em>(Opcional)...</em></MenuItem> {(formOptions?.unidades ?? []).map((o) => ( <MenuItem key={o.id} value={o.id}>{o.nombre} ({o.abreviacion})</MenuItem> ))} </Select> )} /> {errors.unidadId && <FormHelperText>{errors.unidadId.message}</FormHelperText>} </FormControl> </Grid>
                    {/* Sector */}
                    <Grid item xs={12} sm={4}> <FormControl fullWidth error={!!errors.sectorId} disabled={isLoading || isSubmitting}> <InputLabel id="sector-select-label">Sector</InputLabel> <Controller name="sectorId" control={control} render={({ field }) => ( <Select {...field} labelId="sector-select-label" label="Sector"> <MenuItem value=""><em>(Opcional)...</em></MenuItem> {(formOptions?.sectores ?? []).map((o) => ( <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem> ))} </Select> )} /> {errors.sectorId && <FormHelperText>{errors.sectorId.message}</FormHelperText>} </FormControl> </Grid>
                    {/* Año */}
                    <Grid item xs={12} sm={4}> <Controller name="ano" control={control} render={({ field }) => ( <TextField {...field} label="Año Iniciativa" type="number" fullWidth error={!!errors.ano} helperText={errors.ano?.message} disabled={isLoading || isSubmitting} inputProps={{ min: "1900", max: "2100", step: "1" }} /> )} /> </Grid>
                    {/* Dirección */}
                    <Grid item xs={12} sm={8}> <Controller name="direccion" control={control} render={({ field }) => ( <TextField {...field} label="Dirección" fullWidth error={!!errors.direccion} helperText={errors.direccion?.message} disabled={isLoading || isSubmitting} /> )} /> </Grid>
                    {/* Superficie Terreno */}
                     <Grid item xs={12} sm={6}> <Controller name="superficieTerreno" control={control} render={({ field }) => ( <TextField {...field} label="Superficie Terreno (m²)" type="number" fullWidth error={!!errors.superficieTerreno} helperText={errors.superficieTerreno?.message} disabled={isLoading || isSubmitting} inputProps={{ step: "any", min: "0" }} /> )} /> </Grid>
                     {/* Superficie Edificación */}
                    <Grid item xs={12} sm={6}> <Controller name="superficieEdificacion" control={control} render={({ field }) => ( <TextField {...field} label="Superficie Edificación (m²)" type="number" fullWidth error={!!errors.superficieEdificacion} helperText={errors.superficieEdificacion?.message} disabled={isLoading || isSubmitting} inputProps={{ step: "any", min: "0" }} /> )} /> </Grid>
                    {/* Priorizado */}
                    <Grid item xs={12}> <FormControlLabel control={ <Controller name="proyectoPriorizado" control={control} render={({ field }) => ( <Checkbox {...field} checked={!!field.value} disabled={isLoading || isSubmitting} /> )} /> } label="Proyecto Priorizado" /> </Grid>
                    {/* Descripción */}
                    <Grid item xs={12}> <Controller name="descripcion" control={control} render={({ field }) => ( <TextField {...field} label="Descripción" fullWidth multiline rows={4} error={!!errors.descripcion} helperText={errors.descripcion?.message} disabled={isLoading || isSubmitting} /> )} /> </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                 {/* --- SECCIÓN: EQUIPO --- */}
                 <Typography variant="h6" gutterBottom>Equipo</Typography>
                 <Grid container spacing={2}>
                    {/* Proyectista (Autocomplete) */}
                    <Grid item xs={12} sm={6}>
                        <Controller
                            name="proyectistaId"
                            control={control}
                            render={({ field }) => (
                                <Autocomplete
                                    options={formOptions.usuarios ?? []} // Guarda Robusta
                                    getOptionLabel={(option) => `${option.name} (${option.email})`}
                                    // Usar ?. y ?? null para seguridad
                                    value={(formOptions?.usuarios ?? []).find(u => u.id === field.value) ?? null}
                                    onChange={(event, newValue) => { field.onChange(newValue ? newValue.id : null); }}
                                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                                    renderInput={(params) => ( <TextField {...params} label="Proyectista Asignado" variant="outlined" error={!!errors.proyectistaId} helperText={errors.proyectistaId?.message} /> )}
                                    disabled={isLoading || isSubmitting}
                                    fullWidth
                                />
                            )}
                        />
                     </Grid>
                     {/* Formulador (Autocomplete) */}
                     <Grid item xs={12} sm={6}>
                          <Controller
                            name="formuladorId"
                            control={control}
                            render={({ field }) => (
                                <Autocomplete
                                    options={formOptions.usuarios ?? []} // Guarda Robusta
                                    getOptionLabel={(option) => `${option.name} (${option.email})`}
                                    value={(formOptions?.usuarios ?? []).find(u => u.id === field.value) ?? null}
                                    onChange={(event, newValue) => { field.onChange(newValue ? newValue.id : null); }}
                                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                                    renderInput={(params) => ( <TextField {...params} label="Formulador Asignado" variant="outlined" error={!!errors.formuladorId} helperText={errors.formuladorId?.message} /> )}
                                    disabled={isLoading || isSubmitting}
                                    fullWidth
                                />
                            )}
                        />
                     </Grid>
                 </Grid>

                 <Divider sx={{ my: 3 }} />

                 {/* --- SECCIÓN: FINANCIERA --- */}
                 <Typography variant="h6" gutterBottom>Información Financiera</Typography>
                 <Grid container spacing={2}>
                    {/* Linea Financiamiento */}
                    <Grid item xs={12} sm={6}> <FormControl fullWidth error={!!errors.lineaFinanciamientoId} disabled={isLoading || isSubmitting}> <InputLabel id="linea-select-label">Línea Financiamiento</InputLabel> <Controller name="lineaFinanciamientoId" control={control} render={({ field }) => ( <Select {...field} labelId="linea-select-label" label="Línea Financiamiento" onChange={(e) => { field.onChange(e.target.value); setValue('programaId', ''); }}> <MenuItem value=""><em>(Opcional)...</em></MenuItem> {(formOptions?.lineasFinanciamiento ?? []).map((o) => ( <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem> ))} </Select> )} /> {errors.lineaFinanciamientoId && <FormHelperText>{errors.lineaFinanciamientoId.message}</FormHelperText>} </FormControl> </Grid>
                    {/* Programa (Dependiente) */}
                    <Grid item xs={12} sm={6}> <FormControl fullWidth error={!!errors.programaId} disabled={isLoading || isSubmitting || !selectedLineaId}> <InputLabel id="programa-select-label">Programa</InputLabel> <Controller name="programaId" control={control} render={({ field }) => ( <Select {...field} labelId="programa-select-label" label="Programa" > <MenuItem value=""><em>{selectedLineaId ? '(Opcional)...' : '(Seleccione Línea)'}</em></MenuItem> {filteredProgramas.map((o) => ( <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem> ))} </Select> )} /> {errors.programaId && <FormHelperText>{errors.programaId.message}</FormHelperText>} </FormControl> </Grid>
                    {/* Etapa Financiamiento */}
                    <Grid item xs={12} sm={6}> <FormControl fullWidth error={!!errors.etapaFinanciamientoId} disabled={isLoading || isSubmitting}> <InputLabel id="etapa-select-label">Etapa Financiamiento</InputLabel> <Controller name="etapaFinanciamientoId" control={control} render={({ field }) => ( <Select {...field} labelId="etapa-select-label" label="Etapa Financiamiento"> <MenuItem value=""><em>(Opcional)...</em></MenuItem> {(formOptions?.etapasFinanciamiento ?? []).map((o) => ( <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem> ))} </Select> )} /> {errors.etapaFinanciamientoId && <FormHelperText>{errors.etapaFinanciamientoId.message}</FormHelperText>} </FormControl> </Grid>
                     {/* Monto */}
                     <Grid item xs={12} sm={3}> <Controller name="monto" control={control} render={({ field }) => ( <TextField {...field} label="Monto" type="number" fullWidth error={!!errors.monto} helperText={errors.monto?.message} disabled={isLoading || isSubmitting} inputProps={{ step: "any", min: "0" }} /> )} /> </Grid>
                     {/* Tipo Moneda */}
                     <Grid item xs={12} sm={3}> <FormControl fullWidth error={!!errors.tipoMoneda} disabled={isLoading || isSubmitting}> <InputLabel id="moneda-select-label">Moneda</InputLabel> <Controller name="tipoMoneda" control={control} render={({ field }) => ( <Select {...field} labelId="moneda-select-label" label="Moneda"> <MenuItem value="CLP">CLP</MenuItem> <MenuItem value="UF">UF</MenuItem> </Select> )} /> {errors.tipoMoneda && <FormHelperText>{errors.tipoMoneda.message}</FormHelperText>} </FormControl> </Grid>
                     {/* Fecha Postulación */}
                     <Grid item xs={12} sm={4}> <Controller name="fechaPostulacion" control={control} render={({ field }) => ( <TextField {...field} label="Fecha Postulación" type="date" InputLabelProps={{ shrink: true }} fullWidth error={!!errors.fechaPostulacion} helperText={errors.fechaPostulacion?.message} disabled={isLoading || isSubmitting} /> )} /> </Grid>
                    {/* Monto Adjudicado */}
                    <Grid item xs={12} sm={4}> <Controller name="montoAdjudicado" control={control} render={({ field }) => ( <TextField {...field} label="Monto Adjudicado" type="number" fullWidth error={!!errors.montoAdjudicado} helperText={errors.montoAdjudicado?.message} disabled={isLoading || isSubmitting} inputProps={{ step: "any", min: "0" }} /> )} /> </Grid>
                    {/* Código Expediente */}
                    <Grid item xs={12} sm={4}> <Controller name="codigoExpediente" control={control} render={({ field }) => ( <TextField {...field} label="Código Expediente" fullWidth error={!!errors.codigoExpediente} helperText={errors.codigoExpediente?.message} disabled={isLoading || isSubmitting} /> )} /> </Grid>
                    {/* Código Licitación */}
                    <Grid item xs={12} sm={4}> <Controller name="codigoLicitacion" control={control} render={({ field }) => ( <TextField {...field} label="Código Licitación (ID)" fullWidth error={!!errors.codigoLicitacion} helperText={errors.codigoLicitacion?.message} disabled={isLoading || isSubmitting} /> )} /> </Grid>
                 </Grid>

                 <Divider sx={{ my: 3 }} />

                {/* --- Botón de Envío --- */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" variant="contained" color="primary" disabled={isLoading || isSubmitting} > {isLoading || isSubmitting ? <CircularProgress size={24} /> : (isEditMode ? 'Guardar Cambios' : 'Crear Proyecto')} </Button>
                     <Button sx={{ ml: 1 }} onClick={() => navigate(-1)} disabled={isLoading || isSubmitting}>Cancelar</Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default ProjectForm;