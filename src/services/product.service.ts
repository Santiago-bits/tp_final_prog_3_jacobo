import { prisma } from '../db';
import { getIO } from '../socket';

export const getAll = () =>
  prisma.producto.findMany({ include: { categoria: true } });

export const getById = (id: number) =>
  prisma.producto.findUniqueOrThrow({ where: { id }, include: { categoria: true } });

export const getLowStock = async () => {
  const productos = await prisma.producto.findMany({ where: { activo: true }, include: { categoria: true } });
  return productos.filter(p => p.stock <= p.stockMinimo);
};

const generateCode = async (): Promise<string> => {
  const last = await prisma.producto.findFirst({
    where: { codigo: { not: null } },
    orderBy: { codigo: 'desc' },
  });
  if (!last?.codigo) return '0001';
  const next = parseInt(last.codigo, 10) + 1;
  return String(next).padStart(4, '0');
};

export const create = async (data: {
  nombre: string;
  descripcion?: string;
  precioCosto?: number;
  precio: number;
  stock: number;
  stockMinimo?: number;
  categoriaId: number;
  activo?: boolean;
}) => {
  const codigo = await generateCode();
  return prisma.producto.create({ data: { ...data, codigo }, include: { categoria: true } });
};

export const update = async (id: number, data: {
  nombre?: string;
  descripcion?: string;
  precioCosto?: number;
  precio?: number;
  stock?: number;
  stockMinimo?: number;
  categoriaId?: number;
  activo?: boolean;
}) => {
  const producto = await prisma.producto.update({ where: { id }, data, include: { categoria: true } });
  if (producto.activo && producto.stock <= producto.stockMinimo) {
    getIO()?.emit('low-stock', producto);
  }
  return producto;
};

export const remove = (id: number) => prisma.producto.delete({ where: { id } });
