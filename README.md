# Proyecto: Sistema ERP - SH Servicios (Módulo de Ventas)
Sistema de Gestión

Alumnos: Rodriguez Nazareno, Mover Leonardo, Jacobo Santiago.

GRUPO 4.

El presente proyecto consiste en el desarrollo de un sistema ERP especializado en la Gestión de Ventas e Inventario para la empresa SH Servicios. La organización, dedicada a la provisión de insumos y soluciones técnicas, necesita una herramienta digital que centralice sus operaciones comerciales. El sistema busca reemplazar los procesos manuales por una plataforma automatizada que garantice el control total sobre el flujo de mercadería y la transparencia financiera.

## 2. Objetivos del Proyecto

El objetivo principal es implementar una solución Full-Stack que resuelva la desincronización del inventario. El sistema permitirá:

- Digitalizar el catálogo de productos y el proceso de facturación.
- Automatizar la reducción de existencias ante cada venta realizada.
- Garantizar la integridad de los datos mediante una arquitectura robusta y segura.

## 3. Alcance Funcional

El sistema se centra en dos pilares críticos para el funcionamiento de SH Servicios:

**Gestión de Inventario (ABM):** Un módulo completo para el control de artículos. Permite el alta, baja, modificación y consulta de productos, categorías y niveles de stock mínimo.

**Venta Transaccional y Facturación:** Interfaz para procesar ventas que vincula múltiples productos, calcula totales de forma automática y genera el registro de la operación.

**Control de Stock en Tiempo Real:** Validación de disponibilidad antes de confirmar la venta y descuento automático de unidades en la base de datos al completar la transacción.

**Seguridad y Acceso:** Sistema de autenticación con JWT y roles de usuario, asegurando que solo el personal autorizado pueda modificar el inventario o visualizar el registro de ventas.

## 4. Tecnologías Utilizadas

Para cumplir con los requisitos de alta disponibilidad y solidez técnica, se utilizó el siguiente stack:

- **Backend:** Node.js con Express y TypeScript (arquitectura en capas: Controladores, Servicios, Rutas).
- **Base de Datos:** PostgreSQL gestionado a través de Prisma ORM para asegurar un tipado estricto de los modelos de datos.
- **Frontend:** React con TypeScript, orientado a una experiencia de usuario ágil y responsiva.
- **Comunicación en Tiempo Real:** Uso de WebSockets con Socket.io para notificar instantáneamente la actualización de stock en todos los terminales cuando se realiza una venta.

## 5. Estructura de la Base de Datos

El sistema se apoya en una estructura relacional de 5 tablas principales:

- **users:** Gestión de credenciales y perfiles de acceso de los empleados.
- **categories:** Clasificación organizada de los productos de SH Servicios.
- **products:** Registro maestro de artículos (precios, descripción, código único y stock).
- **sales:** Registro de cabecera de cada venta (fecha, total y usuario que la realizó).
- **sale_details:** Detalle de los artículos y cantidades incluidas en cada venta.

## 6. Despliegue en la Nube

La aplicación será desplegada en entornos cloud para garantizar su acceso remoto:

- **Infraestructura:** Render / Vercel.
- **Persistencia:** PostgreSQL.

## Conclusión

Este sistema proporciona a SH Servicios una herramienta técnica avanzada para el control de su activo más importante: el stock. La integración de WebSockets y la arquitectura en TypeScript aseguran una plataforma escalable, rápida y libre de errores de sincronización, cumpliendo con los estándares actuales de desarrollo de software.
