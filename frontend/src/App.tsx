import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './styles/theme';
import AppRoutes from './routes/AppRoutes'; // Volver a usar AppRoutes

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes /> {/* Renderizar las rutas */}
    </ThemeProvider>
  );
};

export default App;