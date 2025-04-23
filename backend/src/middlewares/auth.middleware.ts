import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// Extendemos el tipo Request de Express para incluir la propiedad 'user'
declare global {
    namespace Express {
        interface Request {
            user?: { userId: number; role: string };
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

  if (token == null) {
    return res.status(401).json({ message: 'No autorizado: Token no proporcionado.' });
  }

  const userPayload = verifyToken(token);

  if (!userPayload) {
    return res.status(403).json({ message: 'No autorizado: Token inválido o expirado.' });
  }

  // Añadir payload al objeto request para usarlo en controladores posteriores
  req.user = userPayload;
  next(); // Pasa al siguiente middleware o controlador
};