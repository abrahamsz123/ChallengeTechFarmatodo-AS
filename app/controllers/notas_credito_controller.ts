import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import NotaCredito from '#models/nota_credito'
import NotaCreditoAuditoria from '#models/nota_credito_auditoria'
import Tienda from '#models/tienda'
import Compania from '#models/compania'
import Departamento from '#models/departamento'

/**
 * Función Heurística del Motor de Scoring de Control Interno
 */
export function calculateRiskScore(monto: number, moneda: string, motivo: string, companiaId: number) {
  let score = 0
  const justificaciones: string[] = []

  // 1. Normalización y evaluación de Monto
  const montoUSD = moneda === 'VES' ? monto / 45 : monto // Conversión referencial a USD para ponderar

  if (montoUSD > 3000) {
    score += 50
    justificaciones.push(`Monto crítico (${monto.toLocaleString()} ${moneda} > umbral superior de farmacia)`)
  } else if (montoUSD > 1000) {
    score += 30
    justificaciones.push(`Monto moderado (${monto.toLocaleString()} ${moneda})`)
  } else {
    score += 15
    justificaciones.push(`Monto bajo dentro del margen estándar`)
  }

  // 2. Evaluación del Motivo de Reclamación
  const motivoLower = motivo.toLowerCase()
  if (motivoLower.includes('mal estado') || motivoLower.includes('vencimiento') || motivoLower.includes('avería') || motivoLower.includes('roto')) {
    score += 35
    justificaciones.push('Afectación física de inventario (merma / avería de producto en despacho)')
  } else if (motivoLower.includes('diferencia') || motivoLower.includes('error') || motivoLower.includes('duplicidad')) {
    score += 20
    justificaciones.push('Inconsistencia administrativa / descuadre documental de factura')
  } else {
    score += 10
    justificaciones.push('Ajuste comercial ordinario por volumen o pronto pago')
  }

  // 3. Frecuencia de Reclamaciones del Proveedor
  if (companiaId === 4 || companiaId === 6) {
    score += 15
    justificaciones.push('Proveedor con historial de alta recurrencia de reclamos')
  }

  score = Math.min(score, 100)
  const level: 'BAJO' | 'MEDIO' | 'ALTO' = score >= 70 ? 'ALTO' : score >= 40 ? 'MEDIO' : 'BAJO'

  return {
    score,
    level,
    justification: justificaciones.join(' • '),
  }
}

