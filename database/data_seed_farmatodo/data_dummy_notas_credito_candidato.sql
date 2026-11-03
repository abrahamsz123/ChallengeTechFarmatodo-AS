-- =====================================================================
-- DATA DE EJEMPLO — Caso 2: Flujo de aprobación de notas de crédito
-- Farmatodo · Transformación Financiera · Prueba Técnica
-- TODOS los datos son ficticios. No representan tiendas ni cifras reales.
--
-- CÓMO USAR ESTE ARCHIVO:
-- Este es un dataset de ejemplo que puedes usar como semilla para tu base
-- de datos, si quieres ahorrarte el paso de inventar los datos desde cero.
-- Es opcional: puedes usarlo tal cual, modificarlo, o generar el tuyo propio
-- con AI o scripts — lo que se evalúa es el modelo relacional y el flujo de
-- aprobación que construyas encima, no el origen de los datos.
--
-- CONTEXTO DE NEGOCIO: las notas de crédito las recibe el departamento de
-- Cuentas por Cobrar o Cuentas por Pagar por productos despachados a
-- tiendas, pertenecientes a distintas compañías (proveedores/fabricantes).
-- Es un proceso AISLADO de usuarios específicos: no hay solicitante ni
-- aprobador individual. El control debe ser de ROL — un usuario puede
-- ejecutar el proceso (aprobar/rechazar) si su rol pertenece al departamento
-- responsable de esa nota (`departamento_responsable`), sin que se registre
-- una persona específica como quien lo hizo. Por eso este dataset no incluye
-- tablas de colaboradores/usuarios: el login y los roles del portal son
-- responsabilidad tuya, según la sección 3.2 del enunciado.
-- =====================================================================

-- Esquema de referencia (ajusta tipos según tu motor de BD elegido)

CREATE TABLE tiendas (
    id INTEGER PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    pais VARCHAR(50) NOT NULL
);

CREATE TABLE companias (
    id INTEGER PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    rubro VARCHAR(50) NOT NULL
);

CREATE TABLE notas_credito (
    id INTEGER PRIMARY KEY,
    monto DECIMAL(12,2) NOT NULL,
    moneda VARCHAR(5) NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    tienda_id INTEGER NOT NULL REFERENCES tiendas(id),
    compania_id INTEGER NOT NULL REFERENCES companias(id),
    departamento_responsable VARCHAR(50) NOT NULL, -- 'Cuentas por Cobrar' | 'Cuentas por Pagar'
    estado VARCHAR(20) NOT NULL,                    -- pendiente | aprobada | rechazada
    fecha_creacion TIMESTAMP NOT NULL
);

CREATE TABLE notas_credito_auditoria (
    id INTEGER PRIMARY KEY,
    nota_credito_id INTEGER NOT NULL REFERENCES notas_credito(id),
    accion VARCHAR(30) NOT NULL,        -- creacion | resolucion
    estado_anterior VARCHAR(20),
    estado_nuevo VARCHAR(20) NOT NULL,
    fecha TIMESTAMP NOT NULL,
    comentario VARCHAR(255)
    -- Sin usuario_id a propósito: el proceso no registra una persona
    -- específica, solo el cambio de estado.
);

-- ---------------------------------------------------------------------
-- TIENDAS (destino de despacho de producto)
-- ---------------------------------------------------------------------
INSERT INTO tiendas (id, nombre, pais) VALUES (1, 'Tienda Chacao', 'Venezuela');
INSERT INTO tiendas (id, nombre, pais) VALUES (2, 'Tienda Las Mercedes', 'Venezuela');
INSERT INTO tiendas (id, nombre, pais) VALUES (3, 'Tienda Maracaibo Centro', 'Venezuela');
INSERT INTO tiendas (id, nombre, pais) VALUES (4, 'Tienda Palermo', 'Argentina');
INSERT INTO tiendas (id, nombre, pais) VALUES (5, 'Tienda Belgrano', 'Argentina');
INSERT INTO tiendas (id, nombre, pais) VALUES (6, 'Tienda Córdoba Norte', 'Argentina');

-- ---------------------------------------------------------------------
-- COMPAÑÍAS (proveedores/fabricantes a los que pertenecen los productos)
-- ---------------------------------------------------------------------
INSERT INTO companias (id, nombre, rubro) VALUES (1, 'Laboratorios Andina C.A.', 'Farmacéutico');
INSERT INTO companias (id, nombre, rubro) VALUES (2, 'Distribuidora Cuyaní', 'Cuidado personal');
INSERT INTO companias (id, nombre, rubro) VALUES (3, 'Nutrisana Import', 'Nutrición y suplementos');
INSERT INTO companias (id, nombre, rubro) VALUES (4, 'Grupo Farmavalle', 'Farmacéutico');
INSERT INTO companias (id, nombre, rubro) VALUES (5, 'Beltek Consumo Masivo', 'Consumo masivo');
INSERT INTO companias (id, nombre, rubro) VALUES (6, 'Salud Total Distribución', 'Farmacéutico');

