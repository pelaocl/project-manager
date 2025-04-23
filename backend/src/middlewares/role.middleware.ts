import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client'; // Importar el Enum Role generado por Prisma

// Este es un middleware factory: devuelve una función middleware configurada
export const authorizeRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      // Esto no debería pasar si authenticateToken se ejecutó antes, pero por seguridad
      return res.status(401).json({ message: 'No autorizado: Usuario no autenticado.' });
    }

    const userRole = req.user.role as Role; // Aseguramos que role sea del tipo Role

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Prohibido: No tienes permiso para realizar esta acción.' });
    }

    next(); // El usuario tiene el rol permitido, continuar
  };
};