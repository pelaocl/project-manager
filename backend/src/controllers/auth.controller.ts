import { Request, Response } from 'express';
import { loginUser } from '../services/auth.service'; // Importar el servicio (se creará luego)

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    // Llamar al servicio para manejar la lógica de login
    const result = await loginUser(email, password);

    if (!result) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // Si el login es exitoso, el servicio devuelve el token y datos del usuario
    return res.status(200).json({
      message: 'Login exitoso.',
      token: result.token,
      user: result.userData,
    });

  } catch (error: any) {
    // Manejo básico de errores (se puede mejorar con errorMiddleware)
    console.error("Error en login controller:", error);
    return res.status(500).json({ message: error.message || 'Error interno del servidor durante el login.' });
  }
};