import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RbacMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      roles?: Array<'admin' | 'jefe' | 'colaborador'>
      allowedDepartments?: number[] // IDs de departamentos permitidos
      action?: 'approve' | 'create' | 'view_all'
    } = {}
  ) {
    const user = ctx.auth.use('web').user

    const wantsJson = ctx.request.url().startsWith('/api') || ctx.request.header('accept')?.includes('json')

    if (!user) {
      if (wantsJson) {
        return ctx.response.unauthorized({ message: 'No autenticado. Inicie sesión en el portal.' })
      }
      return ctx.response.redirect().toPath('/login')
    }

    // 1. El rol 'admin' siempre tiene acceso transversal total
    if (user.rol === 'admin') {
      return next()
    }

    // 2. Validación de Roles Permitidos
    if (options.roles && !options.roles.includes(user.rol)) {
      if (wantsJson) {
        return ctx.response.forbidden({
          error: 'RBAC_FORBIDDEN',
          message: `Acceso denegado: Se requiere rol [${options.roles.join(', ')}]. Tu rol actual es [${user.rol}].`,
        })
      }
      ctx.session.flash('error', `Acceso denegado: No tienes permisos suficientes para acceder a esta sección.`)
      return ctx.response.redirect().toPath('/dashboard')
    }

    // 3. Regla de Negocio: Segregación de Funciones (SoD) para Aprobaciones
    if (options.action === 'approve') {
      if (user.rol === 'colaborador') {
        if (wantsJson) {
          return ctx.response.forbidden({
            error: 'SOD_VIOLATION',
            message: 'Violación de Segregación de Funciones (SoD): Un colaborador no puede aprobar notas de crédito.',
          })
        }
        ctx.session.flash('error', 'Violación de Segregación de Funciones: No tienes facultades para aprobar solicitudes.')
        return ctx.response.redirect().toPath('/dashboard/notas-credito')
      }
    }

    // 4. Validación de Alcance Departamental para Jefes
    // Un Jefe de Departamento solo puede operar o auditar dentro de su propio departamento
    if (user.rol === 'jefe' && options.allowedDepartments) {
      if (!options.allowedDepartments.includes(user.departamentoId)) {
        if (wantsJson) {
          return ctx.response.forbidden({
            error: 'DEPARTMENT_MISMATCH',
            message: 'Acceso denegado: Los Jefes de Departamento solo pueden operar datos de su propia unidad organizativa.',
          })
        }
        ctx.session.flash('error', 'Acceso denegado: Esta operación pertenece a otro departamento de la VP.')
        return ctx.response.redirect().toPath('/dashboard')
      }
    }

    return next()
  }
}
