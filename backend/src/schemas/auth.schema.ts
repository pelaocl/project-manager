import { z } from 'zod';

export const loginSchema = z.object({
  // Validamos el 'body' de la petición
  body: z.object({
    email: z
      .string({ required_error: 'El correo electrónico es requerido.' })
      .email({ message: 'Debe proporcionar un correo electrónico válido.' }),
    password: z
      .string({ required_error: 'La contraseña es requerida.' })
      .min(1, { message: 'La contraseña no puede estar vacía.' }),
  }),
  // Query y Params no son necesarios para login, los hacemos opcionales en el schema principal
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

// Exportamos el tipo inferido si es necesario en otros lugares
export type LoginInput = z.infer<typeof loginSchema>['body'];