-- ---------------------------------------------------------------------
-- NOTAS DE CRÉDITO (25 registros ficticios, estados variados)
-- ---------------------------------------------------------------------
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (1, 1262.21, 'USD', 'Error de facturación en monto despachado', 6, 1, 'Cuentas por Cobrar', 'aprobada', '2026-05-18 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (2, 1132.26, 'USD', 'Producto recibido en mal estado', 5, 4, 'Cuentas por Cobrar', 'pendiente', '2026-07-04 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (3, 2966.87, 'USD', 'Diferencia cambiaria en pago anticipado a proveedor', 6, 6, 'Cuentas por Pagar', 'pendiente', '2026-05-01 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (4, 3829.3, 'USD', 'Diferencia cambiaria en pago anticipado a proveedor', 3, 3, 'Cuentas por Cobrar', 'pendiente', '2026-05-14 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (5, 4045.28, 'USD', 'Diferencia cambiaria en pago anticipado a proveedor', 1, 3, 'Cuentas por Pagar', 'aprobada', '2026-06-28 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (6, 3111.67, 'USD', 'Error de facturación en monto despachado', 1, 5, 'Cuentas por Pagar', 'rechazada', '2026-06-16 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (7, 4926.85, 'USD', 'Diferencia cambiaria en pago anticipado a proveedor', 1, 6, 'Cuentas por Cobrar', 'aprobada', '2026-05-30 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (8, 1808.59, 'VES', 'Error de facturación en monto despachado', 3, 4, 'Cuentas por Pagar', 'pendiente', '2026-07-25 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (9, 1261.81, 'VES', 'Duplicidad de despacho a la misma tienda', 5, 6, 'Cuentas por Cobrar', 'aprobada', '2026-06-29 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (10, 4222.12, 'USD', 'Devolución de producto por vencimiento', 6, 6, 'Cuentas por Cobrar', 'aprobada', '2026-05-08 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (11, 4570.02, 'VES', 'Producto recibido en mal estado', 3, 4, 'Cuentas por Pagar', 'pendiente', '2026-07-12 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (12, 3232.12, 'VES', 'Ajuste de precio por promoción no aplicada', 6, 4, 'Cuentas por Pagar', 'rechazada', '2026-05-19 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (13, 2170.75, 'VES', 'Descuento comercial no reflejado en factura', 2, 6, 'Cuentas por Pagar', 'aprobada', '2026-07-14 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (14, 283.23, 'USD', 'Ajuste de precio por promoción no aplicada', 2, 2, 'Cuentas por Pagar', 'pendiente', '2026-05-15 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (15, 2999.65, 'VES', 'Devolución de producto por vencimiento', 6, 4, 'Cuentas por Cobrar', 'aprobada', '2026-06-29 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (16, 2708.0, 'VES', 'Error de facturación en monto despachado', 6, 6, 'Cuentas por Cobrar', 'aprobada', '2026-06-04 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (17, 4771.39, 'USD', 'Error de facturación en monto despachado', 3, 4, 'Cuentas por Cobrar', 'aprobada', '2026-06-03 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (18, 3824.43, 'USD', 'Descuento comercial no reflejado en factura', 6, 3, 'Cuentas por Cobrar', 'pendiente', '2026-07-09 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (19, 4399.67, 'USD', 'Devolución de producto por vencimiento', 4, 1, 'Cuentas por Cobrar', 'rechazada', '2026-06-09 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (20, 2455.65, 'USD', 'Ajuste de precio por promoción no aplicada', 2, 5, 'Cuentas por Cobrar', 'pendiente', '2026-05-09 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (21, 4368.54, 'USD', 'Producto recibido en mal estado', 6, 4, 'Cuentas por Cobrar', 'pendiente', '2026-06-24 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (22, 3266.9, 'VES', 'Error de facturación en monto despachado', 6, 3, 'Cuentas por Pagar', 'rechazada', '2026-06-26 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (23, 2962.13, 'USD', 'Devolución de producto por vencimiento', 2, 2, 'Cuentas por Cobrar', 'pendiente', '2026-05-30 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (24, 4531.83, 'USD', 'Producto recibido en mal estado', 1, 6, 'Cuentas por Cobrar', 'pendiente', '2026-06-12 00:00:00');
INSERT INTO notas_credito (id, monto, moneda, motivo, tienda_id, compania_id, departamento_responsable, estado, fecha_creacion) VALUES (25, 704.94, 'VES', 'Producto recibido en mal estado', 3, 6, 'Cuentas por Pagar', 'pendiente', '2026-07-13 00:00:00');

-- ---------------------------------------------------------------------
-- AUDITORÍA DE NOTAS DE CRÉDITO (sin usuario asociado)
-- ---------------------------------------------------------------------
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (1, 1, 'creacion', NULL, 'pendiente', '2026-05-18 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (2, 1, 'resolucion', 'pendiente', 'aprobada', '2026-05-22 00:00:00', 'Aprobada tras validación de soporte de despacho');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (3, 2, 'creacion', NULL, 'pendiente', '2026-07-04 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (4, 3, 'creacion', NULL, 'pendiente', '2026-05-01 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (5, 4, 'creacion', NULL, 'pendiente', '2026-05-14 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (6, 5, 'creacion', NULL, 'pendiente', '2026-06-28 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (7, 5, 'resolucion', 'pendiente', 'aprobada', '2026-07-02 00:00:00', 'Aprobada tras validación de soporte de despacho');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (8, 6, 'creacion', NULL, 'pendiente', '2026-06-16 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (9, 6, 'resolucion', 'pendiente', 'rechazada', '2026-06-18 00:00:00', 'Rechazada: soporte de despacho insuficiente');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (10, 7, 'creacion', NULL, 'pendiente', '2026-05-30 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (11, 7, 'resolucion', 'pendiente', 'aprobada', '2026-05-31 00:00:00', 'Aprobada tras validación de soporte de despacho');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (12, 8, 'creacion', NULL, 'pendiente', '2026-07-25 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (13, 9, 'creacion', NULL, 'pendiente', '2026-06-29 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (14, 9, 'resolucion', 'pendiente', 'aprobada', '2026-06-30 00:00:00', 'Aprobada tras validación de soporte de despacho');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (15, 10, 'creacion', NULL, 'pendiente', '2026-05-08 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (16, 10, 'resolucion', 'pendiente', 'aprobada', '2026-05-12 00:00:00', 'Aprobada tras validación de soporte de despacho');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (17, 11, 'creacion', NULL, 'pendiente', '2026-07-12 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (18, 12, 'creacion', NULL, 'pendiente', '2026-05-19 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (19, 12, 'resolucion', 'pendiente', 'rechazada', '2026-05-22 00:00:00', 'Rechazada: soporte de despacho insuficiente');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (20, 13, 'creacion', NULL, 'pendiente', '2026-07-14 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (21, 13, 'resolucion', 'pendiente', 'aprobada', '2026-07-18 00:00:00', 'Aprobada tras validación de soporte de despacho');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (22, 14, 'creacion', NULL, 'pendiente', '2026-05-15 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (23, 15, 'creacion', NULL, 'pendiente', '2026-06-29 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (24, 15, 'resolucion', 'pendiente', 'aprobada', '2026-07-03 00:00:00', 'Aprobada tras validación de soporte de despacho');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (25, 16, 'creacion', NULL, 'pendiente', '2026-06-04 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (26, 16, 'resolucion', 'pendiente', 'aprobada', '2026-06-08 00:00:00', 'Aprobada tras validación de soporte de despacho');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (27, 17, 'creacion', NULL, 'pendiente', '2026-06-03 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (28, 17, 'resolucion', 'pendiente', 'aprobada', '2026-06-04 00:00:00', 'Aprobada tras validación de soporte de despacho');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (29, 18, 'creacion', NULL, 'pendiente', '2026-07-09 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (30, 19, 'creacion', NULL, 'pendiente', '2026-06-09 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (31, 19, 'resolucion', 'pendiente', 'rechazada', '2026-06-10 00:00:00', 'Rechazada: soporte de despacho insuficiente');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (32, 20, 'creacion', NULL, 'pendiente', '2026-05-09 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (33, 21, 'creacion', NULL, 'pendiente', '2026-06-24 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (34, 22, 'creacion', NULL, 'pendiente', '2026-06-26 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (35, 22, 'resolucion', 'pendiente', 'rechazada', '2026-06-27 00:00:00', 'Rechazada: soporte de despacho insuficiente');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (36, 23, 'creacion', NULL, 'pendiente', '2026-05-30 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (37, 24, 'creacion', NULL, 'pendiente', '2026-06-12 00:00:00', 'Nota de crédito generada por despacho a tienda');
INSERT INTO notas_credito_auditoria (id, nota_credito_id, accion, estado_anterior, estado_nuevo, fecha, comentario) VALUES (38, 25, 'creacion', NULL, 'pendiente', '2026-07-13 00:00:00', 'Nota de crédito generada por despacho a tienda');