export default class NotasCreditoController {
  /**
   * Listado principal del proceso de Notas de Crédito & KPIs
   */
  public async index({ inertia, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const estado = request.input('estado')
    const moneda = request.input('moneda')
    const riskLevel = request.input('risk_level')
    const search = request.input('search')

    // Consulta base con relaciones
    const query = NotaCredito.query()
      .preload('tienda')
      .preload('compania')
      .preload('departamento')
      .preload('creador', (q) => q.preload('cargo'))
      .preload('auditorias', (q) => {
        q.preload('usuario')
        q.orderBy('fecha', 'asc')
      })

    // -------------------------------------------------------------------------
    // Control de Alcance Departamental (RBAC en Backend)
    // -------------------------------------------------------------------------
    // Si el usuario es Jefe de Dpto y pertenece a CxP (4) o CxC (5), limitamos sus notas
    if (user.rol === 'jefe' && (user.departamentoId === 4 || user.departamentoId === 5)) {
      query.where('departamentoId', user.departamentoId)
    }

    // Filtros dinámicos
    if (estado && estado !== 'todos') {
      query.where('estado', estado)
    }
    if (moneda && moneda !== 'todas') {
      query.where('moneda', moneda)
    }
    if (riskLevel && riskLevel !== 'todos') {
      query.where('riskLevel', riskLevel)
    }
    if (search) {
      query.where((q) => {
        q.whereILike('motivo', `%${search}%`)
          .orWhereRaw('CAST(id AS TEXT) ILIKE ?', [`%${search}%`])
      })
    }

    const notas = await query.orderBy('id', 'desc')

    // -------------------------------------------------------------------------
    // Cálculo de KPIs Ejecutivos para el Dashboard Financiero
    // -------------------------------------------------------------------------
    const todasLasNotas = await NotaCredito.all()

    let totalUSD = 0
    let totalVES = 0
    let pendientes = 0
    let aprobadas = 0
    let rechazadas = 0
    let riesgoAlto = 0

    for (const n of todasLasNotas) {
      if (n.moneda === 'USD') totalUSD += Number(n.monto)
      if (n.moneda === 'VES') totalVES += Number(n.monto)
      if (n.estado === 'pendiente') pendientes++
      if (n.estado === 'aprobada') aprobadas++
      if (n.estado === 'rechazada') rechazadas++
      if (n.riskLevel === 'ALTO') riesgoAlto++
    }

    const resueltas = aprobadas + rechazadas
    const tasaAprobacion = resueltas > 0 ? Math.round((aprobadas / resueltas) * 100) : 0

    const kpis = {
      totalNotas: todasLasNotas.length,
      pendientes,
      aprobadas,
      rechazadas,
      tasaAprobacion,
      montoTotalUSD: totalUSD,
      montoTotalVES: totalVES,
      riesgoAltoCount: riesgoAlto,
    }

    // Datos auxiliares para los modales
    const tiendas = await Tienda.query().orderBy('nombre', 'asc')
    const companias = await Compania.query().orderBy('nombre', 'asc')
    const departamentos = await Departamento.query()
      .whereIn('codigo', ['CXP', 'CXC'])
      .orderBy('nombre', 'asc')

    const wantsJson = request.url().startsWith('/api') || request.header('accept')?.includes('json')
    if (wantsJson) {
      return response.ok({
        kpis,
        notas,
        tiendas,
        companias,
      })
    }

    return inertia.render('NotasCreditoPage', {
      kpis,
      notas,
      tiendas,
      companias,
      departamentos,
      filtros: { estado, moneda, riskLevel, search },
    })
  }

  /**
   * Registro de una nueva Solicitud de Nota de Crédito
   */
  public async store({ request, auth, response, session }: HttpContext) {
    const user = auth.use('web').user!
    const data = request.only([
      'monto',
      'moneda',
      'motivo',
      'tienda_id',
      'compania_id',
      'departamento_responsable',
    ])

    const montoNum = Number(data.monto)
    if (isNaN(montoNum) || montoNum <= 0) {
      session.flash('error', 'El monto debe ser una cifra numérica positiva.')
      return response.redirect().back()
    }

    // Determinar ID del departamento responsable (Cuentas por Pagar = 4, Cuentas por Cobrar = 5)
    let deptoId = 4
    if (data.departamento_responsable === 'Cuentas por Cobrar') {
      deptoId = 5
    }

    // Cálculo automático del Risk Score mediante el motor de control interno
    const { score, level, justification } = calculateRiskScore(
      montoNum,
      data.moneda,
      data.motivo,
      Number(data.compania_id)
    )

    // Crear la nota de crédito
    const nota = await NotaCredito.create({
      monto: montoNum,
      moneda: data.moneda,
      motivo: data.motivo,
      tiendaId: Number(data.tienda_id),
      companiaId: Number(data.compania_id),
      departamentoResponsable: data.departamento_responsable,
      departamentoId: deptoId,
      creadoPorId: user.id, // VITAL: Registra quién solicita para Segregación de Funciones
      estado: 'pendiente',
      riskScore: score,
      riskLevel: level,
      riskJustification: justification,
      fechaCreacion: DateTime.now(),
    })

    // Registrar en la tabla de auditoría inmutable
    await NotaCreditoAuditoria.create({
      notaCreditoId: nota.id,
      userId: user.id,
      accion: 'creacion',
      estadoAnterior: null,
      estadoNuevo: 'pendiente',
      comentario: `Solicitud registrada por ${user.nombreCompleto} (${user.rol.toUpperCase()}). Evaluación de Riesgo: ${level} (${score}/100)`,
      fecha: DateTime.now(),
    })

    const msg = `Nota de crédito #${nota.id} registrada con éxito. Nivel de Riesgo asignado: ${level} (${score}/100).`

    const wantsJson = request.url().startsWith('/api') || request.header('accept')?.includes('json')
    if (wantsJson) {
      return response.created({ message: msg, nota })
    }

    session.flash('success', msg)
    return response.redirect().toPath('/dashboard/notas-credito')
  }

  /**
   * Detalle individual y trazabilidad de una nota de crédito
   */
  public async show({ params, response }: HttpContext) {
    const nota = await NotaCredito.query()
      .where('id', params.id)
      .preload('tienda')
      .preload('compania')
      .preload('departamento')
      .preload('creador', (q) => q.preload('cargo'))
      .preload('auditorias', (q) => {
        q.preload('usuario', (qu) => qu.preload('cargo'))
        q.orderBy('fecha', 'asc')
      })
      .firstOrFail()

    return response.ok({
      nota,
    })
  }

  /**
   * Flujo de Aprobación / Rechazo con Segregación de Funciones (SoD) y Auditoría
   */
  public async resolver({ params, request, auth, response, session }: HttpContext) {
    const user = auth.use('web').user!
    const nota = await NotaCredito.findOrFail(params.id)

    // =========================================================================
    // VALIDACIÓN CRÍTICA 1: Segregación de Funciones (SoD)
    // El solicitante NO puede autoaprobarse su propia solicitud
    // =========================================================================
    if (nota.creadoPorId && nota.creadoPorId === user.id) {
      const msg = '⛔ Violación de Segregación de Funciones (SoD): El colaborador solicitante no tiene autorización para aprobar su propia solicitud.'
      const wantsJson = request.url().startsWith('/api') || request.header('accept')?.includes('json')
    if (wantsJson) {
        return response.forbidden({ error: 'SOD_VIOLATION', message: msg })
      }
      session.flash('error', msg)
      return response.redirect().back()
    }

    // =========================================================================
    // VALIDACIÓN CRÍTICA 2: Roles con facultad de aprobación
    // Un colaborador común no puede autorizar
    // =========================================================================
    if (user.rol === 'colaborador') {
      const msg = '⛔ Acceso denegado: Los colaboradores no poseen facultades jerárquicas para autorizar desembolsos o notas de crédito.'
      const wantsJson = request.url().startsWith('/api') || request.header('accept')?.includes('json')
    if (wantsJson) {
        return response.forbidden({ error: 'FORBIDDEN_ROLE', message: msg })
      }
      session.flash('error', msg)
      return response.redirect().back()
    }

    // =========================================================================
    // VALIDACIÓN CRÍTICA 3: Alcance Departamental
    // Si es Jefe, debe ser el Jefe del departamento responsable
    // =========================================================================
    if (user.rol === 'jefe' && nota.departamentoId && user.departamentoId !== nota.departamentoId) {
      const msg = '⛔ Acceso denegado: Esta nota de crédito pertenece a otro departamento de la VP de Finanzas.'
      const wantsJson = request.url().startsWith('/api') || request.header('accept')?.includes('json')
    if (wantsJson) {
        return response.forbidden({ error: 'DEPARTMENT_MISMATCH', message: msg })
      }
      session.flash('error', msg)
      return response.redirect().back()
    }

    // =========================================================================
    // VALIDACIÓN CRÍTICA 4: Estado previo
    // =========================================================================
    if (nota.estado !== 'pendiente') {
      const msg = `La nota de crédito #${nota.id} ya se encuentra resuelta con estado [${nota.estado.toUpperCase()}].`
      const wantsJson = request.url().startsWith('/api') || request.header('accept')?.includes('json')
    if (wantsJson) {
        return response.badRequest({ message: msg })
      }
      session.flash('error', msg)
      return response.redirect().back()
    }

    const { accion, comentario } = request.only(['accion', 'comentario'])

    if (!['aprobada', 'rechazada'].includes(accion)) {
      session.flash('error', 'Acción no válida. Debe ser "aprobada" o "rechazada".')
      return response.redirect().back()
    }

    const estadoAnterior = nota.estado
    nota.estado = accion
    await nota.save()

    // Registrar en auditoría inmutable
    await NotaCreditoAuditoria.create({
      notaCreditoId: nota.id,
      userId: user.id,
      accion: 'resolucion',
      estadoAnterior: estadoAnterior,
      estadoNuevo: accion,
      comentario: comentario || (accion === 'aprobada' ? 'Aprobada tras revisión de jefatura' : 'Rechazada por control interno'),
      fecha: DateTime.now(),
    })

    const successMsg = `Nota de Crédito #${nota.id} ha sido ${accion.toUpperCase()} exitosamente por ${user.nombreCompleto}.`

    const wantsJson = request.url().startsWith('/api') || request.header('accept')?.includes('json')
    if (wantsJson) {
      return response.ok({ message: successMsg, nota })
    }

    session.flash('success', successMsg)
    return response.redirect().back()
  }

  /**
   * Endpoint de API REST para métricas y KPIs
   */
  public async kpisApi({ response }: HttpContext) {
    const notas = await NotaCredito.all()

    let totalUSD = 0
    let totalVES = 0
    let pendientes = 0
    let aprobadas = 0
    let rechazadas = 0
    let riesgoAlto = 0

    for (const n of notas) {
      if (n.moneda === 'USD') totalUSD += Number(n.monto)
      if (n.moneda === 'VES') totalVES += Number(n.monto)
      if (n.estado === 'pendiente') pendientes++
      if (n.estado === 'aprobada') aprobadas++
      if (n.estado === 'rechazada') rechazadas++
      if (n.riskLevel === 'ALTO') riesgoAlto++
    }

    return response.ok({
      total: notas.length,
      pendientes,
      aprobadas,
      rechazadas,
      montoTotalUSD: totalUSD,
      montoTotalVES: totalVES,
      riesgoAltoCount: riesgoAlto,
    })
  }
}
