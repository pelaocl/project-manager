import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// --- CORRECCIÓN: Añadir Box a los imports ---
import { Container, Typography, CircularProgress, Alert, Snackbar, Box } from '@mui/material';
// --- Fin Corrección ---
import ProjectForm from '../components/project/ProjectForm';
import { getFormOptions, createProject, FormOptions, CreateProjectData } from '../services/projectService';
import { ProjectFormData } from '../schemas/projectSchema';

const ProjectCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const [formOptions, setFormOptions] = useState<FormOptions | null>(null);
    const [optionsLoading, setOptionsLoading] = useState<boolean>(true);
    const [optionsError, setOptionsError] = useState<string | null>(null);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

    // Cargar opciones al montar
    useEffect(() => {
        const loadOptions = async () => {
            setOptionsLoading(true);
            setOptionsError(null);
            try {
                const options = await getFormOptions();
                setFormOptions(options);
            } catch (error: any) {
                setOptionsError(error.message || "Error cargando opciones");
            } finally {
                setOptionsLoading(false);
            }
        };
        loadOptions();
    }, []);

    // Función que se pasa al formulario para manejar el envío
    const handleCreateProject = async (formData: ProjectFormData) => {
        setSubmitLoading(true);
        setSubmitError(null);

        // Convertir/Limpiar datos
        const dataToSend: CreateProjectData = {
            ...formData,
            estadoId: formData.estadoId || null,
            unidadId: formData.unidadId || null,
            sectorId: formData.sectorId || null,
            proyectistaId: formData.proyectistaId || null,
            formuladorId: formData.formuladorId || null,
            lineaFinanciamientoId: formData.lineaFinanciamientoId || null,
            programaId: formData.programaId || null,
            etapaFinanciamientoId: formData.etapaFinanciamientoId || null,
            ano: formData.ano === null || isNaN(Number(formData.ano)) ? null : Number(formData.ano),
            superficieTerreno: formData.superficieTerreno === null || isNaN(Number(formData.superficieTerreno)) ? null : Number(formData.superficieTerreno),
            superficieEdificacion: formData.superficieEdificacion === null || isNaN(Number(formData.superficieEdificacion)) ? null : Number(formData.superficieEdificacion),
            monto: formData.monto === null || isNaN(Number(formData.monto)) ? null : Number(formData.monto),
            montoAdjudicado: formData.montoAdjudicado === null || isNaN(Number(formData.montoAdjudicado)) ? null : Number(formData.montoAdjudicado),
            fechaPostulacion: formData.fechaPostulacion ? new Date(formData.fechaPostulacion) : null,
        };

        try {
            console.log("Enviando datos al backend:", dataToSend);
            const newProject = await createProject(dataToSend);
            setSnackbarOpen(true);
            setTimeout(() => navigate(`/projects/${newProject.id}`), 1500);
        } catch (error: any) {
            setSubmitError(error.message || "Error desconocido al crear el proyecto.");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };


    return (
        <Container maxWidth="md">
            <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 3, mb: 3 }}>
                Crear Nuevo Proyecto
            </Typography>

            {optionsError && <Alert severity="error" sx={{ mb: 2 }}>{optionsError}</Alert>}

            {/* Ahora Box está importado y se puede usar */}
            {optionsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
            ) : formOptions ? (
                <>
                 {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
                 <ProjectForm
                    onSubmit={handleCreateProject}
                    isLoading={submitLoading}
                    formOptions={formOptions}
                    optionsLoading={optionsLoading}
                 />
                </>
            ) : (
                 <Alert severity="warning">No se pudieron cargar las opciones del formulario.</Alert>
            )}

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                message="¡Proyecto creado exitosamente!"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Container>
    );
};

export default ProjectCreatePage;