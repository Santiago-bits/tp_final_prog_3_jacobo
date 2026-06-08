import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config({ path: 'prisma/.env' });
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Sembrando datos de SH Servicios...');

  // ── Categorías ───────────────────────────────────────────────
  const catNames = [
    'Apiladores',
    'Autoelevadores',
    'Carretillas Hidráulicas',
    'Plataformas de Altura',
    'Tractores',
    'Implementos Agrícolas',
    'Grupos Electrógenos',
    'Torres de Iluminación',
    'Compresores de Aire',
    'Secadores de Aire',
    'Repuestos y Accesorios',
  ];

  for (const nombre of catNames) {
    await prisma.categoria.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  const cats = await prisma.categoria.findMany({ orderBy: { id: 'asc' } });
  const cat = (nombre: string) => cats.find(c => c.nombre === nombre)!.id;

  // ── Productos ────────────────────────────────────────────────
  const productos = [
    // ── Apiladores ───────────────────────────────────────
    { codigo: 'SH-AP01', nombre: 'Apilador Manual 1000 kg',                    descripcion: 'Apilador manual de horquillas con elevación hidráulica. Capacidad 1000 kg, altura máxima 1600 mm.',           precio: 450000,   precioCosto: 310000,  stock: 8,  stockMinimo: 2, categoriaId: cat('Apiladores') },
    { codigo: 'SH-AP02', nombre: 'Apilador Manual 1500 kg',                    descripcion: 'Apilador manual de horquillas. Capacidad 1500 kg, altura máxima 1600 mm.',                                       precio: 580000,   precioCosto: 400000,  stock: 6,  stockMinimo: 2, categoriaId: cat('Apiladores') },
    { codigo: 'SH-AP03', nombre: 'Apilador Eléctrico Hyster E1.0S 1000 kg',   descripcion: 'Apilador eléctrico Hyster serie E. Capacidad 1000 kg, mástil triplex 3300 mm, batería 24V/210Ah.',               precio: 3800000,  precioCosto: 2700000, stock: 3,  stockMinimo: 1, categoriaId: cat('Apiladores') },
    { codigo: 'SH-AP04', nombre: 'Apilador Eléctrico Hyster E1.5S 1500 kg',   descripcion: 'Apilador eléctrico Hyster serie E. Capacidad 1500 kg, mástil triplex 4000 mm, batería 24V/280Ah.',               precio: 5200000,  precioCosto: 3700000, stock: 2,  stockMinimo: 1, categoriaId: cat('Apiladores') },
    { codigo: 'SH-AP05', nombre: 'Apilador Eléctrico Hyster E2.0S 2000 kg',   descripcion: 'Apilador eléctrico Hyster serie E. Capacidad 2000 kg, mástil triplex 4500 mm, batería 48V/280Ah.',               precio: 7100000,  precioCosto: 5100000, stock: 1,  stockMinimo: 1, categoriaId: cat('Apiladores') },
    { codigo: 'SH-AP06', nombre: 'Apilador de Mástil Retráctil 1200 kg',      descripcion: 'Apilador retráctil eléctrico. Capacidad 1200 kg, apto para pasillos angostos, alcance 5500 mm.',                 precio: 9500000,  precioCosto: 6800000, stock: 1,  stockMinimo: 1, categoriaId: cat('Apiladores') },

    // ── Autoelevadores ───────────────────────────────────
    { codigo: 'SH-AE01', nombre: 'Autoelevador Hyster H2.0FT 2 Ton GLP',      descripcion: 'Autoelevador a GLP Hyster. Capacidad 2000 kg, mástil triplex 4800 mm, motor GLP Mazda.',                        precio: 12500000, precioCosto: 9000000, stock: 2,  stockMinimo: 1, categoriaId: cat('Autoelevadores') },
    { codigo: 'SH-AE02', nombre: 'Autoelevador Hyster H2.5FT 2.5 Ton GLP',    descripcion: 'Autoelevador a GLP Hyster. Capacidad 2500 kg, mástil triplex 4800 mm, motor GLP Mazda.',                        precio: 15800000, precioCosto: 11400000, stock: 2, stockMinimo: 1, categoriaId: cat('Autoelevadores') },
    { codigo: 'SH-AE03', nombre: 'Autoelevador Hyster H3.0FT 3 Ton GLP',      descripcion: 'Autoelevador a GLP Hyster. Capacidad 3000 kg, mástil triplex 5000 mm, motor GLP Mazda.',                        precio: 19200000, precioCosto: 14000000, stock: 1, stockMinimo: 1, categoriaId: cat('Autoelevadores') },
    { codigo: 'SH-AE04', nombre: 'Autoelevador Hagncha H20 2 Ton GLP',        descripcion: 'Autoelevador a GLP Hagncha. Capacidad 2000 kg, mástil duplex 3300 mm, económico y robusto.',                    precio: 9800000,  precioCosto: 7000000, stock: 3,  stockMinimo: 1, categoriaId: cat('Autoelevadores') },
    { codigo: 'SH-AE05', nombre: 'Autoelevador Hagncha H30 3 Ton GLP',        descripcion: 'Autoelevador a GLP Hagncha. Capacidad 3000 kg, mástil triplex 4500 mm.',                                         precio: 13600000, precioCosto: 9800000, stock: 2,  stockMinimo: 1, categoriaId: cat('Autoelevadores') },
    { codigo: 'SH-AE06', nombre: 'Autoelevador Eléctrico Hyster E2.0XN',      descripcion: 'Autoelevador eléctrico Hyster. Capacidad 2000 kg, batería 48V/500Ah, mástil triplex 4800 mm.',                   precio: 22000000, precioCosto: 16000000, stock: 1, stockMinimo: 1, categoriaId: cat('Autoelevadores') },
    { codigo: 'SH-AE07', nombre: 'Autoelevador Diésel Hagncha FD30 3 Ton',    descripcion: 'Autoelevador diésel Hagncha. Capacidad 3000 kg, motor diésel Isuzu C240, mástil triplex.',                      precio: 18500000, precioCosto: 13500000, stock: 1, stockMinimo: 1, categoriaId: cat('Autoelevadores') },

    // ── Carretillas Hidráulicas ───────────────────────────
    { codigo: 'SH-CH01', nombre: 'Transpaleta Manual 2000 kg',                 descripcion: 'Transpaleta manual con timón ergonómico. Capacidad 2000 kg, horquillas 1150x160 mm.',                           precio: 280000,   precioCosto: 190000,  stock: 15, stockMinimo: 3, categoriaId: cat('Carretillas Hidráulicas') },
    { codigo: 'SH-CH02', nombre: 'Transpaleta Manual 3000 kg',                 descripcion: 'Transpaleta manual reforzada. Capacidad 3000 kg, horquillas 1150x160 mm.',                                       precio: 350000,   precioCosto: 240000,  stock: 12, stockMinimo: 3, categoriaId: cat('Carretillas Hidráulicas') },
    { codigo: 'SH-CH03', nombre: 'Transpaleta Manual 5000 kg',                 descripcion: 'Transpaleta manual de alta capacidad. Capacidad 5000 kg, horquillas pesadas reforzadas.',                        precio: 480000,   precioCosto: 330000,  stock: 6,  stockMinimo: 2, categoriaId: cat('Carretillas Hidráulicas') },
    { codigo: 'SH-CH04', nombre: 'Transpaleta Eléctrica 1500 kg',              descripcion: 'Transpaleta eléctrica con batería 24V/80Ah. Capacidad 1500 kg, velocidad 6 km/h.',                               precio: 1900000,  precioCosto: 1350000, stock: 4,  stockMinimo: 2, categoriaId: cat('Carretillas Hidráulicas') },
    { codigo: 'SH-CH05', nombre: 'Transpaleta Eléctrica 2000 kg',              descripcion: 'Transpaleta eléctrica reforzada. Capacidad 2000 kg, batería 24V/120Ah, velocidad 6 km/h.',                       precio: 2600000,  precioCosto: 1850000, stock: 3,  stockMinimo: 1, categoriaId: cat('Carretillas Hidráulicas') },

    // ── Plataformas de Altura ─────────────────────────────
    { codigo: 'SH-PL01', nombre: 'Plataforma Personal Mástil Vertical 3m',    descripcion: 'Plataforma elevadora personal de mástil vertical. Altura de trabajo 3 m, capacidad 120 kg.',                    precio: 4800000,  precioCosto: 3400000, stock: 2,  stockMinimo: 1, categoriaId: cat('Plataformas de Altura') },
    { codigo: 'SH-PL02', nombre: 'Plataforma Tijera Eléctrica 6m',             descripcion: 'Plataforma tijera eléctrica para interiores. Altura de trabajo 6 m, capacidad 230 kg, ancho 760 mm.',           precio: 8500000,  precioCosto: 6100000, stock: 2,  stockMinimo: 1, categoriaId: cat('Plataformas de Altura') },
    { codigo: 'SH-PL03', nombre: 'Plataforma Tijera Eléctrica 8m',             descripcion: 'Plataforma tijera eléctrica. Altura de trabajo 8 m, capacidad 230 kg, tracción 4 ruedas.',                      precio: 11200000, precioCosto: 8000000, stock: 1,  stockMinimo: 1, categoriaId: cat('Plataformas de Altura') },
    { codigo: 'SH-PL04', nombre: 'Plataforma Articulada Eléctrica 10m',        descripcion: 'Plataforma articulada eléctrica. Altura de trabajo 10 m, alcance horizontal 3.6 m, capacidad 200 kg.',          precio: 18000000, precioCosto: 13000000, stock: 1, stockMinimo: 1, categoriaId: cat('Plataformas de Altura') },
    { codigo: 'SH-PL05', nombre: 'Plataforma Articulada Eléctrica 16m',        descripcion: 'Plataforma articulada eléctrica industrial. Altura de trabajo 16 m, alcance horizontal 7.6 m.',                 precio: 28000000, precioCosto: 20000000, stock: 0, stockMinimo: 1, categoriaId: cat('Plataformas de Altura') },

    // ── Tractores ─────────────────────────────────────────
    { codigo: 'SH-TR01', nombre: 'Tractor Kubota B2741 27 HP 4WD',             descripcion: 'Tractor compacto Kubota. Motor Kubota D1105 3 cil. 27 HP, transmisión HST, doble tracción.',                   precio: 18500000, precioCosto: 13500000, stock: 2,  stockMinimo: 1, categoriaId: cat('Tractores') },
    { codigo: 'SH-TR02', nombre: 'Tractor Kubota L3301 33 HP 4WD',             descripcion: 'Tractor utilitario Kubota. Motor D1803 33 HP, caja de cambios sincronizada, 3 velocidades TDF.',               precio: 24800000, precioCosto: 18000000, stock: 2,  stockMinimo: 1, categoriaId: cat('Tractores') },
    { codigo: 'SH-TR03', nombre: 'Tractor Kubota L4701 47 HP 4WD',             descripcion: 'Tractor utilitario Kubota. Motor V2403 47 HP, doble tracción, enganche 3 puntos Cat I/II, 540/1000 TDF.',      precio: 32500000, precioCosto: 23500000, stock: 1,  stockMinimo: 1, categoriaId: cat('Tractores') },
    { codigo: 'SH-TR04', nombre: 'Tractor Kubota M7060 70 HP 4WD',             descripcion: 'Tractor Kubota serie M. Motor V3800 70 HP, cabina ROPS, transmisión powershuttle, 540/1000 TDF.',              precio: 55000000, precioCosto: 40000000, stock: 1,  stockMinimo: 1, categoriaId: cat('Tractores') },
    { codigo: 'SH-TR05', nombre: 'Tractor Kubota M9960 99 HP 4WD',             descripcion: 'Tractor Kubota serie M alta potencia. Motor V3800-DI 99 HP, cabina, climatizador, powershuttle.',              precio: 78000000, precioCosto: 57000000, stock: 0,  stockMinimo: 1, categoriaId: cat('Tractores') },

    // ── Implementos Agrícolas ─────────────────────────────
    { codigo: 'SH-IM01', nombre: 'Cortadora de Césped Lateral 1.5m',           descripcion: 'Cortadora lateral para tractor. Ancho de corte 1500 mm, eje cardán, cuchillas flotantes.',                      precio: 1800000,  precioCosto: 1250000, stock: 3,  stockMinimo: 1, categoriaId: cat('Implementos Agrícolas') },
    { codigo: 'SH-IM02', nombre: 'Desmalezadora Eje Horizontal 1.5m',          descripcion: 'Desmalezadora frontal/trasera. Ancho de trabajo 1500 mm, cuchillos en Y, enganche 3 puntos.',                   precio: 2200000,  precioCosto: 1550000, stock: 3,  stockMinimo: 1, categoriaId: cat('Implementos Agrícolas') },
    { codigo: 'SH-IM03', nombre: 'Trituradora de Poda 1.2m',                   descripcion: 'Trituradora forestal de ramas. Ancho 1200 mm, capacidad ramas hasta 80 mm, cuchillas de acero boro.',           precio: 3100000,  precioCosto: 2200000, stock: 2,  stockMinimo: 1, categoriaId: cat('Implementos Agrícolas') },
    { codigo: 'SH-IM04', nombre: 'Cincel de 5 Puntas',                          descripcion: 'Subsolador de 5 púas para labranza profunda. Profundidad 35 cm, ancho de labor 1600 mm, enganche 3 puntos.',   precio: 850000,   precioCosto: 580000,  stock: 5,  stockMinimo: 2, categoriaId: cat('Implementos Agrícolas') },
    { codigo: 'SH-IM05', nombre: 'Cincel de 7 Puntas',                          descripcion: 'Subsolador de 7 púas. Profundidad 35 cm, ancho de labor 2200 mm, enganche 3 puntos reforzado.',                precio: 1100000,  precioCosto: 760000,  stock: 4,  stockMinimo: 2, categoriaId: cat('Implementos Agrícolas') },
    { codigo: 'SH-IM06', nombre: 'Rotovator 1.40m',                             descripcion: 'Rotovator de eje horizontal. Ancho de labor 1400 mm, 48 cuchillas en C, enganche 3 puntos, TDF 540 rpm.',      precio: 1650000,  precioCosto: 1150000, stock: 4,  stockMinimo: 2, categoriaId: cat('Implementos Agrícolas') },
    { codigo: 'SH-IM07', nombre: 'Rotovator 1.80m',                             descripcion: 'Rotovator de eje horizontal. Ancho de labor 1800 mm, 60 cuchillas en C, enganche 3 puntos, TDF 540 rpm.',      precio: 2100000,  precioCosto: 1480000, stock: 3,  stockMinimo: 1, categoriaId: cat('Implementos Agrícolas') },
    { codigo: 'SH-IM08', nombre: 'Hoja Niveladora Frontal 2.0m',                descripcion: 'Pala niveladora delantera. Ancho 2000 mm, ángulo de ataque ajustable, compatible con tractores 30-80 HP.',     precio: 1950000,  precioCosto: 1380000, stock: 3,  stockMinimo: 1, categoriaId: cat('Implementos Agrícolas') },
    { codigo: 'SH-IM09', nombre: 'Pala Frontal para Tractor',                   descripcion: 'Cargador frontal para tractor. Capacidad 500 kg, elevación 2.5 m, cucharón de 0.45 m³.',                       precio: 2800000,  precioCosto: 1980000, stock: 2,  stockMinimo: 1, categoriaId: cat('Implementos Agrícolas') },
    { codigo: 'SH-IM10', nombre: 'Retroexcavadora para Tractor',                descripcion: 'Retroexcavadora trasera. Profundidad de excavación 3.5 m, giro 180°, compatible tractores 40-80 HP.',          precio: 4500000,  precioCosto: 3200000, stock: 1,  stockMinimo: 1, categoriaId: cat('Implementos Agrícolas') },
    { codigo: 'SH-IM11', nombre: 'Tractoelevador para Tractor',                 descripcion: 'Tractoelevador trasero. Capacidad 1000 kg, mástil 3.5 m, compatible tractores 30-60 HP.',                       precio: 3200000,  precioCosto: 2250000, stock: 2,  stockMinimo: 1, categoriaId: cat('Implementos Agrícolas') },

    // ── Grupos Electrógenos ───────────────────────────────
    { codigo: 'SH-GE01', nombre: 'Grupo Electrógeno 6.5 kVA Monofásico',       descripcion: 'Generador a naftero. Potencia 6.5 kVA / 5.5 kW, monofásico 220V, motor 4 tiempos 13 HP, AVR.',               precio: 1450000,  precioCosto: 1000000, stock: 5,  stockMinimo: 2, categoriaId: cat('Grupos Electrógenos') },
    { codigo: 'SH-GE02', nombre: 'Grupo Electrógeno 10 kVA Trifásico',         descripcion: 'Generador diésel. Potencia 10 kVA / 8 kW, trifásico 220/380V, motor Yanmar L100, AVR automático.',             precio: 2200000,  precioCosto: 1550000, stock: 4,  stockMinimo: 2, categoriaId: cat('Grupos Electrógenos') },
    { codigo: 'SH-GE03', nombre: 'Grupo Electrógeno 15 kVA Trifásico',         descripcion: 'Generador diésel. Potencia 15 kVA / 12 kW, trifásico, motor Perkins o Lombardini, insonorizado.',               precio: 3100000,  precioCosto: 2200000, stock: 3,  stockMinimo: 1, categoriaId: cat('Grupos Electrógenos') },
    { codigo: 'SH-GE04', nombre: 'Grupo Electrógeno 30 kVA Trifásico',         descripcion: 'Generador diésel industrial. Potencia 30 kVA / 24 kW, trifásico, motor Perkins, tablero ATS.',                 precio: 6500000,  precioCosto: 4700000, stock: 2,  stockMinimo: 1, categoriaId: cat('Grupos Electrógenos') },
    { codigo: 'SH-GE05', nombre: 'Grupo Electrógeno 60 kVA Trifásico',         descripcion: 'Generador diésel industrial. Potencia 60 kVA / 48 kW, trifásico, motor Perkins o Cummins, insonorizado.',      precio: 11800000, precioCosto: 8500000, stock: 1,  stockMinimo: 1, categoriaId: cat('Grupos Electrógenos') },
    { codigo: 'SH-GE06', nombre: 'Grupo Electrógeno 100 kVA Trifásico',        descripcion: 'Generador diésel industrial. Potencia 100 kVA / 80 kW, motor Cummins 6BT, tablero digital, ATS.',              precio: 18500000, precioCosto: 13500000, stock: 0, stockMinimo: 1, categoriaId: cat('Grupos Electrógenos') },

    // ── Torres de Iluminación ─────────────────────────────
    { codigo: 'SH-TL01', nombre: 'Torre de Iluminación 4×250W Halógeno',       descripcion: 'Torre de iluminación remolcable. 4 focos halógenos 250W, mástil telescópico 6 m, generador Honda.',            precio: 2800000,  precioCosto: 1980000, stock: 3,  stockMinimo: 1, categoriaId: cat('Torres de Iluminación') },
    { codigo: 'SH-TL02', nombre: 'Torre de Iluminación 4×1000W LED',           descripcion: 'Torre de iluminación LED de alta eficiencia. 4 focos LED 1000W, mástil 9 m, generador diésel.',                precio: 4200000,  precioCosto: 3000000, stock: 2,  stockMinimo: 1, categoriaId: cat('Torres de Iluminación') },
    { codigo: 'SH-TL03', nombre: 'Torre de Iluminación 6 Focos Remolcable',    descripcion: 'Torre iluminación para obras. 6 focos 400W metal halide, mástil 8 m, generador 5 kVA, remolque.',              precio: 6500000,  precioCosto: 4700000, stock: 1,  stockMinimo: 1, categoriaId: cat('Torres de Iluminación') },

    // ── Compresores de Aire ───────────────────────────────
    { codigo: 'SH-CA01', nombre: 'Compresor de Pistón 50L 2 HP',               descripcion: 'Compresor de pistón monofásico. Tanque 50 L, potencia 2 HP, presión máx. 8 bar, 220V.',                       precio: 380000,   precioCosto: 260000,  stock: 10, stockMinimo: 3, categoriaId: cat('Compresores de Aire') },
    { codigo: 'SH-CA02', nombre: 'Compresor de Pistón 100L 3 HP',              descripcion: 'Compresor de pistón monofásico. Tanque 100 L, potencia 3 HP, presión máx. 10 bar, 220V.',                      precio: 580000,   precioCosto: 400000,  stock: 8,  stockMinimo: 3, categoriaId: cat('Compresores de Aire') },
    { codigo: 'SH-CA03', nombre: 'Compresor de Pistón 200L 5.5 HP',            descripcion: 'Compresor de pistón trifásico. Tanque 200 L, potencia 5.5 HP, presión máx. 12 bar, 380V.',                     precio: 980000,   precioCosto: 700000,  stock: 5,  stockMinimo: 2, categoriaId: cat('Compresores de Aire') },
    { codigo: 'SH-CA04', nombre: 'Compresor de Tornillo 7.5 kW 500 L/min',     descripcion: 'Compresor de tornillo industrial. Potencia 7.5 kW, caudal 500 L/min, presión 8 bar, trifásico 380V.',          precio: 3800000,  precioCosto: 2700000, stock: 3,  stockMinimo: 1, categoriaId: cat('Compresores de Aire') },
    { codigo: 'SH-CA05', nombre: 'Compresor de Tornillo 15 kW 1000 L/min',     descripcion: 'Compresor de tornillo industrial. Potencia 15 kW, caudal 1000 L/min, presión 8 bar, variador de frecuencia.',  precio: 6200000,  precioCosto: 4500000, stock: 2,  stockMinimo: 1, categoriaId: cat('Compresores de Aire') },
    { codigo: 'SH-CA06', nombre: 'Compresor de Tornillo 22 kW 1500 L/min',     descripcion: 'Compresor tornillo de alta capacidad. Potencia 22 kW, caudal 1500 L/min, variador de frecuencia, secador.',    precio: 9500000,  precioCosto: 6800000, stock: 1,  stockMinimo: 1, categoriaId: cat('Compresores de Aire') },

    // ── Secadores de Aire ─────────────────────────────────
    { codigo: 'SH-SA01', nombre: 'Secador Refrigerativo 15 m³/h',              descripcion: 'Secador de aire refrigerativo. Caudal 15 m³/h, punto de rocío +3°C, filtro de partículas incluido.',           precio: 480000,   precioCosto: 330000,  stock: 8,  stockMinimo: 3, categoriaId: cat('Secadores de Aire') },
    { codigo: 'SH-SA02', nombre: 'Secador Refrigerativo 30 m³/h',              descripcion: 'Secador de aire refrigerativo. Caudal 30 m³/h, punto de rocío +3°C, apto para tornillo hasta 7.5 kW.',         precio: 720000,   precioCosto: 500000,  stock: 6,  stockMinimo: 2, categoriaId: cat('Secadores de Aire') },
    { codigo: 'SH-SA03', nombre: 'Secador Refrigerativo 60 m³/h',              descripcion: 'Secador refrigerativo industrial. Caudal 60 m³/h, apto para compresor 15 kW, display digital.',                precio: 1150000,  precioCosto: 810000,  stock: 4,  stockMinimo: 2, categoriaId: cat('Secadores de Aire') },
    { codigo: 'SH-SA04', nombre: 'Secador Refrigerativo 100 m³/h',             descripcion: 'Secador refrigerativo de alta capacidad. Caudal 100 m³/h, punto de rocío +3°C, display y alarmas.',            precio: 1850000,  precioCosto: 1300000, stock: 2,  stockMinimo: 1, categoriaId: cat('Secadores de Aire') },

    // ── Repuestos y Accesorios ────────────────────────────
    { codigo: 'SH-RP01', nombre: 'Kit Filtros Motor Autoelevador Hyster',       descripcion: 'Kit de filtros para motor GLP/nafta Hyster. Incluye filtro aire, aceite y combustible. Todos los modelos.',    precio: 48000,    precioCosto: 32000,   stock: 20, stockMinimo: 5, categoriaId: cat('Repuestos y Accesorios') },
    { codigo: 'SH-RP02', nombre: 'Batería 48V 280Ah Tracción',                  descripcion: 'Batería de tracción para apiladores y autoelevadores eléctricos. 48V / 280Ah, electrolito libre.',            precio: 285000,   precioCosto: 195000,  stock: 4,  stockMinimo: 2, categoriaId: cat('Repuestos y Accesorios') },
    { codigo: 'SH-RP03', nombre: 'Ruedas Macizas 200×50 (par)',                 descripcion: 'Par de ruedas macizas para transpaletas y apiladores. Medida 200×50 mm, poliuretano duro.',                    precio: 38000,    precioCosto: 25000,   stock: 18, stockMinimo: 5, categoriaId: cat('Repuestos y Accesorios') },
    { codigo: 'SH-RP04', nombre: 'Horquillas 1000mm Par Clase II',              descripcion: 'Par de horquillas estándar clase II. Longitud 1000 mm, sección 125×40 mm, acero tratado.',                     precio: 95000,    precioCosto: 65000,   stock: 8,  stockMinimo: 3, categoriaId: cat('Repuestos y Accesorios') },
    { codigo: 'SH-RP05', nombre: 'Bomba Hidráulica Transpaleta',                descripcion: 'Bomba hidráulica de repuesto para transpaletas manuales y eléctricas. Universal.',                             precio: 42000,    precioCosto: 28000,   stock: 10, stockMinimo: 3, categoriaId: cat('Repuestos y Accesorios') },
    { codigo: 'SH-RP06', nombre: 'Kit Carbones Motor Tracción',                 descripcion: 'Juego de carbones para motor de tracción de apiladores eléctricos. Compatible Hyster y otras marcas.',         precio: 28000,    precioCosto: 18000,   stock: 12, stockMinimo: 4, categoriaId: cat('Repuestos y Accesorios') },
    { codigo: 'SH-RP07', nombre: 'Filtro Aire Motor GLP Hyster',                descripcion: 'Filtro de aire original para motores GLP de autoelevadores Hyster H-FT series.',                               precio: 8500,     precioCosto: 5500,    stock: 30, stockMinimo: 8, categoriaId: cat('Repuestos y Accesorios') },
    { codigo: 'SH-RP08', nombre: 'Correa Transmisión Kubota L/M Series',        descripcion: 'Correa de transmisión original Kubota. Compatible con series L3301, L4701, M6060, M7060.',                    precio: 15000,    precioCosto: 10000,   stock: 15, stockMinimo: 5, categoriaId: cat('Repuestos y Accesorios') },
    { codigo: 'SH-RP09', nombre: 'Aceite Hidráulico ISO 46 Bidon 20L',          descripcion: 'Aceite hidráulico ISO VG 46. Apto para transpaletas, apiladores y sistemas hidráulicos industriales. 20L.',   precio: 35000,    precioCosto: 23000,   stock: 25, stockMinimo: 6, categoriaId: cat('Repuestos y Accesorios') },
    { codigo: 'SH-RP10', nombre: 'Sensor Nivel Combustible Autoelevador',       descripcion: 'Sensor de nivel de combustible/electrolito para autoelevadores GLP y eléctricos. Universal.',                  precio: 18500,    precioCosto: 12000,   stock: 8,  stockMinimo: 3, categoriaId: cat('Repuestos y Accesorios') },
    { codigo: 'SH-RP11', nombre: 'Pastillas de Freno Transpaleta Eléctrica',   descripcion: 'Juego de pastillas de freno electromagnético para transpaletas eléctricas. Par completo.',                     precio: 22000,    precioCosto: 15000,   stock: 10, stockMinimo: 4, categoriaId: cat('Repuestos y Accesorios') },
    { codigo: 'SH-RP12', nombre: 'Fusible Principal 300A Panel Eléctrico',      descripcion: 'Fusible de protección principal 300A para paneles de autoelevadores y apiladores eléctricos.',                 precio: 4800,     precioCosto: 3000,    stock: 0,  stockMinimo: 5, categoriaId: cat('Repuestos y Accesorios') },
  ];

  let creados = 0;
  let omitidos = 0;

  for (const p of productos) {
    const exists = await prisma.producto.findUnique({ where: { codigo: p.codigo } });
    if (exists) { omitidos++; continue; }
    await prisma.producto.create({ data: { ...p, activo: true } });
    creados++;
  }

  console.log(`\n✓ Seed SH Servicios completo:`);
  console.log(`  Categorías  : ${catNames.length} (upsert)`);
  console.log(`  Productos   : ${creados} creados, ${omitidos} ya existían`);
  console.log(`  Total       : ${productos.length} productos en ${catNames.length} categorías`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
