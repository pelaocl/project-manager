import { Router } from 'express';
import { login } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { loginSchema } from '../schemas/auth.schema'; // Schema Zod (se creará luego)

const authRouter = Router();

// POST /api/auth/login
authRouter.post('/login', validateRequest(loginSchema), login); // Añadir validación Zod luego

// Aquí podrían ir otras rutas de autenticación (ej. register, refresh token)

export default authRouter;