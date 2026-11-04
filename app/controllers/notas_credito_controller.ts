import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import https from 'node:https'
import axios from 'axios'
import * as cheerio from 'cheerio'
import NotaCredito from '#models/nota_credito'
import NotaCreditoAuditoria from '#models/nota_credito_auditoria'
import Tienda from '#models/tienda'
import Compania from '#models/compania'
import Departamento from '#models/departamento'

/**
 * Web Scraping en vivo del Banco Central de Venezuela (BCV)
 * Idéntico a la implementación oficial de EIR Plus.
 * Extrae la tasa del dólar oficial (#dolar strong) y aplica redondeo matemático estricto a 2 decimales.
 */
export async function getBcvExchangeRate(): Promise<number> {
  try {
    const httpsAgent = new https.Agent({ rejectUnauthorized: false })
    const { data } = await axios.get('https://www.bcv.org.ve/', {
      timeout: 10000,
      httpsAgent,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
      },
    })
    const $ = cheerio.load(data)
    const usdText = $('#dolar strong').text().trim().replace(',', '.')
    const usdRaw = parseFloat(usdText) || 0

    if (usdRaw > 0) {
      // Redondeo matemático estricto a 2 decimales (si el 3er decimal >= 5, aumenta el 2do)
      return Math.round(usdRaw * 100) / 100
    }
  } catch (error: any) {
    console.error('Error al consultar BCV oficial en vivo:', error.message)
  }

  // Tasa de contingencia operativa si la web del BCV no responde
  return 893.22
}

/**
 * 1. Algoritmo de Evaluación de Riesgo para Dólares (USD)
 */
export function evaluateUsdRisk(monto: number, motivo: string, companiaId: number) {
  let score = 0
  const justificaciones: string[] = []

  // 1. Umbrales de Monto en USD
  if (monto > 3000) {
    score += 50
    justificaciones.push(`Monto crítico financiero ($${monto.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD > umbral $3.000)`)
  } else if (monto >= 1000) {
    score += 30
    justificaciones.push(`Monto moderado ($${monto.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD)`)
  } else {
    score += 15
    justificaciones.push(`Monto bajo dentro del margen estándar ($${monto.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD < $1.000)`)
  }

  // 2. Evaluación del Motivo de Reclamación (Diccionario ampliado de retail/farmacia)
  const motivoLower = motivo.toLowerCase()
  const isAfectacionFisica = [
    'mal estado', 'vencimiento', 'vencid', 'avería', 'averia', 'roto', 'rota',
    'merma', 'dañado', 'dañada', 'daño', 'caducad', 'expirad', 'falta', 'faltante',
    'incomplet', 'no llegó', 'no llego', 'faltaron', 'deterioro', 'rotura', 'perdida', 'pérdida'
  ].some(k => motivoLower.includes(k))

  const isInconsistenciaDoc = [
    'diferencia', 'error', 'duplicidad', 'duplicad', 'precio', 'factura', 'facturación',
    'facturacion', 'descuadre', 'cobro', 'descuento', 'orden de compra'
  ].some(k => motivoLower.includes(k))

  if (isAfectacionFisica) {
    score += 35
    justificaciones.push('Afectación física de inventario (merma / avería / faltante en despacho)')
  } else if (isInconsistenciaDoc) {
    score += 20
    justificaciones.push('Inconsistencia administrativa / descuadre documental de factura')
  } else {
    score += 10
    justificaciones.push('Ajuste comercial ordinario por volumen o pronto pago')
  }

  // 3. Proveedor con histórico crítico
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
    tasaCambioBcv: null,
    montoUsdEquivalente: monto,
  }
}

/**
 * 2. Algoritmo de Evaluación de Riesgo para Bolívares (VES)
 * Convierte automáticamente a Dólares con la tasa oficial BCV del día
 * y evalúa el riesgo financiero sobre el valor real equivalente.
 */
