import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/index';

const prisma = new PrismaClient();

export const updatePreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { colorSistema } = req.body;
    if (colorSistema !== 1 && colorSistema !== 2) {
      res.status(400).json({ message: 'colorSistema debe ser 1 (oscuro) o 2 (claro)' });
      return;
    }
    await prisma.usuario.update({
      where: { id: req.user!.id },
      data: { colorSistema },
    });
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
