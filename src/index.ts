import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: 'prisma/.env' });
import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import bcrypt from 'bcryptjs';
import { prisma } from './db';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import saleRoutes from './routes/sale.routes';
import userRoutes from './routes/user.routes';
import { setIO } from './socket';

async function seedIfEmpty() {
  const count = await prisma.usuario.count();
  if (count > 0) return;

  console.log('DB vacía, sembrando datos iniciales...');

  await prisma.usuario.createMany({
    data: [
      { nombre: 'Administrador', correo: 'admin@shservicios.com',    contrasena: await bcrypt.hash('admin123',    10), rol: 'ADMIN'    },
      { nombre: 'Vendedor',      correo: 'vendedor@shservicios.com', contrasena: await bcrypt.hash('vendedor123', 10), rol: 'VENDEDOR' },
    ],
  });

  const cats = await prisma.categoria.createMany({
    data: [
      { nombre: 'Elevadores y Levanta Autos' },
      { nombre: 'Equipos de Taller' },
      { nombre: 'Herramientas Neumaticas' },
    ],
  });
  const [cat1, cat2, cat3] = await prisma.categoria.findMany({ orderBy: { id: 'asc' } });

  await prisma.producto.createMany({
    data: [
      { codigo: '0002', nombre: 'Elevador Columna 2 Postes 4000 kg',  precio: 849400,  precioCosto: 620000,  stock: 1,   stockMinimo: 1, activo: true,  categoriaId: cat1.id },
      { codigo: '0003', nombre: 'Elevador 4 Columnas 5000 kg',        precio: 1290000, precioCosto: 980000,  stock: 193, stockMinimo: 1, activo: false, categoriaId: cat1.id },
      { codigo: '0004', nombre: 'Gato Hidraulico de Piso 3 Ton',      precio: 52000,   precioCosto: 38000,   stock: 99,  stockMinimo: 3, activo: true,  categoriaId: cat1.id },
      { codigo: '0005', nombre: 'Caballete Mecanico 3 Ton (par)',     precio: 21000,   precioCosto: 14500,   stock: 20,  stockMinimo: 4, activo: true,  categoriaId: cat1.id },
      { codigo: '0006', nombre: 'Compresor de Aire 100L 3 HP',        precio: 128000,  precioCosto: 95000,   stock: 5,   stockMinimo: 2, activo: true,  categoriaId: cat2.id },
      { codigo: '0007', nombre: 'Balanceadora de Ruedas Digital',     precio: 560000,  precioCosto: 420000,  stock: 0,   stockMinimo: 1, activo: true,  categoriaId: cat2.id },
      { codigo: '0008', nombre: 'Alineadora 3D Laser 4 Ruedas',       precio: 1650000, precioCosto: 1250000, stock: 1,   stockMinimo: 1, activo: true,  categoriaId: cat2.id },
      { codigo: '0009', nombre: 'Pistola de Impacto Neumatica 1/2"',  precio: 31500,   precioCosto: 22000,   stock: 12,  stockMinimo: 3, activo: true,  categoriaId: cat3.id },
      { codigo: '0010', nombre: 'Kit Inflador Digital de Neumaticos', precio: 13500,   precioCosto: 8500,    stock: 21,  stockMinimo: 5, activo: true,  categoriaId: cat3.id },
    ],
  });

  console.log('Seed completo: 2 usuarios, 3 categorías, 9 productos.');
}