export async function evaluateVesRisk(montoVes: number, motivo: string, companiaId: number, tasaManual?: number) {
  const tasaBcv = tasaManual && tasaManual > 0 ? tasaManual : await getBcvExchangeRate()
  const montoUsdEquivalente = Math.round((montoVes / tasaBcv) * 100) / 100

  let score = 0
  const justificaciones: string[] = []

  // Indicador explícito de conversión cambiaria oficial BCV
  justificaciones.push(
    `Conversión BCV Oficial: Bs. ${montoVes.toLocaleString('es-VE', { minimumFractionDigits: 2 })} equivalen a $${montoUsdEquivalente.toFixed(2)} USD (Tasa BCV del día: Bs. ${tasaBcv.toFixed(2)}/USD)`
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

  // 2. Evaluación del Motivo de Reclamación (Diccionario ampliado de retail/farmacia)
  const motivoLower = motivo.toLowerCase()
  const isAfectacionFisica = [
    'mal estado', 'vencimiento', 'vencid', 'avería', 'averia', 'roto', 'rota',
    'merma', 'dañado', 'dañada', 'daño', 'caducad', 'expirad', 'falta', 'faltante',
    'incomplet', 'no llegó', 'no llego', 'faltaron', 'deterioro', 'rotura', 'perdida', 'pérdida'
  ].some(k => motivoLower.includes(k))

  const isInconsistenciaDoc = [
    'diferencia', 'error', 'duplicidad', 'duplicad', 'precio', 'factura', 'facturación',
    'facturacion', 'descuadre', 'cobro', 'descuento', 'orden de compra'
  ].some(k => motivoLower.includes(k))

  if (isAfectacionFisica) {
    score += 35
    justificaciones.push('Afectación física de inventario (merma / avería / faltante en despacho)')
  } else if (isInconsistenciaDoc) {
    score += 20
    justificaciones.push('Inconsistencia administrativa / descuadre documental de factura')
  } else {
    score += 10
    justificaciones.push('Ajuste comercial ordinario por volumen o pronto pago')
  }

  // 3. Proveedor con histórico crítico
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
    tasaCambioBcv: tasaBcv,
    montoUsdEquivalente,
  }
}

/**
 * Función puente compatible con llamadas existentes
 */
export async function calculateRiskScore(monto: number, moneda: string, motivo: string, companiaId: number) {
  if (moneda === 'VES') {
    return evaluateVesRisk(monto, motivo, companiaId)
  }
  return evaluateUsdRisk(monto, motivo, companiaId)
}

