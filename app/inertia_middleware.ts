import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class InertiaMiddleware {
  public async handle({ inertia, auth }: HttpContext, next: NextFn) {
    await auth.use('web').check()
    const user = auth.use('web').user

    if (user) {
      await user.load('departamento')
      await user.load('cargo')
    }

    inertia.share({
      auth: {
        user: user
          ? {
              id: user.id,
              nombreCompleto: user.nombreCompleto,
              email: user.email,
              rol: user.rol,
              pais: user.pais,
              departamentoId: user.departamentoId,
              departamentoNombre: user.departamento?.nombre,
              departamentoCodigo: user.departamento?.codigo,
              cargoNombre: user.cargo?.nombreCargo,
              seniority: user.cargo?.nivelSeniority,
            }
          : null,
      },
      flash: (ctx: HttpContext) => ({
        success: ctx.session?.flashMessages.get('success'),
        error: ctx.session?.flashMessages.get('error'),
      }),
      errors: (ctx: HttpContext) => ctx.session?.flashMessages.get('errors'),
    })

    return next()
  }
}
