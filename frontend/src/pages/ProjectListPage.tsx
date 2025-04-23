import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProjects } from '../services/projectService';
import { useAuthStore } from '../store/authStore';

import {
    Container, Typography, Box, CircularProgress, Alert, TableContainer,
    Table, TableHead, TableBody, TableRow, TableCell, Paper, TablePagination, Chip,
    Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

type Project = Awaited<ReturnType<typeof getAllProjects>>['projects'][0];

const ProjectListPage: React.FC = () => {
    // console.log('[ProjectListPage] Renderizando...'); // Log opcional

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [totalProjects, setTotalProjects] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const { isAuthenticated, user } = useAuthStore((state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
    }));
    const navigate = useNavigate();

    // Función para cargar proyectos
    const fetchProjects = useCallback(async () => {
        console.log(`[ProjectListPage] fetchProjects llamado (page: ${page}, rowsPerPage: ${rowsPerPage})`);
        setLoading(true); // Poner loading antes de llamar
        setError(null);
        try {
            const params = { page: page + 1, limit: rowsPerPage };
            const response = await getAllProjects(params);
            // console.log('[ProjectListPage] Respuesta recibida del servicio:', response); // Log opcional

            if (response && response.projects && typeof response.total === 'number') {
               setProjects(response.projects);
               setTotalProjects(response.total);
            } else {
               console.error('[ProjectListPage] Estructura de respuesta inesperada:', response);
               throw new Error('La respuesta de la API no tuvo el formato esperado.');
            }
        } catch (err: any) {
             console.error("[ProjectListPage] Error en fetchProjects:", err);
            setError(err.message || 'Error desconocido al cargar proyectos.');
            setProjects([]);
            setTotalProjects(0);
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, rowsPerPage]); // Dependencias correctas

    // useEffect para llamar a fetchProjects
    useEffect(() => {
        console.log(`[ProjectListPage] useEffect ejecutado. isAuthenticated: ${isAuthenticated}`);
        if (isAuthenticated) {
             fetchProjects();
        } else {
            setProjects([]);
            setTotalProjects(0);
            setLoading(false);
        }
     // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, rowsPerPage, isAuthenticated]); // Quitar fetchProjects de aquí, ya es estable por useCallback

    // Handlers
    const handleChangePage = (event: unknown, newPage: number) => { setPage(newPage); };
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
    const handleRowClick = (projectId: number) => { navigate(`/projects/${projectId}`); };

    // Función de renderizado de la tabla
    const renderTableContent = () => {
       if (!projects || projects.length === 0) {
            if (loading && page === 0) return null; // No mostrar mientras carga inicialmente
            return ( <TableRow> <TableCell colSpan={isAuthenticated ? 10 : 7} align="center"> No se encontraron proyectos. </TableCell> </TableRow> );
        }
        // ... map de projects ...
        return projects.map((project) => ( <TableRow hover role="button" tabIndex={-1} key={project.id} sx={{ cursor: 'pointer' }} onClick={() => handleRowClick(project.id)} > <TableCell> <Chip label={project.codigoUnico} size="small" sx={{ backgroundColor: project.tipologia?.colorChip || '#CCCCCC', color: theme => theme.palette.getContrastText(project.tipologia?.colorChip || '#CCCCCC'), fontWeight: 'bold' }} /> </TableCell> <TableCell>{project.nombre}</TableCell> <TableCell>{project.estado?.nombre || 'N/A'}</TableCell> <TableCell>{project.tipologia?.nombre || 'N/A'}</TableCell> <TableCell>{project.unidad?.abreviacion || 'N/A'}</TableCell> <TableCell>{project.sector?.nombre || 'N/A'}</TableCell> <TableCell>{project.ano || 'N/A'}</TableCell> {isAuthenticated && ( <> <TableCell>{project.proyectista?.name || '-'}</TableCell> <TableCell> {project.monto ? `${project.monto.toLocaleString('es-CL')} ${project.tipoMoneda}` : '-'} </TableCell> <TableCell> {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('es-CL') : '-'} </TableCell> </> )} </TableRow> ));
    };

    // --- Renderizado Principal ---
    // console.log('[ProjectListPage] Estado ANTES de renderizar:', { loading, error, projectsLength: projects?.length, totalProjects, page, rowsPerPage, isAuthenticated, userRole: user?.role });

    return (
        <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
                    Listado de Proyectos SECPLAN
                </Typography>
                { isAuthenticated && user && (user.role === 'ADMIN' || user.role === 'COORDINADOR') && (
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/projects/new')} >
                        Crear Proyecto
                    </Button>
                )}
            </Box>

            {/* Mostrar error general solo si no está cargando la primera página */}
            {error && !loading && page === 0 && ( <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> )}
             {/* Mostrar error de recarga */}
            {error && loading && page > 0 && ( <Alert severity="warning" sx={{ mb: 2 }}>Error al recargar proyectos: {error}</Alert> )}


            <Box sx={{ mb: 3 }}>
                <Typography variant="h6">Filtros (Pendiente)</Typography>
            </Box>

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 640 }}>
                    <Table stickyHeader aria-label="sticky table projects">
                        <TableHead>
                             <TableRow> <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell> <TableCell sx={{ fontWeight: 'bold' }}>Nombre Proyecto</TableCell> <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell> <TableCell sx={{ fontWeight: 'bold' }}>Tipología</TableCell> <TableCell sx={{ fontWeight: 'bold' }}>Unidad</TableCell> <TableCell sx={{ fontWeight: 'bold' }}>Sector</TableCell> <TableCell sx={{ fontWeight: 'bold' }}>Año</TableCell> {isAuthenticated && ( <> <TableCell sx={{ fontWeight: 'bold' }}>Proyectista</TableCell> <TableCell sx={{ fontWeight: 'bold' }}>Monto</TableCell> <TableCell sx={{ fontWeight: 'bold' }}>Últ. Modif.</TableCell> </> )} </TableRow>
                        </TableHead>
                        <TableBody>
                             {/* Mostrar Carga o Contenido */}
                             {loading ? (
                                 <TableRow> <TableCell colSpan={isAuthenticated ? 10 : 7} align="center"> <CircularProgress size={24} /> Cargando... </TableCell> </TableRow>
                             ) : (
                                renderTableContent()
                             )}
                        </TableBody>
                    </Table>
                </TableContainer>
                 {/* Mostrar paginación solo si no hay error y hay proyectos */}
                 {!error && totalProjects > 0 && (
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]} component="div" count={totalProjects} rowsPerPage={rowsPerPage}
                        page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Proyectos por página:"
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
                    />
                 )}
            </Paper>
        </Container>
    );
};

export default ProjectListPage;