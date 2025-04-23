import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors, { CorsOptions } from 'cors'; // Importar CorsOptions
import mainRouter from './src/routes';
// import { errorMiddleware } from './src/middlewares/error.middleware'; // Descomentar luego

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'; // Usar valor de .env o default

// --- Configuración CORS Explícita ---
const corsOptions: CorsOptions = {
  origin: corsOrigin, // Permitir solo el origen del frontend
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS", // Incluir OPTIONS aquí también
  allowedHeaders: "Content-Type,Authorization", // Cabeceras permitidas (IMPORTANTE: incluir Authorization)
  credentials: true, // Si planeas usar cookies/sesiones en el futuro
  optionsSuccessStatus: 204 // Responder 204 a las peticiones OPTIONS (preflight)
};
console.log(`[CORS] Configurado para origen: ${corsOrigin}`); // Log de configuración CORS
// --- Fin Configuración CORS ---


// --- Middlewares ---
// 1. Habilitar CORS ANTES de otras rutas/middlewares
app.use(cors(corsOptions));

// 2. Middlewares para parsear el body (después de CORS)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// --- Fin Middlewares ---


// Ruta de salud básica
app.get('/', (req: Request, res: Response) => {
  res.send('API Gestor de Proyectos SECPLAN - Running!');
});

// Rutas principales de la API
app.use('/api', mainRouter); // Usar el enrutador principal bajo /api

// Middleware de manejo de errores (futuro)
// app.use(errorMiddleware);

// --- Escuchar en 0.0.0.0 (Mantenemos esta mejora) ---
app.listen(port, '0.0.0.0', () => {
    console.log(`⚡️[server]: Server is running and listening on http://0.0.0.0:${port}`);
    console.log(`       Access API via http://localhost:${port}/api`);
    console.log(`       Frontend origin allowed: ${corsOrigin}`);
});