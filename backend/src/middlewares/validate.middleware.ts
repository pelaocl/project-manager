import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validateRequest = (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Loggear el error de Zod aquí en el backend sigue siendo útil para debugging futuro
        // console.error('[ValidateMiddleware] Error de Zod:', error.errors);
        const formattedErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({
          message: 'Error de validación.',
          errors: formattedErrors,
        });
      }
      // Loggear otros errores inesperados
      console.error('[ValidateMiddleware] Error inesperado en validación:', error);
      return res.status(500).json({ message: 'Error interno del servidor.' });
    }
  };