import { Router } from 'express';
import { getFormOptionsController } from '../controllers/lookup.controller';
import { authenticateToken } from '../middlewares/auth.middleware'; // Proteger la ruta?

const lookupRouter = Router();

// GET /api/lookups/form-options
// Requiere autenticación para obtener la lista (incluye lista de usuarios)
lookupRouter.get('/form-options', authenticateToken, getFormOptionsController);

export default lookupRouter;