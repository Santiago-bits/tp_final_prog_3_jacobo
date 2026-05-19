import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    correo: string;
    rol: string;
  };
}
