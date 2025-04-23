import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, CircularProgress, Alert, Snackbar, Box } from '@mui/material';
import ProjectForm from '../components/project/ProjectForm'; // Asegúrate que la ruta sea correcta
import { getFormOptions, getProjectById, updateProject, FormOptions, UpdateProjectData, ProjectDetail } from '../services/projectService'; // Asegúrate que la ruta sea correcta
import { ProjectFormData } from '../schemas/projectSchema'; // Asegúrate que la ruta sea correcta

const ProjectEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [projectData, setProjectData] = useState<ProjectDetail | null>(null);
    const [formOptions, setFormOptions] = useState<FormOptions | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // Loading inicial para datos y opciones
    const [error, setError] = useState<string | null>(null);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

    const projectId = Number(id);

    // Cargar datos del proyecto y opciones del formulario al montar
    useEffect(() => {
        if (isNaN(projectId)) {
            setError("ID de proyecto inválido.");
            setLoading(false);
            return;
        }
        const loadInitialData = async () => {
            setLoading(true); setError(null);
            try {
                // Ejecutar ambas cargas en paralelo
                const [options, project] = await Promise.all([
                    getFormOptions(),
                    getProjectById(projectId)
                ]);
                if (!project) throw new Error(`Proyecto con ID ${projectId} no encontrado.`);
                setFormOptions(options);
                setProjectData(project);
                console.log("Datos iniciales para edición:", project);
            } catch (error: any) {
                console.error("Error cargando datos para edición:", error);
                setError(error.message || "Error cargando datos para edición");
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [projectId]);

    // Función que se pasa al formulario para manejar el envío
    const handleUpdateProject = async (formData: ProjectFormData) => {
        if (isNaN(projectId)) return;
        setSubmitLoading(true); setSubmitError(null);

        // Convertir/Limpiar datos antes de enviar
        const dataToSend: UpdateProjectData = {
            ...formData,
            estadoId: formData.estadoId || null, unidadId: formData.unidadId || null, sectorId: formData.sectorId || null,
            proyectistaId: formData.proyectistaId || null, formuladorId: formData.formuladorId || null, lineaFinanciamientoId: formData.lineaFinanciamientoId || null,
            programaId: formData.programaId || null, etapaFinanciamientoId: formData.etapaFinanciamientoId || null,
            ano: formData.ano === null || formData.ano === '' || isNaN(Number(formData.ano)) ? null : Number(formData.ano),
            superficieTerreno: formData.superficieTerreno === null || formData.superficieTerreno === '' || isNaN(Number(formData.superficieTerreno)) ? null : Number(formData.superficieTerreno),
            superficieEdificacion: formData.superficieEdificacion === null || formData.superficieEdificacion === '' || isNaN(Number(formData.superficieEdificacion)) ? null : Number(formData.superficieEdificacion),
            monto: formData.monto === null || formData.monto === '' || isNaN(Number(formData.monto)) ? null : Number(formData.monto),
            montoAdjudicado: formData.montoAdjudicado === null || formData.montoAdjudicado === '' || isNaN(Number(formData.montoAdjudicado)) ? null : Number(formData.montoAdjudicado),
            // Convertir fecha de string (del input type=date) a objeto Date o string ISO si API lo requiere. Zod coerce debería manejarlo.
            // Si fechaPostulacion es string yyyy-mm-dd y se necesita Date:
            fechaPostulacion: formData.fechaPostulacion ? new Date(formData.fechaPostulacion + 'T00:00:00') : null, // Ajustar según necesidad de zona horaria
            descripcion: formData.descripcion || null, direccion: formData.direccion || null,
            codigoExpediente: formData.codigoExpediente || null, codigoLicitacion: formData.codigoLicitacion || null
        };


        try {
            console.log(`Enviando datos actualizados al backend (ID: ${projectId}):`, dataToSend);
            await updateProject(projectId, dataToSend);
            setSnackbarOpen(true);
            setTimeout(() => navigate(`/projects/${projectId}`), 1500); // Volver al detalle
        } catch (error: any) {
             console.error("Error en handleUpdateProject:", error);
            setSubmitError(error.message || "Error desconocido al actualizar el proyecto.");
        } finally {
            setSubmitLoading(false);
        }
    };

     const handleSnackbarClose = () => { setSnackbarOpen(false); };

    // --- Renderizado ---
    if (loading) { return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container>; }
    if (error) { return <Container><Alert severity="error" sx={{ mt: 3 }}>{error}</Alert></Container>; }
    if (!projectData || !formOptions) { return <Container><Alert severity="warning" sx={{ mt: 3 }}>No se pudieron cargar los datos necesarios para editar.</Alert></Container>; }

    // Preparar datos iniciales para el formulario
     const initialFormData: Partial<ProjectFormData> = {
        nombre: projectData.nombre ?? "", tipologiaId: projectData.tipologiaId ?? "", estadoId: projectData.estadoId ?? "",
        descripcion: projectData.descripcion ?? "", unidadId: projectData.unidadId ?? "", direccion: projectData.direccion ?? "",
        superficieTerreno: projectData.superficieTerreno ?? "", superficieEdificacion: projectData.superficieEdificacion ?? "", sectorId: projectData.sectorId ?? "",
        ano: projectData.ano ?? "", proyectoPriorizado: projectData.proyectoPriorizado ?? false, proyectistaId: projectData.proyectistaId ?? null,
        formuladorId: projectData.formuladorId ?? null, lineaFinanciamientoId: projectData.lineaFinanciamientoId ?? "", programaId: projectData.programaId ?? "",
        etapaFinanciamientoId: projectData.etapaFinanciamientoId ?? "", codigoExpediente: projectData.codigoExpediente ?? "",
        fechaPostulacion: projectData.fechaPostulacion ? new Date(projectData.fechaPostulacion).toISOString().split('T')[0] : "", // Formatear a YYYY-MM-DD para input date
        monto: projectData.monto ?? "", tipoMoneda: projectData.tipoMoneda ?? "CLP", montoAdjudicado: projectData.montoAdjudicado ?? "",
        codigoLicitacion: projectData.codigoLicitacion ?? "",
    };


    return (
        <Container maxWidth="md">
            <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 3, mb: 3 }}>
                Editar Proyecto: {projectData.nombre}
            </Typography>
            {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
            <ProjectForm
                onSubmit={handleUpdateProject}
                initialData={initialFormData} // Pasar los datos cargados
                isLoading={submitLoading}
                formOptions={formOptions}
                optionsLoading={false}
                optionsError={null}
                isEditMode={true}         // Indicar modo edición
            />
            <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} message="¡Proyecto actualizado exitosamente!" anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
        </Container>
    );
};

export default ProjectEditPage;