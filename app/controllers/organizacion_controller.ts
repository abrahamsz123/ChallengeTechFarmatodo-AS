import type { HttpContext } from '@adonisjs/core/http'
import Departamento from '#models/departamento'
import Cargo from '#models/cargo'
import User from '#models/user'

export default class OrganizacionController {
  /**
   * Vista de la Estructura Organizacional de la VP de Finanzas (Módulo Dummy 1)
   * Aplica Control de Acceso por Rol y Alcance de Departamento en Backend (Requisito 3.2)
   */
  public async index({ inertia, request, response, auth }: HttpContext) {
    const user = auth.use('web').user!

    const deptoQuery = Departamento.query()
      .preload('cargos')
      .preload('colaboradores', (q) => {
        q.preload('cargo')
        q.orderBy('nombreCompleto', 'asc')
      })
      .orderBy('id', 'asc')

    const colabQuery = User.query()
      .preload('departamento')
      .preload('cargo')
      .orderBy('nombreCompleto', 'asc')

    // =========================================================================
    // Control de Acceso por Alcance (Scope) de Rol y Departamento en Backend
    // • Administrador: acceso a todos los departamentos y colaboradores.
    // • Jefe de Departamento / Colaborador: acceso únicamente a su propio departamento.
    // =========================================================================
    if (user.rol !== 'admin') {
      deptoQuery.where('id', user.departamentoId)
      colabQuery.where('departamentoId', user.departamentoId)
    }

    const departamentos = await deptoQuery
    const colaboradores = await colabQuery

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
   * Aplica Control de Acceso por Rol y Alcance de Departamento en Backend (Requisito 3.2)
   */
  public async cargos({ inertia, request, response, auth }: HttpContext) {
    const user = auth.use('web').user!

    const cargosQuery = Cargo.query()
      .preload('departamento')
      .preload('colaboradores', (q) => {
        q.preload('departamento')
        q.orderBy('nombreCompleto', 'asc')
      })
      .orderBy('departamentoId', 'asc')

    const deptosQuery = Departamento.query().orderBy('id', 'asc')

    // =========================================================================
    // Control de Acceso por Alcance (Scope) de Rol y Departamento en Backend
    // • Administrador: acceso a todos los cargos de la organización.
    // • Jefe de Departamento / Colaborador: acceso únicamente a cargos de su propio departamento.
    // =========================================================================
    if (user.rol !== 'admin') {
      cargosQuery.where('departamentoId', user.departamentoId)
      deptosQuery.where('id', user.departamentoId)
    }

    const cargos = await cargosQuery
    const departamentos = await deptosQuery

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
   * Endpoint de API para consultar colaboradores con filtros y alcance RBAC
   */
  public async colaboradoresApi({ request, response, auth }: HttpContext) {
    const user = auth.use('web').user!
    const deptoId = request.input('departamento_id')
    const queryText = request.input('q')

    const query = User.query()
      .preload('departamento')
      .preload('cargo')

    // Control de alcance en backend: si no es admin, no puede consultar otros departamentos
    if (user.rol !== 'admin') {
      query.where('departamentoId', user.departamentoId)
    } else if (deptoId) {
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
