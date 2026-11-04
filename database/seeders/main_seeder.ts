import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'

export default class extends BaseSeeder {
  async run() {
    // Limpiar tablas previas respetando llaves foráneas
    await db.rawQuery('TRUNCATE TABLE notas_credito_auditoria, notas_credito, users, cargos, departamentos, tiendas, companias RESTART IDENTITY CASCADE;')

    // =========================================================================
    // 1. DEPARTAMENTOS DE LA VP DE FINANZAS (5 Departamentos - Mínimo 4)
    // =========================================================================
    await db
      .table('departamentos')
      .insert([
        { id: 1, nombre: 'Planificación Financiera', codigo: 'PLAN_FIN', descripcion: 'Modelado financiero, presupuestos y control de gestión' },
        { id: 2, nombre: 'Tesorería', codigo: 'TES', descripcion: 'Gestión de liquidez, pagos, flujo de caja y relaciones bancarias' },
        { id: 3, nombre: 'Contraloría', codigo: 'CONT', descripcion: 'Auditoría interna, cumplimiento normativo y control de activos' },
        { id: 4, nombre: 'Cuentas por Pagar', codigo: 'CXP', descripcion: 'Relación con proveedores, liquidación de facturas y notas de crédito' },
        { id: 5, nombre: 'Cuentas por Cobrar', codigo: 'CXC', descripcion: 'Conciliación de ventas de tiendas, clientes corporativos y recaudación' },
      ])
      .returning(['id', 'nombre'])

    // =========================================================================
    // 2. CARGOS Y FUNCIONES ASOCIADAS (Entidad Separada Normalizada)
    // =========================================================================
    await db.table('cargos').insert([
      // Planificación Financiera
      { id: 1, departamento_id: 1, nombre_cargo: 'Gerente de Planificación Financiera', nivel_seniority: 'Gerencia', funciones_principales: 'Supervisión del presupuesto maestro anual, proyecciones financieras y presentación de resultados a la VP.' },
      { id: 2, departamento_id: 1, nombre_cargo: 'Analista Senior de Presupuesto', nivel_seniority: 'Senior', funciones_principales: 'Consolidación de variaciones presupuestarias mensuales y análisis de desviaciones de OPEX/CAPEX.' },
      { id: 3, departamento_id: 1, nombre_cargo: 'Analista de Modelado Financiero', nivel_seniority: 'Semi-Senior', funciones_principales: 'Construcción y calibración de modelos predictivos de rentabilidad por categoría de tienda.' },

      // Tesorería
      { id: 4, departamento_id: 2, nombre_cargo: 'Jefe de Tesorería', nivel_seniority: 'Jefatura', funciones_principales: 'Autorización de giros bancarios, optimización del capital de trabajo y cobertura cambiaria.' },
      { id: 5, departamento_id: 2, nombre_cargo: 'Coordinador de Flujo de Caja', nivel_seniority: 'Senior', funciones_principales: 'Monitoreo diario de ingresos por tienda y programación de pagos a proveedores prioritarios.' },
      { id: 6, departamento_id: 2, nombre_cargo: 'Analista de Conciliaciones Bancarias', nivel_seniority: 'Junior', funciones_principales: 'Cruce diario de extractos bancarios con los cierres de caja de las farmacias.' },

      // Contraloría
      { id: 7, departamento_id: 3, nombre_cargo: 'Jefe de Contraloría y Control Interno', nivel_seniority: 'Jefatura', funciones_principales: 'Diseño y auditoría de políticas de control interno, segregación de funciones y gestión de riesgos.' },
      { id: 8, departamento_id: 3, nombre_cargo: 'Auditor Financiero Senior', nivel_seniority: 'Senior', funciones_principales: 'Auditoría forense sobre procesos de caja, inventarios y notas de crédito de alto valor.' },
      { id: 9, departamento_id: 3, nombre_cargo: 'Analista de Cumplimiento', nivel_seniority: 'Semi-Senior', funciones_principales: 'Verificación de normativas tributarias (SENIAT) y soporte documental en expedientes fiscales.' },

      // Cuentas por Pagar
      { id: 10, departamento_id: 4, nombre_cargo: 'Jefe de Cuentas por Pagar', nivel_seniority: 'Jefatura', funciones_principales: 'Aprobación final de notas de crédito a proveedores y validación de órdenes de pago.' },
      { id: 11, departamento_id: 4, nombre_cargo: 'Especialista en Proveedores', nivel_seniority: 'Senior', funciones_principales: 'Conciliación de saldos con laboratorios farmacéuticos y empresas de consumo masivo.' },
      { id: 12, departamento_id: 4, nombre_cargo: 'Analista de Notas de Crédito CxP', nivel_seniority: 'Junior', funciones_principales: 'Recepción, verificación y registro en sistema de solicitudes de notas de crédito por averías o descuentos.' },

      // Cuentas por Cobrar
      { id: 13, departamento_id: 5, nombre_cargo: 'Jefe de Cuentas por Cobrar', nivel_seniority: 'Jefatura', funciones_principales: 'Supervisión de la cartera de recaudación institucional y resolución de disputas comerciales.' },
      { id: 14, departamento_id: 5, nombre_cargo: 'Supervisor de Facturación Retail', nivel_seniority: 'Senior', funciones_principales: 'Validación de devoluciones en tiendas y emisión de notas de crédito comerciales.' },
      { id: 15, departamento_id: 5, nombre_cargo: 'Analista de Recaudación', nivel_seniority: 'Junior', funciones_principales: 'Registro contable de notas de crédito aprobadas y conciliación con puntos de venta.' },
    ])

    // =========================================================================
    // 3. COLABORADORES FICTICIOS DE LA VP (45 Colaboradores: ~9 por Dpto)
    // =========================================================================
    const defaultPassword = await hash.make('Farmatodo2026!')

    const colaboradoresData = [
      // CUENTAS POR PAGAR (Usuarios Clave Demo)
      { id: 1, departamento_id: 4, cargo_id: 10, nombre_completo: 'Mariana Gómez', email: 'jefe.cxp@farmatodo.local', rol: 'jefe', pais: 'Venezuela', fecha_ingreso: '2021-03-15', estado: 'activo' },
      { id: 2, departamento_id: 4, cargo_id: 12, nombre_completo: 'Andrés Silva', email: 'analista.cxp@farmatodo.local', rol: 'colaborador', pais: 'Venezuela', fecha_ingreso: '2023-06-01', estado: 'activo' },
      { id: 3, departamento_id: 4, cargo_id: 11, nombre_completo: 'Valeria Mendoza', email: 'valeria.mendoza@farmatodo.local', rol: 'colaborador', pais: 'Venezuela', fecha_ingreso: '2022-01-20', estado: 'activo' },
      { id: 4, departamento_id: 4, cargo_id: 12, nombre_completo: 'Gabriel Parra', email: 'gabriel.parra@farmatodo.local', rol: 'colaborador', pais: 'Venezuela', fecha_ingreso: '2024-02-10', estado: 'activo' },
      { id: 5, departamento_id: 4, cargo_id: 12, nombre_completo: 'Camila Rivas', email: 'camila.rivas@farmatodo.local', rol: 'colaborador', pais: 'Argentina', fecha_ingreso: '2023-11-15', estado: 'activo' },
      { id: 6, departamento_id: 4, cargo_id: 11, nombre_completo: 'Mateo Rossi', email: 'mateo.rossi@farmatodo.local', rol: 'colaborador', pais: 'Argentina', fecha_ingreso: '2022-08-01', estado: 'activo' },
      { id: 7, departamento_id: 4, cargo_id: 12, nombre_completo: 'Lucía Fernández', email: 'lucia.fernandez@farmatodo.local', rol: 'colaborador', pais: 'Argentina', fecha_ingreso: '2024-05-18', estado: 'activo' },
      { id: 8, departamento_id: 4, cargo_id: 12, nombre_completo: 'Javier Castillo', email: 'javier.castillo@farmatodo.local', rol: 'colaborador', pais: 'Venezuela', fecha_ingreso: '2021-09-01', estado: 'inactivo' },

      // CUENTAS POR COBRAR (Usuarios Clave Demo)
      { id: 9, departamento_id: 5, cargo_id: 13, nombre_completo: 'Ricardo Benítez', email: 'jefe.cxc@farmatodo.local', rol: 'jefe', pais: 'Venezuela', fecha_ingreso: '2020-05-10', estado: 'activo' },
      { id: 10, departamento_id: 5, cargo_id: 15, nombre_completo: 'Daniela Salazar', email: 'analista.cxc@farmatodo.local', rol: 'colaborador', pais: 'Venezuela', fecha_ingreso: '2023-08-12', estado: 'activo' },
      { id: 11, departamento_id: 5, cargo_id: 14, nombre_completo: 'Joaquín Morales', email: 'joaquin.morales@farmatodo.local', rol: 'colaborador', pais: 'Argentina', fecha_ingreso: '2022-04-15', estado: 'activo' },
      { id: 12, departamento_id: 5, cargo_id: 15, nombre_completo: 'Sofía Álvarez', email: 'sofia.alvarez@farmatodo.local', rol: 'colaborador', pais: 'Argentina', fecha_ingreso: '2024-01-22', estado: 'activo' },
      { id: 13, departamento_id: 5, cargo_id: 15, nombre_completo: 'Manuel Toro', email: 'manuel.toro@farmatodo.local', rol: 'colaborador', pais: 'Venezuela', fecha_ingreso: '2023-03-30', estado: 'activo' },
      { id: 14, departamento_id: 5, cargo_id: 14, nombre_completo: 'Isabella Castro', email: 'isabella.castro@farmatodo.local', rol: 'colaborador', pais: 'Venezuela', fecha_ingreso: '2021-11-05', estado: 'activo' },
      { id: 15, departamento_id: 5, cargo_id: 15, nombre_completo: 'Tomás Bianchi', email: 'tomas.bianchi@farmatodo.local', rol: 'colaborador', pais: 'Argentina', fecha_ingreso: '2023-10-01', estado: 'activo' },
      { id: 16, departamento_id: 5, cargo_id: 15, nombre_completo: 'Elena Prieto', email: 'elena.prieto@farmatodo.local', rol: 'colaborador', pais: 'Venezuela', fecha_ingreso: '2022-07-19', estado: 'activo' },

      // PLANIFICACIÓN FINANCIERA (Admin General y Equipo)
      { id: 17, departamento_id: 1, cargo_id: 1, nombre_completo: 'Abraham Santana (Admin)', email: 'admin@farmatodo.local', rol: 'admin', pais: 'Venezuela', fecha_ingreso: '2020-01-15', estado: 'activo' },
      { id: 18, departamento_id: 1, cargo_id: 2, nombre_completo: 'Carlos Eduardo Peña', email: 'carlos.pena@farmatodo.local', rol: 'colaborador', pais: 'Venezuela', fecha_ingreso: '2021-04-20', estado: 'activo' },
      { id: 19, departamento_id: 1, cargo_id: 3, nombre_completo: 'Agustina Di Marco', email: 'agustina.dimarco@farmatodo.local', rol: 'colaborador', pais: 'Argentina', fecha_ingreso: '2022-09-10', estado: 'activo' },
      { id: 20, departamento_id: 1, cargo_id: 2, nombre_completo: 'Leonardo Rangel', email: 'leonardo.rangel@farmatodo.local', rol: 'colaborador', pais: 'Venezuela', fecha_ingreso: '2023-02-14', estado: 'activo' },
      { id: 21, departamento_id: 1, cargo_id: 3, nombre_completo: 'Florencia Herrera', email: 'florencia.herrera@farmatodo.local', rol: 'colaborador', pais: 'Argentina', fecha_ingreso: '2023-07-01', estado: 'activo' },
      { id: 22, departamento_id: 1, cargo_id: 2, nombre_completo: 'José Miguel Torres', email: 'jose.torres@farmatodo.local', rol: 'colaborador', pais: 'Venezuela', fecha_ingreso: '2024-03-05', estado: 'activo' },
      { id: 23, departamento_id: 1, cargo_id: 3, nombre_completo: 'Esteban Domínguez', email: 'esteban.dominguez@farmatodo.local', rol: 'colaborador', pais: 'Argentina', fecha_ingreso: '2022-12-01', estado: 'activo' },
      { id: 24, departamento_id: 1, cargo_id: 3, nombre_completo: 'Adriana Padrón', email: 'adriana.padron@farmatodo.local', rol: 'colaborador', pais: 'Venezuela', fecha_ingreso: '2021-06-18', estado: 'activo' },

      // TESORERÍA (Demostración de Restricción RBAC)
      { id: 25, departamento_id: 2, cargo_id: 4, nombre_completo: 'Beatriz Quintana', email: 'jefe.tesoreria@farmatodo.local', rol: 'jefe', pais: 'Venezuela', fecha_ingreso: '2020-03-10', estado: 'activo' },
      { id: 26, departamento_id: 2, cargo_id: 6, nombre_completo: 'Santiago Méndez', email: 'analista.tesoreria@farmatodo.local', rol: 'colaborador', pais: 'Venezuela', fecha_ingreso: '2023-05-15', estado: 'activo' },
      { id: 27, departamento_id: 2, cargo_id: 5, nombre_completo: 'Victoria Soria', email: 'victoria.soria@farmatodo.local', rol: 'colaborador', pais: 'Argentina', fecha_ingreso: '2022-03-01', estado: 'activo' },
      { id: 28, departamento_id: 2, cargo_id: 6, nombre_completo: 'Nicolás Godoy', email: 'nicolas.godoy@farmatodo.local', rol: 'colaborador', pais: 'Argentina', fecha_ingreso: '2024-01-10', estado: 'activo' },
      { id: 29, departamento_id: 2, cargo_id: 6, nombre_completo: 'Paula Gil', email: 'paula.gil@farmatodo.local', rol: 'colaborador', pais: 'Venezuela', fecha_ingreso: '2023-09-20', estado: 'activo' },
      { id: 30, departamento_id: 2, cargo_id: 5, nombre_completo: 'Sebastián Romero', email: 'sebastian.romero@farmatodo.local', rol: 'colaborador', pais: 'Venezuela', fecha_ingreso: '2021-10-12', estado: 'activo' },
      { id: 31, departamento_id: 2, cargo_id: 6, nombre_completo: 'Martina Paz', email: 'martina.paz@farmatodo.local', rol: 'colaborador', pais: 'Argentina', fecha_ingreso: '2022-06-25', estado: 'activo' },
      { id: 32, departamento_id: 2, cargo_id: 6, nombre_completo: 'Enrique Vargas', email: 'enrique.vargas@farmatodo.local', rol: 'colaborador', pais: 'Venezuela', fecha_ingreso: '2020-08-30', estado: 'inactivo' },

      // CONTRALORÍA
      { id: 33, departamento_id: 3, cargo_id: 7, nombre_completo: 'Guillermo Arismendi', email: 'jefe.contraloria@farmatodo.local', rol: 'jefe', pais: 'Venezuela', fecha_ingreso: '2019-11-01', estado: 'activo' },
      { id: 34, departamento_id: 3, cargo_id: 8, nombre_completo: 'Ignacio Font', email: 'auditor.contraloria@farmatodo.local', rol: 'colaborador', pais: 'Argentina', fecha_ingreso: '2022-02-18', estado: 'activo' },
      { id: 35, departamento_id: 3, cargo_id: 9, nombre_completo: 'Carolina Márquez', email: 'carolina.marquez@farmatodo.local', rol: 'colaborador', pais: 'Venezuela', fecha_ingreso: '2023-04-05', estado: 'activo' },
      { id: 36, departamento_id: 3, cargo_id: 8, nombre_completo: 'Franco Zanetti', email: 'franco.zanetti@farmatodo.local', rol: 'colaborador', pais: 'Argentina', fecha_ingreso: '2021-08-22', estado: 'activo' },
      { id: 37, departamento_id: 3, cargo_id: 9, nombre_completo: 'María José Rivas', email: 'mariajose.rivas@farmatodo.local', rol: 'colaborador', pais: 'Venezuela', fecha_ingreso: '2024-02-01', estado: 'activo' },
      { id: 38, departamento_id: 3, cargo_id: 9, nombre_completo: 'Lucas Varela', email: 'lucas.varela@farmatodo.local', rol: 'colaborador', pais: 'Argentina', fecha_ingreso: '2023-12-10', estado: 'activo' },
      { id: 39, departamento_id: 3, cargo_id: 8, nombre_completo: 'Claudia Briceño', email: 'claudia.briceno@farmatodo.local', rol: 'colaborador', pais: 'Venezuela', fecha_ingreso: '2022-10-15', estado: 'activo' },
      { id: 40, departamento_id: 3, cargo_id: 9, nombre_completo: 'David Uzcátegui', email: 'david.uzcategui@farmatodo.local', rol: 'colaborador', pais: 'Venezuela', fecha_ingreso: '2021-05-20', estado: 'activo' },
    ]

    for (const c of colaboradoresData) {
      await db.table('users').insert({
        ...c,
        password: defaultPassword,
      })
    }

    // =========================================================================
    // 4. TIENDAS (6 Tiendas del Dataset Farmatodo)
    // =========================================================================
    await db.table('tiendas').insert([
      { id: 1, nombre: 'Tienda Chacao', pais: 'Venezuela' },
      { id: 2, nombre: 'Tienda Las Mercedes', pais: 'Venezuela' },
      { id: 3, nombre: 'Tienda Maracaibo Centro', pais: 'Venezuela' },
      { id: 4, nombre: 'Tienda Palermo', pais: 'Argentina' },
      { id: 5, nombre: 'Tienda Belgrano', pais: 'Argentina' },
      { id: 6, nombre: 'Tienda Córdoba Norte', pais: 'Argentina' },
    ])

    // =========================================================================
    // 5. COMPAÑÍAS (6 Proveedores del Dataset Farmatodo)
    // =========================================================================
    await db.table('companias').insert([
      { id: 1, nombre: 'Laboratorios Andina C.A.', rubro: 'Farmacéutico' },
      { id: 2, nombre: 'Distribuidora Cuyaní', rubro: 'Cuidado personal' },
      { id: 3, nombre: 'Nutrisana Import', rubro: 'Nutrición y suplementos' },
      { id: 4, nombre: 'Grupo Farmavalle', rubro: 'Farmacéutico' },
      { id: 5, nombre: 'Beltek Consumo Masivo', rubro: 'Consumo masivo' },
      { id: 6, nombre: 'Salud Total Distribución', rubro: 'Farmacéutico' },
    ])

    // =========================================================================
    // 6. NOTAS DE CRÉDITO (25 Registros Oficiales con Score de Riesgo Calculado)
    // =========================================================================
    const rawNotas = [
      { id: 1, monto: 1262.21, moneda: 'USD', motivo: 'Error de facturación en monto despachado', tienda_id: 6, compania_id: 1, departamento_responsable: 'Cuentas por Cobrar', estado: 'aprobada', fecha_creacion: '2026-05-18 00:00:00' },
      { id: 2, monto: 1132.26, moneda: 'USD', motivo: 'Producto recibido en mal estado', tienda_id: 5, compania_id: 4, departamento_responsable: 'Cuentas por Cobrar', estado: 'pendiente', fecha_creacion: '2026-07-04 00:00:00' },
      { id: 3, monto: 2966.87, moneda: 'USD', motivo: 'Diferencia cambiaria en pago anticipado a proveedor', tienda_id: 6, compania_id: 6, departamento_responsable: 'Cuentas por Pagar', estado: 'pendiente', fecha_creacion: '2026-05-01 00:00:00' },
      { id: 4, monto: 3829.30, moneda: 'USD', motivo: 'Diferencia cambiaria en pago anticipado a proveedor', tienda_id: 3, compania_id: 3, departamento_responsable: 'Cuentas por Cobrar', estado: 'pendiente', fecha_creacion: '2026-05-14 00:00:00' },
      { id: 5, monto: 4045.28, moneda: 'USD', motivo: 'Diferencia cambiaria en pago anticipado a proveedor', tienda_id: 1, compania_id: 3, departamento_responsable: 'Cuentas por Pagar', estado: 'aprobada', fecha_creacion: '2026-06-28 00:00:00' },
      { id: 6, monto: 3111.67, moneda: 'USD', motivo: 'Error de facturación en monto despachado', tienda_id: 1, compania_id: 5, departamento_responsable: 'Cuentas por Pagar', estado: 'rechazada', fecha_creacion: '2026-06-16 00:00:00' },
      { id: 7, monto: 4926.85, moneda: 'USD', motivo: 'Diferencia cambiaria en pago anticipado a proveedor', tienda_id: 1, compania_id: 6, departamento_responsable: 'Cuentas por Cobrar', estado: 'aprobada', fecha_creacion: '2026-05-30 00:00:00' },
      { id: 8, monto: 1808.59, moneda: 'VES', motivo: 'Error de facturación en monto despachado', tienda_id: 3, compania_id: 4, departamento_responsable: 'Cuentas por Pagar', estado: 'pendiente', fecha_creacion: '2026-07-25 00:00:00' },
      { id: 9, monto: 1261.81, moneda: 'VES', motivo: 'Duplicidad de despacho a la misma tienda', tienda_id: 5, compania_id: 6, departamento_responsable: 'Cuentas por Cobrar', estado: 'aprobada', fecha_creacion: '2026-06-29 00:00:00' },
      { id: 10, monto: 4222.12, moneda: 'USD', motivo: 'Devolución de producto por vencimiento', tienda_id: 6, compania_id: 6, departamento_responsable: 'Cuentas por Cobrar', estado: 'aprobada', fecha_creacion: '2026-05-08 00:00:00' },
      { id: 11, monto: 4570.02, moneda: 'VES', motivo: 'Producto recibido en mal estado', tienda_id: 3, compania_id: 4, departamento_responsable: 'Cuentas por Pagar', estado: 'pendiente', fecha_creacion: '2026-07-12 00:00:00' },
      { id: 12, monto: 3232.12, moneda: 'VES', motivo: 'Ajuste de precio por promoción no aplicada', tienda_id: 6, compania_id: 4, departamento_responsable: 'Cuentas por Pagar', estado: 'rechazada', fecha_creacion: '2026-05-19 00:00:00' },
      { id: 13, monto: 2170.75, moneda: 'VES', motivo: 'Descuento comercial no reflejado en factura', tienda_id: 2, compania_id: 6, departamento_responsable: 'Cuentas por Pagar', estado: 'aprobada', fecha_creacion: '2026-07-14 00:00:00' },
      { id: 14, monto: 283.23, moneda: 'USD', motivo: 'Ajuste de precio por promoción no aplicada', tienda_id: 2, compania_id: 2, departamento_responsable: 'Cuentas por Pagar', estado: 'pendiente', fecha_creacion: '2026-05-15 00:00:00' },
      { id: 15, monto: 2999.65, moneda: 'VES', motivo: 'Devolución de producto por vencimiento', tienda_id: 6, compania_id: 4, departamento_responsable: 'Cuentas por Cobrar', estado: 'aprobada', fecha_creacion: '2026-06-29 00:00:00' },
      { id: 16, monto: 2708.00, moneda: 'VES', motivo: 'Error de facturación en monto despachado', tienda_id: 6, compania_id: 6, departamento_responsable: 'Cuentas por Cobrar', estado: 'aprobada', fecha_creacion: '2026-06-04 00:00:00' },
      { id: 17, monto: 4771.39, moneda: 'USD', motivo: 'Error de facturación en monto despachado', tienda_id: 3, compania_id: 4, departamento_responsable: 'Cuentas por Cobrar', estado: 'aprobada', fecha_creacion: '2026-06-03 00:00:00' },
      { id: 18, monto: 3824.43, moneda: 'USD', motivo: 'Descuento comercial no reflejado en factura', tienda_id: 6, compania_id: 3, departamento_responsable: 'Cuentas por Cobrar', estado: 'pendiente', fecha_creacion: '2026-07-09 00:00:00' },
      { id: 19, monto: 4399.67, moneda: 'USD', motivo: 'Devolución de producto por vencimiento', tienda_id: 4, compania_id: 1, departamento_responsable: 'Cuentas por Cobrar', estado: 'rechazada', fecha_creacion: '2026-06-09 00:00:00' },
      { id: 20, monto: 2455.65, moneda: 'USD', motivo: 'Ajuste de precio por promoción no aplicada', tienda_id: 2, compania_id: 5, departamento_responsable: 'Cuentas por Cobrar', estado: 'pendiente', fecha_creacion: '2026-05-09 00:00:00' },
      { id: 21, monto: 4368.54, moneda: 'USD', motivo: 'Producto recibido en mal estado', tienda_id: 6, compania_id: 4, departamento_responsable: 'Cuentas por Cobrar', estado: 'pendiente', fecha_creacion: '2026-06-24 00:00:00' },
      { id: 22, monto: 3266.90, moneda: 'VES', motivo: 'Error de facturación en monto despachado', tienda_id: 6, compania_id: 3, departamento_responsable: 'Cuentas por Pagar', estado: 'rechazada', fecha_creacion: '2026-06-26 00:00:00' },
      { id: 23, monto: 2962.13, moneda: 'USD', motivo: 'Devolución de producto por vencimiento', tienda_id: 2, compania_id: 2, departamento_responsable: 'Cuentas por Cobrar', estado: 'pendiente', fecha_creacion: '2026-05-30 00:00:00' },
      { id: 24, monto: 4531.83, moneda: 'USD', motivo: 'Producto recibido en mal estado', tienda_id: 1, compania_id: 6, departamento_responsable: 'Cuentas por Cobrar', estado: 'pendiente', fecha_creacion: '2026-06-12 00:00:00' },
      { id: 25, monto: 704.94, moneda: 'VES', motivo: 'Producto recibido en mal estado', tienda_id: 3, compania_id: 6, departamento_responsable: 'Cuentas por Pagar', estado: 'pendiente', fecha_creacion: '2026-07-13 00:00:00' },
    ]

    const tasaBcvSeeder = 893.22

    for (const nota of rawNotas) {
      let score = 0
      let justificaciones: string[] = []
      let tasaCambioBcv: number | null = null
      let montoUsdEquivalente = Number(nota.monto)

      if (nota.moneda === 'VES') {
        tasaCambioBcv = tasaBcvSeeder
        montoUsdEquivalente = Math.round((Number(nota.monto) / tasaBcvSeeder) * 100) / 100
        justificaciones.push(
          `Conversión BCV Oficial: Bs. ${Number(nota.monto).toLocaleString('es-VE', { minimumFractionDigits: 2 })} equivalen a $${montoUsdEquivalente.toFixed(2)} USD (Tasa BCV del día: Bs. ${tasaBcvSeeder.toFixed(2)}/USD)`
        )

        // 1. Umbral Financiero sobre el equivalente real en USD
        if (montoUsdEquivalente > 3000) {
          score += 50
          justificaciones.push('Monto crítico financiero (> $3.000 USD)')
        } else if (montoUsdEquivalente >= 1000) {
          score += 30
          justificaciones.push('Monto moderado ($1.000 - $3.000 USD)')
        } else {
          score += 15
          justificaciones.push('Monto bajo dentro del margen estándar (< $1.000 USD)')
        }
      } else {
        // Algoritmo directo para USD
        if (nota.monto > 3000) {
          score += 50
          justificaciones.push(`Monto crítico financiero ($${Number(nota.monto).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD > umbral $3.000)`)
        } else if (nota.monto >= 1000) {
          score += 30
          justificaciones.push(`Monto moderado ($${Number(nota.monto).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD)`)
        } else {
          score += 15
          justificaciones.push(`Monto bajo dentro del margen estándar (< $1.000 USD)`)
        }
      }

      // 2. Ponderación por Motivo
      if (nota.motivo.includes('mal estado') || nota.motivo.includes('vencimiento')) {
        score += 35
        justificaciones.push('Afectación física de inventario (merma / avería)')
      } else if (nota.motivo.includes('Diferencia') || nota.motivo.includes('Error')) {
        score += 20
        justificaciones.push('Descuadre administrativo / documental')
      } else {
        score += 10
        justificaciones.push('Ajuste comercial ordinario')
      }

      // 3. Ponderación por Recurrencia
      if (nota.compania_id === 4 || nota.compania_id === 6) {
        score += 15
        justificaciones.push('Proveedor con alto volumen de reclamos históricos')
      }

      score = Math.min(score, 100)
      const level = score >= 70 ? 'ALTO' : score >= 40 ? 'MEDIO' : 'BAJO'

      const deptoId = nota.departamento_responsable === 'Cuentas por Pagar' ? 4 : 5
      // Creador ficticio: Andrés Silva (ID 2 en CxP) o Daniela Salazar (ID 10 en CxC)
      const creadorId = deptoId === 4 ? 2 : 10

      await db.table('notas_credito').insert({
        id: nota.id,
        monto: nota.monto,
        moneda: nota.moneda,
        motivo: nota.motivo,
        tienda_id: nota.tienda_id,
        compania_id: nota.compania_id,
        departamento_responsable: nota.departamento_responsable,
        departamento_id: deptoId,
        creado_por_id: creadorId,
        estado: nota.estado,
        risk_score: score,
        risk_level: level,
        risk_justification: justificaciones.join(' • '),
        tasa_cambio_bcv: tasaCambioBcv,
        monto_usd_equivalente: montoUsdEquivalente,
        fecha_creacion: nota.fecha_creacion,
      })
    }

    // =========================================================================
    // 7. AUDITORÍA DE NOTAS DE CRÉDITO (38 Registros Oficiales con Usuario)
    // =========================================================================
    const rawAuditorias = [
      { id: 1, nota_credito_id: 1, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-05-18 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 2, nota_credito_id: 1, accion: 'resolucion', estado_anterior: 'pendiente', estado_nuevo: 'aprobada', fecha: '2026-05-22 00:00:00', comentario: 'Aprobada tras validación de soporte de despacho' },
      { id: 3, nota_credito_id: 2, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-07-04 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 4, nota_credito_id: 3, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-05-01 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 5, nota_credito_id: 4, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-05-14 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 6, nota_credito_id: 5, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-06-28 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 7, nota_credito_id: 5, accion: 'resolucion', estado_anterior: 'pendiente', estado_nuevo: 'aprobada', fecha: '2026-07-02 00:00:00', comentario: 'Aprobada tras validación de soporte de despacho' },
      { id: 8, nota_credito_id: 6, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-06-16 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 9, nota_credito_id: 6, accion: 'resolucion', estado_anterior: 'pendiente', estado_nuevo: 'rechazada', fecha: '2026-06-18 00:00:00', comentario: 'Rechazada: soporte de despacho insuficiente' },
      { id: 10, nota_credito_id: 7, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-05-30 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 11, nota_credito_id: 7, accion: 'resolucion', estado_anterior: 'pendiente', estado_nuevo: 'aprobada', fecha: '2026-05-31 00:00:00', comentario: 'Aprobada tras validación de soporte de despacho' },
      { id: 12, nota_credito_id: 8, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-07-25 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 13, nota_credito_id: 9, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-06-29 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 14, nota_credito_id: 9, accion: 'resolucion', estado_anterior: 'pendiente', estado_nuevo: 'aprobada', fecha: '2026-06-30 00:00:00', comentario: 'Aprobada tras validación de soporte de despacho' },
      { id: 15, nota_credito_id: 10, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-05-08 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 16, nota_credito_id: 10, accion: 'resolucion', estado_anterior: 'pendiente', estado_nuevo: 'aprobada', fecha: '2026-05-12 00:00:00', comentario: 'Aprobada tras validación de soporte de despacho' },
      { id: 17, nota_credito_id: 11, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-07-12 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 18, nota_credito_id: 12, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-05-19 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 19, nota_credito_id: 12, accion: 'resolucion', estado_anterior: 'pendiente', estado_nuevo: 'rechazada', fecha: '2026-05-22 00:00:00', comentario: 'Rechazada: soporte de despacho insuficiente' },
      { id: 20, nota_credito_id: 13, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-07-14 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 21, nota_credito_id: 13, accion: 'resolucion', estado_anterior: 'pendiente', estado_nuevo: 'aprobada', fecha: '2026-07-18 00:00:00', comentario: 'Aprobada tras validación de soporte de despacho' },
      { id: 22, nota_credito_id: 14, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-05-15 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 23, nota_credito_id: 15, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-06-29 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 24, nota_credito_id: 15, accion: 'resolucion', estado_anterior: 'pendiente', estado_nuevo: 'aprobada', fecha: '2026-07-03 00:00:00', comentario: 'Aprobada tras validación de soporte de despacho' },
      { id: 25, nota_credito_id: 16, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-06-04 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 26, nota_credito_id: 16, accion: 'resolucion', estado_anterior: 'pendiente', estado_nuevo: 'aprobada', fecha: '2026-06-08 00:00:00', comentario: 'Aprobada tras validación de soporte de despacho' },
      { id: 27, nota_credito_id: 17, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-06-03 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 28, nota_credito_id: 17, accion: 'resolucion', estado_anterior: 'pendiente', estado_nuevo: 'aprobada', fecha: '2026-06-04 00:00:00', comentario: 'Aprobada tras validación de soporte de despacho' },
      { id: 29, nota_credito_id: 18, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-07-09 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 30, nota_credito_id: 19, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-06-09 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 31, nota_credito_id: 19, accion: 'resolucion', estado_anterior: 'pendiente', estado_nuevo: 'rechazada', fecha: '2026-06-10 00:00:00', comentario: 'Rechazada: soporte de despacho insuficiente' },
      { id: 32, nota_credito_id: 20, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-05-09 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 33, nota_credito_id: 21, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-06-24 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 34, nota_credito_id: 22, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-06-26 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 35, nota_credito_id: 22, accion: 'resolucion', estado_anterior: 'pendiente', estado_nuevo: 'rechazada', fecha: '2026-06-27 00:00:00', comentario: 'Rechazada: soporte de despacho insuficiente' },
      { id: 36, nota_credito_id: 23, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-05-30 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 37, nota_credito_id: 24, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-06-12 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
      { id: 38, nota_credito_id: 25, accion: 'creacion', estado_anterior: null, estado_nuevo: 'pendiente', fecha: '2026-07-13 00:00:00', comentario: 'Nota de crédito generada por despacho a tienda' },
    ]

    for (const aud of rawAuditorias) {
      // Si es creación: Colaborador (Andrés Silva ID 2 o Daniela Salazar ID 10)
      // Si es resolución: Jefe (Mariana Gómez ID 1 en CxP o Ricardo Benítez ID 9 en CxC)
      const nota = rawNotas.find((n) => n.id === aud.nota_credito_id)
      const esCxP = nota?.departamento_responsable === 'Cuentas por Pagar'
      const userId = aud.accion === 'creacion' ? (esCxP ? 2 : 10) : (esCxP ? 1 : 9)

      await db.table('notas_credito_auditoria').insert({
        id: aud.id,
        nota_credito_id: aud.nota_credito_id,
        user_id: userId,
        accion: aud.accion,
        estado_anterior: aud.estado_anterior,
        estado_nuevo: aud.estado_nuevo,
        comentario: aud.comentario,
        fecha: aud.fecha,
      })
    }

    // Resetear las secuencias de las tablas para que los futuros INSERT no colisionen con los IDs insertados manualmente
    await db.rawQuery("SELECT setval('departamentos_id_seq', (SELECT MAX(id) FROM departamentos));")
    await db.rawQuery("SELECT setval('cargos_id_seq', (SELECT MAX(id) FROM cargos));")
    await db.rawQuery("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));")
    await db.rawQuery("SELECT setval('notas_credito_id_seq', (SELECT MAX(id) FROM notas_credito));")
    await db.rawQuery("SELECT setval('notas_credito_auditoria_id_seq', (SELECT MAX(id) FROM notas_credito_auditoria));")

    console.log('✅ Base de datos poblada exitosamente con todos los requerimientos de Farmatodo.')
  }
}