export default class NotasCreditoController {
  /**
   * Listado principal del proceso de Notas de Crédito & KPIs
   */
  public async index({ inertia, request, response }: HttpContext) {
    const estado = request.input('estado')
    const moneda = request.input('moneda')
    const riskLevel = request.input('risk_level')
    const search = request.input('search')

    // Consulta base con relaciones
    const query = NotaCredito.query()
      .preload('tienda')
      .preload('compania')
      .preload('departamento')
      .preload('creador', (q) => q.preload('cargo').preload('departamento'))
      .preload('primerAprobador', (q) => q.preload('cargo'))
      .preload('segundoAprobador', (q) => q.preload('cargo'))
      .preload('auditorias', (q) => {
        q.preload('usuario', (qu) => qu.preload('cargo'))
        q.orderBy('fecha', 'asc')
      })

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
      if (n.estado === 'pendiente' || n.estado === 'aprobada_parcial') pendientes++
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

    // Tasa de cambio oficial del BCV del día
    const tasaBcv = await getBcvExchangeRate()

    const wantsJson = request.url().startsWith('/api') || request.header('accept')?.includes('json')
    if (wantsJson) {
      return response.ok({
        kpis,
        notas,
        tiendas,
        companias,
        tasaBcv,
      })
    }

    return inertia.render('NotasCreditoPage', {
      kpis,
      notas,
      tiendas,
      companias,
      departamentos,
      tasaBcv,
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

    if (!data.tienda_id || !data.compania_id || !data.departamento_responsable) {
      session.flash('error', 'Debe seleccionar una tienda, un proveedor y un departamento responsable.')
      return response.redirect().back()
    }

    // Determinar ID del departamento responsable (Cuentas por Pagar = 4, Cuentas por Cobrar = 5)
    let deptoId = 4
    if (data.departamento_responsable === 'Cuentas por Cobrar') {
      deptoId = 5
    }

    // Evaluación diferenciada según moneda (Web scraping BCV para VES, o evaluación directa para USD)
    let evaluacion: {
      score: number
      level: 'BAJO' | 'MEDIO' | 'ALTO'
      justification: string
      tasaCambioBcv: number | null
      montoUsdEquivalente: number | null
    }

    if (data.moneda === 'VES') {
      evaluacion = await evaluateVesRisk(montoNum, data.motivo, Number(data.compania_id))
    } else {
      evaluacion = evaluateUsdRisk(montoNum, data.motivo, Number(data.compania_id))
    }

    const requiresDual = evaluacion.level === 'ALTO' || user.rol === 'jefe' || user.rol === 'admin'

    // Crear la nota de crédito con la tasa del día guardada en BDD y regla DOA
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
      requiereDobleAprobacion: requiresDual,
      riskScore: evaluacion.score,
      riskLevel: evaluacion.level,
      riskJustification: evaluacion.justification,
      tasaCambioBcv: evaluacion.tasaCambioBcv,
      montoUsdEquivalente: evaluacion.montoUsdEquivalente,
      fechaCreacion: DateTime.now(),
    })

    // Registrar en la tabla de auditoría inmutable con constancia de la tasa aplicada
    const comentarioAuditoria = data.moneda === 'VES'
      ? `Solicitud registrada por ${user.nombreCompleto} (${user.rol.toUpperCase()}). Monto: Bs. ${montoNum.toLocaleString('es-VE', { minimumFractionDigits: 2 })} (Tasa BCV Oficial: Bs. ${evaluacion.tasaCambioBcv?.toFixed(2)}/USD · Equivalente: $${evaluacion.montoUsdEquivalente?.toFixed(2)} USD). Evaluación de Riesgo: ${evaluacion.level} (${evaluacion.score}/100)`
      : `Solicitud registrada por ${user.nombreCompleto} (${user.rol.toUpperCase()}). Evaluación de Riesgo: ${evaluacion.level} (${evaluacion.score}/100)`

    await NotaCreditoAuditoria.create({
      notaCreditoId: nota.id,
      userId: user.id,
      accion: 'creacion',
      estadoAnterior: null,
      estadoNuevo: 'pendiente',
      comentario: comentarioAuditoria,
      fecha: DateTime.now(),
    })

    const msg = data.moneda === 'VES'
      ? `Nota de crédito #${nota.id} registrada con éxito. Tasa oficial BCV aplicada: Bs. ${evaluacion.tasaCambioBcv?.toFixed(2)}/USD. Nivel de Riesgo asignado: ${evaluacion.level} (${evaluacion.score}/100).`
      : `Nota de crédito #${nota.id} registrada con éxito. Nivel de Riesgo asignado: ${evaluacion.level} (${evaluacion.score}/100).`

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
      .preload('creador', (q) => q.preload('cargo').preload('departamento'))
      .preload('primerAprobador', (q) => q.preload('cargo'))
      .preload('segundoAprobador', (q) => q.preload('cargo'))
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
   * Flujo de Aprobación / Rechazo con Matriz DOA, Doble Control y Segregación de Funciones (SoD)
   */
  public async resolver({ params, request, auth, response, session }: HttpContext) {
    const user = auth.use('web').user!
    await user.load('cargo')
    await user.load('departamento')

    const nota = await NotaCredito.query()
      .where('id', params.id)
      .preload('creador', (q) => q.preload('cargo').preload('departamento'))
      .preload('primerAprobador', (q) => q.preload('cargo'))
      .preload('segundoAprobador', (q) => q.preload('cargo'))
      .firstOrFail()

    // =========================================================================
    // VALIDACIÓN CRÍTICA 1: Segregación de Funciones (SoD)
    // El solicitante NO puede autoaprobarse su propia solicitud (aplica a todos los roles)
    // =========================================================================
    if (nota.creadoPorId && nota.creadoPorId === user.id) {
      const msg = '⛔ Violación de Segregación de Funciones (SoD): El usuario solicitante no tiene autorización para dictaminar sobre su propia solicitud.'
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
      const msg = '⛔ Acceso denegado: Los colaboradores no poseen facultades jerárquicas delegadas (DOA) para autorizar notas de crédito.'
      const wantsJson = request.url().startsWith('/api') || request.header('accept')?.includes('json')
      if (wantsJson) {
        return response.forbidden({ error: 'FORBIDDEN_ROLE', message: msg })
      }
      session.flash('error', msg)
      return response.redirect().back()
    }

    // =========================================================================
    // VALIDACIÓN CRÍTICA 3: Estado previo permitido
    // Solo se puede dictaminar en 'pendiente' o 'aprobada_parcial'
    // =========================================================================
    if (nota.estado !== 'pendiente' && nota.estado !== 'aprobada_parcial') {
      const msg = `La nota de crédito #${nota.id} ya se encuentra resuelta con estado [${nota.estado.toUpperCase()}].`
      const wantsJson = request.url().startsWith('/api') || request.header('accept')?.includes('json')
      if (wantsJson) {
        return response.badRequest({ message: msg })
      }
      session.flash('error', msg)
      return response.redirect().back()
    }

    // =========================================================================
    // VALIDACIÓN CRÍTICA 4: Control Dual (Principio de 4 Ojos)
    // El firmante de la 2da aprobación debe ser independiente al primer aprobador
    // =========================================================================
    if (nota.estado === 'aprobada_parcial' && nota.primerAprobadorId === user.id) {
      const msg = '⛔ Violación de Control Dual (Principio de 4 Ojos): Ya emitiste la primera firma de autorización. La segunda firma mancomunada debe ser ratificada por un superior independiente.'
      const wantsJson = request.url().startsWith('/api') || request.header('accept')?.includes('json')
      if (wantsJson) {
        return response.forbidden({ error: 'DUAL_CONTROL_VIOLATION', message: msg })
      }
      session.flash('error', msg)
      return response.redirect().back()
    }

    const { accion, comentario } = request.only(['accion', 'comentario'])

    if (!['aprobada', 'rechazada'].includes(accion)) {
      session.flash('error', 'Acción no válida. Debe ser "aprobada" o "rechazada".')
      return response.redirect().back()
    }

    // =========================================================================
    // GESTIÓN DE RECHAZO
    // =========================================================================
    if (accion === 'rechazada') {
      const estadoAnterior = nota.estado
      nota.estado = 'rechazada'
      await nota.save()

      await NotaCreditoAuditoria.create({
        notaCreditoId: nota.id,
        userId: user.id,
        accion: 'rechazo',
        estadoAnterior,
        estadoNuevo: 'rechazada',
        comentario: comentario || `Rechazada por ${user.nombreCompleto} (${user.rol.toUpperCase()}) en proceso de control interno.`,
        fecha: DateTime.now(),
      })

      const successMsg = `Nota de Crédito #${nota.id} ha sido RECHAZADA por ${user.nombreCompleto}.`
      const wantsJson = request.url().startsWith('/api') || request.header('accept')?.includes('json')
      if (wantsJson) {
        return response.ok({ message: successMsg, nota })
      }
      session.flash('success', successMsg)
      return response.redirect().back()
    }

    // =========================================================================
    // GESTIÓN DE APROBACIÓN (MÁQUINA DE ESTADOS DOA CON DOBLE FIRMA)
    // =========================================================================
    if (nota.requiereDobleAprobacion) {
      // Flujo de Doble Aprobación Mancomunada
      if (nota.estado === 'pendiente') {
        // Primera Firma (1/2) -> Pasa a estado 'aprobada_parcial'
        nota.estado = 'aprobada_parcial'
        nota.primerAprobadorId = user.id
        nota.fechaPrimeraAprobacion = DateTime.now()
        await nota.save()

        const commentText = comentario || `Primera firma de autorización (1/2) emitida por ${user.nombreCompleto} (${user.rol.toUpperCase()}). En espera de segunda firma mancomunada de ratificación.`

        await NotaCreditoAuditoria.create({
          notaCreditoId: nota.id,
          userId: user.id,
          accion: 'primera_aprobacion',
          estadoAnterior: 'pendiente',
          estadoNuevo: 'aprobada_parcial',
          comentario: commentText,
          fecha: DateTime.now(),
        })

        const successMsg = `✓ Primera firma (1/2) registrada para la Nota #${nota.id} por ${user.nombreCompleto}. Pendiente segunda firma mancomunada.`
        const wantsJson = request.url().startsWith('/api') || request.header('accept')?.includes('json')
        if (wantsJson) {
          return response.ok({ message: successMsg, nota })
        }
        session.flash('success', successMsg)
        return response.redirect().back()
      } else if (nota.estado === 'aprobada_parcial') {
        // Segunda Firma (2/2) -> Pasa a estado 'aprobada' definitivo
        nota.estado = 'aprobada'
        nota.segundoAprobadorId = user.id
        nota.fechaSegundaAprobacion = DateTime.now()
        await nota.save()

        const commentText = comentario || `Segunda firma mancomunada (2/2) ratificada por ${user.nombreCompleto} (${user.rol.toUpperCase()}). Autorización corporativa definitiva completada.`

        await NotaCreditoAuditoria.create({
          notaCreditoId: nota.id,
          userId: user.id,
          accion: 'aprobacion_final',
          estadoAnterior: 'aprobada_parcial',
          estadoNuevo: 'aprobada',
          comentario: commentText,
          fecha: DateTime.now(),
        })

        const successMsg = `✓ Aprobación definitiva completada para la Nota #${nota.id} con doble firma mancomunada (SoD & Control Dual satisfechos).`
        const wantsJson = request.url().startsWith('/api') || request.header('accept')?.includes('json')
        if (wantsJson) {
          return response.ok({ message: successMsg, nota })
        }
        session.flash('success', successMsg)
        return response.redirect().back()
      }
    } else {
      // Flujo de Aprobación Simple (1 sola firma requerida)
      nota.estado = 'aprobada'
      nota.primerAprobadorId = user.id
      nota.fechaPrimeraAprobacion = DateTime.now()
      await nota.save()

      const commentText = comentario || `Aprobada tras revisión de jefatura por ${user.nombreCompleto} (${user.rol.toUpperCase()}).`

      await NotaCreditoAuditoria.create({
        notaCreditoId: nota.id,
        userId: user.id,
        accion: 'aprobacion',
        estadoAnterior: 'pendiente',
        estadoNuevo: 'aprobada',
        comentario: commentText,
        fecha: DateTime.now(),
      })

      const successMsg = `Nota de Crédito #${nota.id} ha sido APROBADA exitosamente por ${user.nombreCompleto}.`
      const wantsJson = request.url().startsWith('/api') || request.header('accept')?.includes('json')
      if (wantsJson) {
        return response.ok({ message: successMsg, nota })
      }
      session.flash('success', successMsg)
      return response.redirect().back()
    }
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
