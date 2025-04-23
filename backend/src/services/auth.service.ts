import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { signToken } from '../utils/jwt';

const prisma = new PrismaClient();

// Tipo para los datos del usuario que se devuelven al frontend (sin password)
type UserData = Omit<User, 'password'>;

export const loginUser = async (email: string, passwordInput: string): Promise<{ token: string; userData: UserData } | null> => {
  // 1. Buscar usuario por email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null; // Usuario no encontrado
  }

  // 2. Comparar contraseña proporcionada con la hasheada en la BD
  const isPasswordValid = await bcrypt.compare(passwordInput, user.password);

  if (!isPasswordValid) {
    return null; // Contraseña incorrecta
  }

  // 3. Generar Token JWT
  const tokenPayload = {
    userId: user.id,
    role: user.role,
  };
  const token = signToken(tokenPayload);

  // 4. Preparar datos del usuario para devolver (excluir password)
  const { password, ...userData } = user;

  return { token, userData };
};