async function seedSHProductos() {
  const exists = await prisma.producto.findFirst({ where: { codigo: { startsWith: 'SH-' } } });
  if (exists) return;

  console.log('Sembrando catálogo SH Servicios...');

  const catNames = [
    'Apiladores', 'Autoelevadores', 'Carretillas Hidráulicas', 'Plataformas de Altura',
    'Tractores', 'Implementos Agrícolas', 'Grupos Electrógenos', 'Torres de Iluminación',
    'Compresores de Aire', 'Secadores de Aire', 'Repuestos y Accesorios',
  ];
  for (const nombre of catNames) {
    await prisma.categoria.upsert({ where: { nombre }, update: {}, create: { nombre } });
  }
  const allCats = await prisma.categoria.findMany();
  const catId = (nombre: string) => allCats.find(c => c.nombre === nombre)!.id;

  const productos = [
    { codigo: 'SH-AP01', nombre: 'Apilador Manual 1000 kg',                   descripcion: 'Apilador manual de horquillas con elevación hidráulica. Capacidad 1000 kg, altura máx. 1600 mm.',         precio: 450000,   precioCosto: 310000,   stock: 8,  stockMinimo: 2, categoriaId: catId('Apiladores') },
    { codigo: 'SH-AP02', nombre: 'Apilador Manual 1500 kg',                   descripcion: 'Apilador manual de horquillas. Capacidad 1500 kg, altura máx. 1600 mm.',                                    precio: 580000,   precioCosto: 400000,   stock: 6,  stockMinimo: 2, categoriaId: catId('Apiladores') },
    { codigo: 'SH-AP03', nombre: 'Apilador Eléctrico Hyster E1.0S 1000 kg',  descripcion: 'Apilador eléctrico Hyster. Capacidad 1000 kg, mástil triplex 3300 mm, batería 24V/210Ah.',                  precio: 3800000,  precioCosto: 2700000,  stock: 3,  stockMinimo: 1, categoriaId: catId('Apiladores') },
    { codigo: 'SH-AP04', nombre: 'Apilador Eléctrico Hyster E1.5S 1500 kg',  descripcion: 'Apilador eléctrico Hyster. Capacidad 1500 kg, mástil triplex 4000 mm, batería 24V/280Ah.',                  precio: 5200000,  precioCosto: 3700000,  stock: 2,  stockMinimo: 1, categoriaId: catId('Apiladores') },
    { codigo: 'SH-AP05', nombre: 'Apilador Eléctrico Hyster E2.0S 2000 kg',  descripcion: 'Apilador eléctrico Hyster. Capacidad 2000 kg, mástil triplex 4500 mm, batería 48V/280Ah.',                  precio: 7100000,  precioCosto: 5100000,  stock: 1,  stockMinimo: 1, categoriaId: catId('Apiladores') },
    { codigo: 'SH-AP06', nombre: 'Apilador de Mástil Retráctil 1200 kg',     descripcion: 'Apilador retráctil eléctrico para pasillos angostos. Capacidad 1200 kg, alcance 5500 mm.',                  precio: 9500000,  precioCosto: 6800000,  stock: 1,  stockMinimo: 1, categoriaId: catId('Apiladores') },
    { codigo: 'SH-AE01', nombre: 'Autoelevador Hyster H2.0FT 2 Ton GLP',     descripcion: 'Autoelevador a GLP Hyster. Capacidad 2000 kg, mástil triplex 4800 mm, motor Mazda GLP.',                   precio: 12500000, precioCosto: 9000000,  stock: 2,  stockMinimo: 1, categoriaId: catId('Autoelevadores') },
    { codigo: 'SH-AE02', nombre: 'Autoelevador Hyster H2.5FT 2.5 Ton GLP',   descripcion: 'Autoelevador a GLP Hyster. Capacidad 2500 kg, mástil triplex 4800 mm, motor Mazda GLP.',                   precio: 15800000, precioCosto: 11400000, stock: 2,  stockMinimo: 1, categoriaId: catId('Autoelevadores') },
    { codigo: 'SH-AE03', nombre: 'Autoelevador Hyster H3.0FT 3 Ton GLP',     descripcion: 'Autoelevador a GLP Hyster. Capacidad 3000 kg, mástil triplex 5000 mm, motor Mazda GLP.',                   precio: 19200000, precioCosto: 14000000, stock: 1,  stockMinimo: 1, categoriaId: catId('Autoelevadores') },
    { codigo: 'SH-AE04', nombre: 'Autoelevador Hagncha H20 2 Ton GLP',       descripcion: 'Autoelevador a GLP Hagncha. Capacidad 2000 kg, mástil duplex 3300 mm, económico y robusto.',               precio: 9800000,  precioCosto: 7000000,  stock: 3,  stockMinimo: 1, categoriaId: catId('Autoelevadores') },
    { codigo: 'SH-AE05', nombre: 'Autoelevador Hagncha H30 3 Ton GLP',       descripcion: 'Autoelevador a GLP Hagncha. Capacidad 3000 kg, mástil triplex 4500 mm.',                                    precio: 13600000, precioCosto: 9800000,  stock: 2,  stockMinimo: 1, categoriaId: catId('Autoelevadores') },
    { codigo: 'SH-AE06', nombre: 'Autoelevador Eléctrico Hyster E2.0XN',     descripcion: 'Autoelevador eléctrico Hyster. Capacidad 2000 kg, batería 48V/500Ah, mástil triplex 4800 mm.',              precio: 22000000, precioCosto: 16000000, stock: 1,  stockMinimo: 1, categoriaId: catId('Autoelevadores') },
    { codigo: 'SH-AE07', nombre: 'Autoelevador Diésel Hagncha FD30 3 Ton',   descripcion: 'Autoelevador diésel Hagncha. Capacidad 3000 kg, motor Isuzu C240, mástil triplex.',                        precio: 18500000, precioCosto: 13500000, stock: 1,  stockMinimo: 1, categoriaId: catId('Autoelevadores') },
    { codigo: 'SH-CH01', nombre: 'Transpaleta Manual 2000 kg',                descripcion: 'Transpaleta manual con timón ergonómico. Capacidad 2000 kg, horquillas 1150×160 mm.',                      precio: 280000,   precioCosto: 190000,   stock: 15, stockMinimo: 3, categoriaId: catId('Carretillas Hidráulicas') },
    { codigo: 'SH-CH02', nombre: 'Transpaleta Manual 3000 kg',                descripcion: 'Transpaleta manual reforzada. Capacidad 3000 kg, horquillas 1150×160 mm.',                                  precio: 350000,   precioCosto: 240000,   stock: 12, stockMinimo: 3, categoriaId: catId('Carretillas Hidráulicas') },
    { codigo: 'SH-CH03', nombre: 'Transpaleta Manual 5000 kg',                descripcion: 'Transpaleta manual alta capacidad. Capacidad 5000 kg.',                                                      precio: 480000,   precioCosto: 330000,   stock: 6,  stockMinimo: 2, categoriaId: catId('Carretillas Hidráulicas') },
    { codigo: 'SH-CH04', nombre: 'Transpaleta Eléctrica 1500 kg',             descripcion: 'Transpaleta eléctrica con batería 24V/80Ah. Capacidad 1500 kg, velocidad 6 km/h.',                         precio: 1900000,  precioCosto: 1350000,  stock: 4,  stockMinimo: 2, categoriaId: catId('Carretillas Hidráulicas') },
    { codigo: 'SH-CH05', nombre: 'Transpaleta Eléctrica 2000 kg',             descripcion: 'Transpaleta eléctrica reforzada. Capacidad 2000 kg, batería 24V/120Ah, velocidad 6 km/h.',                 precio: 2600000,  precioCosto: 1850000,  stock: 3,  stockMinimo: 1, categoriaId: catId('Carretillas Hidráulicas') },
    { codigo: 'SH-PL01', nombre: 'Plataforma Personal Mástil Vertical 3m',   descripcion: 'Plataforma elevadora personal de mástil vertical. Altura 3 m, capacidad 120 kg.',                          precio: 4800000,  precioCosto: 3400000,  stock: 2,  stockMinimo: 1, categoriaId: catId('Plataformas de Altura') },
    { codigo: 'SH-PL02', nombre: 'Plataforma Tijera Eléctrica 6m',            descripcion: 'Plataforma tijera eléctrica para interiores. Altura 6 m, capacidad 230 kg, ancho 760 mm.',                precio: 8500000,  precioCosto: 6100000,  stock: 2,  stockMinimo: 1, categoriaId: catId('Plataformas de Altura') },
    { codigo: 'SH-PL03', nombre: 'Plataforma Tijera Eléctrica 8m',            descripcion: 'Plataforma tijera eléctrica. Altura 8 m, capacidad 230 kg, tracción 4 ruedas.',                           precio: 11200000, precioCosto: 8000000,  stock: 1,  stockMinimo: 1, categoriaId: catId('Plataformas de Altura') },
    { codigo: 'SH-PL04', nombre: 'Plataforma Articulada Eléctrica 10m',       descripcion: 'Plataforma articulada eléctrica. Altura 10 m, alcance horizontal 3.6 m, capacidad 200 kg.',              precio: 18000000, precioCosto: 13000000, stock: 1,  stockMinimo: 1, categoriaId: catId('Plataformas de Altura') },
    { codigo: 'SH-PL05', nombre: 'Plataforma Articulada Eléctrica 16m',       descripcion: 'Plataforma articulada industrial. Altura 16 m, alcance horizontal 7.6 m.',                                precio: 28000000, precioCosto: 20000000, stock: 0,  stockMinimo: 1, categoriaId: catId('Plataformas de Altura') },
    { codigo: 'SH-TR01', nombre: 'Tractor Kubota B2741 27 HP 4WD',            descripcion: 'Tractor compacto Kubota. Motor D1105 3 cil. 27 HP, transmisión HST, doble tracción.',                     precio: 18500000, precioCosto: 13500000, stock: 2,  stockMinimo: 1, categoriaId: catId('Tractores') },
    { codigo: 'SH-TR02', nombre: 'Tractor Kubota L3301 33 HP 4WD',            descripcion: 'Tractor utilitario Kubota. Motor D1803 33 HP, caja sincronizada, 3 velocidades TDF.',                    precio: 24800000, precioCosto: 18000000, stock: 2,  stockMinimo: 1, categoriaId: catId('Tractores') },
    { codigo: 'SH-TR03', nombre: 'Tractor Kubota L4701 47 HP 4WD',            descripcion: 'Tractor utilitario Kubota. Motor V2403 47 HP, doble tracción, enganche 3 puntos Cat I/II, TDF 540/1000.',precio: 32500000, precioCosto: 23500000, stock: 1,  stockMinimo: 1, categoriaId: catId('Tractores') },
    { codigo: 'SH-TR04', nombre: 'Tractor Kubota M7060 70 HP 4WD',            descripcion: 'Tractor Kubota serie M. Motor V3800 70 HP, cabina ROPS, transmisión powershuttle, TDF 540/1000.',        precio: 55000000, precioCosto: 40000000, stock: 1,  stockMinimo: 1, categoriaId: catId('Tractores') },
    { codigo: 'SH-TR05', nombre: 'Tractor Kubota M9960 99 HP 4WD',            descripcion: 'Tractor Kubota alta potencia. Motor V3800-DI 99 HP, cabina climatizada, powershuttle.',                  precio: 78000000, precioCosto: 57000000, stock: 0,  stockMinimo: 1, categoriaId: catId('Tractores') },
    { codigo: 'SH-IM01', nombre: 'Cortadora de Césped Lateral 1.5m',          descripcion: 'Cortadora lateral para tractor. Ancho 1500 mm, eje cardán, cuchillas flotantes.',                         precio: 1800000,  precioCosto: 1250000,  stock: 3,  stockMinimo: 1, categoriaId: catId('Implementos Agrícolas') },
    { codigo: 'SH-IM02', nombre: 'Desmalezadora Eje Horizontal 1.5m',         descripcion: 'Desmalezadora frontal/trasera. Ancho 1500 mm, cuchillos en Y, enganche 3 puntos.',                        precio: 2200000,  precioCosto: 1550000,  stock: 3,  stockMinimo: 1, categoriaId: catId('Implementos Agrícolas') },
    { codigo: 'SH-IM03', nombre: 'Trituradora de Poda 1.2m',                  descripcion: 'Trituradora forestal. Ancho 1200 mm, ramas hasta 80 mm, cuchillas acero boro.',                           precio: 3100000,  precioCosto: 2200000,  stock: 2,  stockMinimo: 1, categoriaId: catId('Implementos Agrícolas') },
    { codigo: 'SH-IM04', nombre: 'Cincel de 5 Puntas',                         descripcion: 'Subsolador 5 púas. Profundidad 35 cm, ancho 1600 mm, enganche 3 puntos.',                                precio: 850000,   precioCosto: 580000,   stock: 5,  stockMinimo: 2, categoriaId: catId('Implementos Agrícolas') },
    { codigo: 'SH-IM05', nombre: 'Cincel de 7 Puntas',                         descripcion: 'Subsolador 7 púas. Profundidad 35 cm, ancho 2200 mm, enganche 3 puntos reforzado.',                      precio: 1100000,  precioCosto: 760000,   stock: 4,  stockMinimo: 2, categoriaId: catId('Implementos Agrícolas') },
    { codigo: 'SH-IM06', nombre: 'Rotovator 1.40m',                            descripcion: 'Rotovator eje horizontal. Ancho 1400 mm, 48 cuchillas en C, TDF 540 rpm.',                               precio: 1650000,  precioCosto: 1150000,  stock: 4,  stockMinimo: 2, categoriaId: catId('Implementos Agrícolas') },
    { codigo: 'SH-IM07', nombre: 'Rotovator 1.80m',                            descripcion: 'Rotovator eje horizontal. Ancho 1800 mm, 60 cuchillas en C, TDF 540 rpm.',                               precio: 2100000,  precioCosto: 1480000,  stock: 3,  stockMinimo: 1, categoriaId: catId('Implementos Agrícolas') },
    { codigo: 'SH-IM08', nombre: 'Hoja Niveladora Frontal 2.0m',               descripcion: 'Pala niveladora delantera. Ancho 2000 mm, ángulo ajustable, compatible 30-80 HP.',                      precio: 1950000,  precioCosto: 1380000,  stock: 3,  stockMinimo: 1, categoriaId: catId('Implementos Agrícolas') },
    { codigo: 'SH-IM09', nombre: 'Pala Frontal para Tractor',                  descripcion: 'Cargador frontal. Capacidad 500 kg, elevación 2.5 m, cucharón 0.45 m³.',                                 precio: 2800000,  precioCosto: 1980000,  stock: 2,  stockMinimo: 1, categoriaId: catId('Implementos Agrícolas') },
    { codigo: 'SH-IM10', nombre: 'Retroexcavadora para Tractor',               descripcion: 'Retroexcavadora trasera. Profundidad 3.5 m, giro 180°, compatible tractores 40-80 HP.',                  precio: 4500000,  precioCosto: 3200000,  stock: 1,  stockMinimo: 1, categoriaId: catId('Implementos Agrícolas') },
    { codigo: 'SH-IM11', nombre: 'Tractoelevador para Tractor',                descripcion: 'Tractoelevador trasero. Capacidad 1000 kg, mástil 3.5 m, compatible tractores 30-60 HP.',                precio: 3200000,  precioCosto: 2250000,  stock: 2,  stockMinimo: 1, categoriaId: catId('Implementos Agrícolas') },
    { codigo: 'SH-GE01', nombre: 'Grupo Electrógeno 6.5 kVA Monofásico',      descripcion: 'Generador a nafta. Potencia 6.5 kVA / 5.5 kW, monofásico 220V, motor 13 HP, AVR.',                      precio: 1450000,  precioCosto: 1000000,  stock: 5,  stockMinimo: 2, categoriaId: catId('Grupos Electrógenos') },
    { codigo: 'SH-GE02', nombre: 'Grupo Electrógeno 10 kVA Trifásico',        descripcion: 'Generador diésel. Potencia 10 kVA / 8 kW, trifásico 220/380V, motor Yanmar L100, AVR.',                  precio: 2200000,  precioCosto: 1550000,  stock: 4,  stockMinimo: 2, categoriaId: catId('Grupos Electrógenos') },
    { codigo: 'SH-GE03', nombre: 'Grupo Electrógeno 15 kVA Trifásico',        descripcion: 'Generador diésel. Potencia 15 kVA / 12 kW, motor Perkins o Lombardini, insonorizado.',                    precio: 3100000,  precioCosto: 2200000,  stock: 3,  stockMinimo: 1, categoriaId: catId('Grupos Electrógenos') },
    { codigo: 'SH-GE04', nombre: 'Grupo Electrógeno 30 kVA Trifásico',        descripcion: 'Generador diésel industrial. Potencia 30 kVA / 24 kW, motor Perkins, tablero ATS.',                      precio: 6500000,  precioCosto: 4700000,  stock: 2,  stockMinimo: 1, categoriaId: catId('Grupos Electrógenos') },
    { codigo: 'SH-GE05', nombre: 'Grupo Electrógeno 60 kVA Trifásico',        descripcion: 'Generador diésel industrial. Potencia 60 kVA / 48 kW, motor Perkins o Cummins, insonorizado.',            precio: 11800000, precioCosto: 8500000,  stock: 1,  stockMinimo: 1, categoriaId: catId('Grupos Electrógenos') },
    { codigo: 'SH-GE06', nombre: 'Grupo Electrógeno 100 kVA Trifásico',       descripcion: 'Generador diésel. Potencia 100 kVA / 80 kW, motor Cummins 6BT, tablero digital, ATS.',                   precio: 18500000, precioCosto: 13500000, stock: 0,  stockMinimo: 1, categoriaId: catId('Grupos Electrógenos') },
    { codigo: 'SH-TL01', nombre: 'Torre de Iluminación 4×250W Halógeno',      descripcion: 'Torre remolcable. 4 focos halógenos 250W, mástil telescópico 6 m, generador Honda.',                      precio: 2800000,  precioCosto: 1980000,  stock: 3,  stockMinimo: 1, categoriaId: catId('Torres de Iluminación') },
    { codigo: 'SH-TL02', nombre: 'Torre de Iluminación 4×1000W LED',          descripcion: 'Torre iluminación LED. 4 focos LED 1000W, mástil 9 m, generador diésel incluido.',                        precio: 4200000,  precioCosto: 3000000,  stock: 2,  stockMinimo: 1, categoriaId: catId('Torres de Iluminación') },
    { codigo: 'SH-TL03', nombre: 'Torre de Iluminación 6 Focos Remolcable',   descripcion: 'Torre para obras. 6 focos 400W metal halide, mástil 8 m, generador 5 kVA, remolque.',                    precio: 6500000,  precioCosto: 4700000,  stock: 1,  stockMinimo: 1, categoriaId: catId('Torres de Iluminación') },
    { codigo: 'SH-CA01', nombre: 'Compresor de Pistón 50L 2 HP',              descripcion: 'Compresor pistón monofásico. Tanque 50 L, 2 HP, presión máx. 8 bar, 220V.',                               precio: 380000,   precioCosto: 260000,   stock: 10, stockMinimo: 3, categoriaId: catId('Compresores de Aire') },
    { codigo: 'SH-CA02', nombre: 'Compresor de Pistón 100L 3 HP',             descripcion: 'Compresor pistón monofásico. Tanque 100 L, 3 HP, presión máx. 10 bar, 220V.',                             precio: 580000,   precioCosto: 400000,   stock: 8,  stockMinimo: 3, categoriaId: catId('Compresores de Aire') },
    { codigo: 'SH-CA03', nombre: 'Compresor de Pistón 200L 5.5 HP',           descripcion: 'Compresor pistón trifásico. Tanque 200 L, 5.5 HP, presión máx. 12 bar, 380V.',                            precio: 980000,   precioCosto: 700000,   stock: 5,  stockMinimo: 2, categoriaId: catId('Compresores de Aire') },
    { codigo: 'SH-CA04', nombre: 'Compresor de Tornillo 7.5 kW 500 L/min',    descripcion: 'Compresor tornillo industrial. Potencia 7.5 kW, caudal 500 L/min, presión 8 bar, 380V.',                  precio: 3800000,  precioCosto: 2700000,  stock: 3,  stockMinimo: 1, categoriaId: catId('Compresores de Aire') },
    { codigo: 'SH-CA05', nombre: 'Compresor de Tornillo 15 kW 1000 L/min',    descripcion: 'Compresor tornillo industrial. Potencia 15 kW, caudal 1000 L/min, variador de frecuencia.',               precio: 6200000,  precioCosto: 4500000,  stock: 2,  stockMinimo: 1, categoriaId: catId('Compresores de Aire') },
    { codigo: 'SH-CA06', nombre: 'Compresor de Tornillo 22 kW 1500 L/min',    descripcion: 'Compresor tornillo alta capacidad. 22 kW, caudal 1500 L/min, variador de frecuencia, secador.',           precio: 9500000,  precioCosto: 6800000,  stock: 1,  stockMinimo: 1, categoriaId: catId('Compresores de Aire') },
    { codigo: 'SH-SA01', nombre: 'Secador Refrigerativo 15 m³/h',             descripcion: 'Secador refrigerativo. Caudal 15 m³/h, punto de rocío +3°C, filtro de partículas.',                      precio: 480000,   precioCosto: 330000,   stock: 8,  stockMinimo: 3, categoriaId: catId('Secadores de Aire') },
    { codigo: 'SH-SA02', nombre: 'Secador Refrigerativo 30 m³/h',             descripcion: 'Secador refrigerativo. Caudal 30 m³/h, punto de rocío +3°C, apto compresores hasta 7.5 kW.',             precio: 720000,   precioCosto: 500000,   stock: 6,  stockMinimo: 2, categoriaId: catId('Secadores de Aire') },
    { codigo: 'SH-SA03', nombre: 'Secador Refrigerativo 60 m³/h',             descripcion: 'Secador refrigerativo industrial. Caudal 60 m³/h, apto compresor 15 kW, display digital.',               precio: 1150000,  precioCosto: 810000,   stock: 4,  stockMinimo: 2, categoriaId: catId('Secadores de Aire') },
    { codigo: 'SH-SA04', nombre: 'Secador Refrigerativo 100 m³/h',            descripcion: 'Secador alta capacidad. Caudal 100 m³/h, punto de rocío +3°C, display y alarmas.',                       precio: 1850000,  precioCosto: 1300000,  stock: 2,  stockMinimo: 1, categoriaId: catId('Secadores de Aire') },
    { codigo: 'SH-RP01', nombre: 'Kit Filtros Motor Autoelevador Hyster',      descripcion: 'Kit filtros para motor GLP/nafta Hyster. Filtro aire, aceite y combustible.',                              precio: 48000,    precioCosto: 32000,    stock: 20, stockMinimo: 5, categoriaId: catId('Repuestos y Accesorios') },
    { codigo: 'SH-RP02', nombre: 'Batería 48V 280Ah Tracción',                 descripcion: 'Batería de tracción para apiladores y autoelevadores eléctricos. 48V / 280Ah.',                           precio: 285000,   precioCosto: 195000,   stock: 4,  stockMinimo: 2, categoriaId: catId('Repuestos y Accesorios') },
    { codigo: 'SH-RP03', nombre: 'Ruedas Macizas 200×50 (par)',                descripcion: 'Par de ruedas macizas para transpaletas y apiladores. Medida 200×50 mm, poliuretano.',                   precio: 38000,    precioCosto: 25000,    stock: 18, stockMinimo: 5, categoriaId: catId('Repuestos y Accesorios') },
    { codigo: 'SH-RP04', nombre: 'Horquillas 1000mm Par Clase II',             descripcion: 'Par horquillas clase II. Longitud 1000 mm, sección 125×40 mm, acero tratado.',                            precio: 95000,    precioCosto: 65000,    stock: 8,  stockMinimo: 3, categoriaId: catId('Repuestos y Accesorios') },
    { codigo: 'SH-RP05', nombre: 'Bomba Hidráulica Transpaleta',               descripcion: 'Bomba hidráulica de repuesto para transpaletas manuales y eléctricas. Universal.',                        precio: 42000,    precioCosto: 28000,    stock: 10, stockMinimo: 3, categoriaId: catId('Repuestos y Accesorios') },
    { codigo: 'SH-RP06', nombre: 'Kit Carbones Motor Tracción',                descripcion: 'Carbones para motor de tracción apiladores eléctricos. Compatible Hyster y otras marcas.',                precio: 28000,    precioCosto: 18000,    stock: 12, stockMinimo: 4, categoriaId: catId('Repuestos y Accesorios') },
    { codigo: 'SH-RP07', nombre: 'Filtro Aire Motor GLP Hyster',               descripcion: 'Filtro de aire original para motores GLP de autoelevadores Hyster H-FT series.',                         precio: 8500,     precioCosto: 5500,     stock: 30, stockMinimo: 8, categoriaId: catId('Repuestos y Accesorios') },
    { codigo: 'SH-RP08', nombre: 'Correa Transmisión Kubota L/M Series',       descripcion: 'Correa de transmisión Kubota. Compatible series L3301, L4701, M6060, M7060.',                            precio: 15000,    precioCosto: 10000,    stock: 15, stockMinimo: 5, categoriaId: catId('Repuestos y Accesorios') },
    { codigo: 'SH-RP09', nombre: 'Aceite Hidráulico ISO 46 Bidón 20L',         descripcion: 'Aceite hidráulico ISO VG 46. Apto para transpaletas, apiladores y sistemas hidráulicos. 20L.',           precio: 35000,    precioCosto: 23000,    stock: 25, stockMinimo: 6, categoriaId: catId('Repuestos y Accesorios') },
    { codigo: 'SH-RP10', nombre: 'Sensor Nivel Combustible Autoelevador',      descripcion: 'Sensor de nivel combustible/electrolito para autoelevadores GLP y eléctricos. Universal.',               precio: 18500,    precioCosto: 12000,    stock: 8,  stockMinimo: 3, categoriaId: catId('Repuestos y Accesorios') },
    { codigo: 'SH-RP11', nombre: 'Pastillas de Freno Transpaleta Eléctrica',  descripcion: 'Juego pastillas freno electromagnético para transpaletas eléctricas. Par completo.',                      precio: 22000,    precioCosto: 15000,    stock: 10, stockMinimo: 4, categoriaId: catId('Repuestos y Accesorios') },
    { codigo: 'SH-RP12', nombre: 'Fusible Principal 300A Panel Eléctrico',     descripcion: 'Fusible de protección principal 300A para paneles de autoelevadores y apiladores eléctricos.',            precio: 4800,     precioCosto: 3000,     stock: 0,  stockMinimo: 5, categoriaId: catId('Repuestos y Accesorios') },
  ];

  await prisma.producto.createMany({ data: productos.map(p => ({ ...p, activo: true })), skipDuplicates: true });
  console.log(`Seed SH Servicios: ${catNames.length} categorías, ${productos.length} productos insertados.`);
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(distPath));
  app.use((_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

setIO(io);

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
});

const PORT = process.env.PORT || 3000;

Promise.all([seedIfEmpty(), seedSHProductos()]).then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}).catch(console.error);
