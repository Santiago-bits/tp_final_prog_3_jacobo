import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const register = async (nombre: string, correo: string, contrasena: string) => {
  const hashed = await bcrypt.hash(contrasena, 10);
  return prisma.usuario.create({ data: { nombre, correo, contrasena: hashed } });
};

export const login = async (correo: string, contrasena: string) => {
  const usuario = await prisma.usuario.findUnique({ where: { correo } });
  if (!usuario) throw new Error('Credenciales inválidas');
  const valid = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!valid) throw new Error('Credenciales inválidas');
  const token = jwt.sign(
    { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
    process.env.JWT_SECRET as string,
    { expiresIn: '8h' }
  );
  return { token, user: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol } };
};
