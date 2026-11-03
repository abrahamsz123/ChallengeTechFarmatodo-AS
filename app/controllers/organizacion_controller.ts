import type { HttpContext } from '@adonisjs/core/http'
import Departamento from '#models/departamento'
import Cargo from '#models/cargo'
import User from '#models/user'

export default class OrganizacionController {
  /**
   * Vista de la Estructura Organizacional de la VP de Finanzas (Módulo Dummy 1)
   */
  public async index({ inertia, request, response }: HttpContext) {
    const departamentos = await Departamento.query()
      .preload('cargos')
      .preload('colaboradores', (q) => {
        q.preload('cargo')
        q.orderBy('nombreCompleto', 'asc')
      })
      .orderBy('id', 'asc')

    const colaboradores = await User.query()
      .preload('departamento')
      .preload('cargo')
      .orderBy('nombreCompleto', 'asc')

    const wantsJson = request.url().startsWith('/api') || request.header('accept')?.includes('json')
    if (wantsJson) {
      return response.ok({
        departamentos,
        colaboradores,
      })
    }

    return inertia.render('OrganizacionPage', {
      departamentos,
      colaboradores,
    })
  }

  /**
   * Vista de Catálogo de Cargos y Funciones (Módulo Dummy 2)
   */
  public async cargos({ inertia, request, response }: HttpContext) {
    const cargos = await Cargo.query()
      .preload('departamento')
      .preload('colaboradores')
      .orderBy('departamentoId', 'asc')

    const departamentos = await Departamento.query().orderBy('id', 'asc')

    const wantsJson = request.url().startsWith('/api') || request.header('accept')?.includes('json')
    if (wantsJson) {
      return response.ok({
        cargos,
        departamentos,
      })
    }

    return inertia.render('CargosPage', {
      cargos,
      departamentos,
    })
  }

  /**
   * Endpoint de API para consultar colaboradores con filtros
   */
  public async colaboradoresApi({ request, response }: HttpContext) {
    const deptoId = request.input('departamento_id')
    const queryText = request.input('q')

    const query = User.query()
      .preload('departamento')
      .preload('cargo')

    if (deptoId) {
      query.where('departamentoId', deptoId)
    }

    if (queryText) {
      query.where((q) => {
        q.whereILike('nombreCompleto', `%${queryText}%`)
          .orWhereILike('email', `%${queryText}%`)
      })
    }

    const colaboradores = await query.orderBy('nombreCompleto', 'asc')

    return response.ok({
      total: colaboradores.length,
      colaboradores,
    })
  }
}
