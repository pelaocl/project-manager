import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById } from '../services/projectService';
import ProjectMap from '../components/map/ProjectMap';
import { useAuthStore } from '../store/authStore';
import {
    Container, Typography, Box, CircularProgress, Alert, Paper, Grid, Chip,
    Divider, Button, IconButton, Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';

type Project = Awaited<ReturnType<typeof getProjectById>>;

const ProjectDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { user, isAuthenticated } = useAuthStore();
    const projectId = useMemo(() => { const numId = Number(id); return isNaN(numId) ? NaN : numId; }, [id]);

    useEffect(() => {
        const fetchProject = async () => {
            setLoading(true); setError(null); setProject(null);
            try {
                if (isNaN(projectId)) throw new Error("ID inválido.");
                const data = await getProjectById(projectId);
                if (!data) throw new Error(`Proyecto con ID ${projectId} no encontrado.`);
                setProject(data);
            } catch (err: any) { setError(err.message || 'Error desconocido'); }
            finally { setLoading(false); }
        };
        if (!isNaN(projectId)) { fetchProject(); } else { setError(`ID inválido: ${id}`); setLoading(false); }
    }, [projectId]);

    // --- Helpers y canEdit ---
    const canEdit = () => { if (!isAuthenticated || !user || !project) return false; return user.role === 'ADMIN' || user.role === 'COORDINADOR' || (user.role === 'USUARIO' && project.proyectistaId === user.id); };
    const displayCurrency = (value: number | string | null | undefined, currency: string | null | undefined) => { try { const numericValue = (typeof value === 'string') ? parseFloat(value) : value; if (numericValue === null || numericValue === undefined || isNaN(numericValue)) return '-'; const options: Intl.NumberFormatOptions = (currency === 'CLP') ? { style: 'currency', currency: 'CLP', minimumFractionDigits: 0, maximumFractionDigits: 0 } : { minimumFractionDigits: 2, maximumFractionDigits: 2 }; return `${numericValue.toLocaleString('es-CL', options)} ${currency || ''}`; } catch (e) { console.error("Error formateando moneda:", e); return `${value} ${currency || ''}`; } }
    const displayDate = (value: string | Date | null | undefined) => { if (!value) return '-'; try { return new Date(value).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric'}); } catch (e) { console.error("Error formateando fecha:", e); return String(value); } }


    if (loading) { return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container>; }
    if (error) { return <Container><Alert severity="error" sx={{ mt: 3 }}>{error}</Alert></Container>; }
    if (!project) { return <Container><Alert severity="warning" sx={{ mt: 3 }}>No se pudieron cargar los datos del proyecto.</Alert></Container>; }

    // --- Renderizado Principal ---
    return (
        <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
             <Paper sx={{ p: 3, position: 'relative' }}>
                 {project.proyectoPriorizado && ( <Tooltip title="Proyecto Priorizado"><StarIcon color="secondary" sx={{ position: 'absolute', top: 16, right: 16, fontSize: 30 }}/></Tooltip> )}
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pr: project.proyectoPriorizado ? '40px' : 0 }}>
                     <Tooltip title="Volver al listado"><IconButton onClick={() => navigate('/')} aria-label="Volver" sx={{ mr: 1 }}><ArrowBackIcon /></IconButton></Tooltip>
                     <Chip label={project.codigoUnico ?? '-'} size="medium" sx={{ backgroundColor: project.tipologia?.colorChip ?? '#CCCCCC', color: theme => theme.palette.getContrastText(project.tipologia?.colorChip ?? '#CCCCCC'), fontWeight: 'bold', fontSize: '1rem', mr: 2 }} />
                     <Typography variant="h4" component="h1" sx={{ flexGrow: 1, mr: 1 }}> {project.nombre ?? 'Sin Nombre'} </Typography>
                    {/* Botón Editar - onClick comentado por ahora */}
                    {canEdit() && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<EditIcon />}
                            // onClick={() => { if (project?.id) { navigate(`/projects/${project.id}/edit`) } }} // <-- MANTENER COMENTADO POR AHORA
                            sx={{ flexShrink: 0 }}
                            disabled // Deshabilitar visualmente mientras onClick está comentado
                        >
                            Editar
                        </Button>
                     )}
                </Box>
                <Divider sx={{ mb: 3 }} />
                 <Grid container spacing={4}>
                     {/* Columna Izquierda */}
                     <Grid item xs={12} md={6}>
                          <Typography variant="h6" gutterBottom sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>Información Básica</Typography>
                          <Typography variant="body1" gutterBottom><strong>Estado:</strong> {project.estado?.nombre ?? '-'}</Typography>
                          <Typography variant="body1" gutterBottom><strong>Tipología:</strong> {project.tipologia?.nombre ?? '-'}</Typography>
                          <Typography variant="body1" gutterBottom><strong>Unidad Municipal:</strong> {project.unidad?.nombre ?? '-'} ({project.unidad?.abreviacion ?? '-'})</Typography>
                          <Typography variant="body1" gutterBottom><strong>Sector:</strong> {project.sector?.nombre ?? '-'}</Typography>
                          <Typography variant="body1" gutterBottom><strong>Año Iniciativa:</strong> {project.ano ?? '-'}</Typography>
                          <Typography variant="body1" gutterBottom><strong>Dirección:</strong> {project.direccion ?? '-'}</Typography>
                          <Typography variant="body1" gutterBottom><strong>Superficie Terreno:</strong> {project.superficieTerreno ? `${project.superficieTerreno} m²` : '-'}</Typography>
                          <Typography variant="body1" gutterBottom><strong>Superficie Edificación:</strong> {project.superficieEdificacion ? `${project.superficieEdificacion} m²` : '-'}</Typography>
                          <Typography variant="body1" gutterBottom><strong>Priorizado:</strong> {project.proyectoPriorizado ? 'Sí' : 'No'}</Typography>
                          {isAuthenticated && project.descripcion && ( <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}> <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Descripción:</Typography> <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{project.descripcion}</Typography> </Box> )}
                           <Typography variant="h6" gutterBottom sx={{ mt: 3, borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>Ubicación</Typography>
                           <ProjectMap />
                     </Grid>
                      {/* Columna Derecha */}
                     <Grid item xs={12} md={6}>
                         {isAuthenticated ? ( <> <Typography variant="h6" gutterBottom sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>Equipo</Typography> <Typography variant="body1" gutterBottom><strong>Proyectista:</strong> {project.proyectista?.name ?? '-'}</Typography> <Typography variant="body1" gutterBottom><strong>Formulador:</strong> {project.formulador?.name ?? '-'}</Typography> <Typography variant="h6" gutterBottom sx={{ mt: 3, borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>Información Financiera</Typography> <Typography variant="body1" gutterBottom><strong>Monto (General):</strong> {displayCurrency(project.monto, project.tipoMoneda)}</Typography> <Typography variant="body1" gutterBottom><strong>Línea Financiamiento:</strong> {project.lineaFinanciamiento?.nombre ?? '-'}</Typography> <Typography variant="body1" gutterBottom><strong>Programa:</strong> {project.programa?.nombre ?? '-'}</Typography> <Typography variant="body1" gutterBottom><strong>Etapa Financiamiento:</strong> {project.etapaActualFinanciamiento?.nombre ?? '-'}</Typography> <Typography variant="body1" gutterBottom><strong>Código Expediente:</strong> {project.codigoExpediente ?? '-'}</Typography> <Typography variant="body1" gutterBottom><strong>Fecha Postulación:</strong> {displayDate(project.fechaPostulacion)}</Typography> <Typography variant="body1" gutterBottom><strong>Monto Adjudicado:</strong> {displayCurrency(project.montoAdjudicado, project.tipoMoneda)}</Typography> <Typography variant="body1" gutterBottom><strong>Código Licitación:</strong> {project.codigoLicitacion ?? '-'}</Typography> <Divider sx={{ mt: 3, mb:1 }}/> <Typography variant="caption" display="block" sx={{ color: 'text.secondary', textAlign: 'right' }}> Creado: {displayDate(project.createdAt)} | Últ. Modificación: {displayDate(project.updatedAt)} </Typography> </> ) : ( <Alert severity="info">Inicia sesión para ver la información del equipo y financiera.</Alert> )}
                     </Grid>
                </Grid>
                 {/* Bitácora Placeholder */}
                 {isAuthenticated && ( <Box sx={{ mt: 4 }}> <Typography variant="h6" gutterBottom sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>Bitácora (Pendiente)</Typography> </Box> )}
            </Paper>
        </Container>
    );
};

export default ProjectDetailPage;