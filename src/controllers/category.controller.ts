import { Request, Response } from 'express';
import * as categoryService from '../services/category.service';

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  res.json(await categoryService.getAll());
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(201).json(await categoryService.create(req.body.nombre));
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(await categoryService.update(Number(req.params.id), req.body.nombre));
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    await categoryService.remove(Number(req.params.id));
    res.status(204).send();
  } catch {
    res.status(404).json({ message: 'Categoría no encontrada' });
  }
};
