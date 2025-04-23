import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Crear una instancia del tema.
const theme = createTheme({
  palette: {
    primary: {
      // Puedes usar colores específicos de la Muni de Concepción si los tienes
      main: '#0D47A1', // Un azul oscuro como ejemplo
      light: '#5472D3',
      dark: '#002171',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FFAB00', // Un ámbar como ejemplo
      light: '#FFDD4B',
      dark: '#C67C00',
      contrastText: '#000000',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#f4f6f8', // Un gris claro para el fondo general
      paper: '#ffffff',   // Blanco para elementos tipo "papel" (cards, etc)
    }
  },
  typography: {
    // Puedes ajustar fuentes si es necesario
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  // Puedes añadir personalizaciones a componentes aquí
  /*
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Ejemplo: botones más redondeados
        },
      },
    },
  },
  */
});

export default theme;