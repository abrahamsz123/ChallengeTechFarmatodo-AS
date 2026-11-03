import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'

export default class InertiaMiddleware {
  public async handle({ inertia, auth }: HttpContext, next: NextFn) {
    // 1. Obligamos al sistema a verificar quién eres antes de compartir
    await auth.check()

    // 2. Compartimos tus datos reales con el Layout
    inertia.share({
      auth: {
        user: auth.user ? {
          nombre: auth.user.nombre,
          correo: auth.user.correo,
          rol: auth.user.rol,
        } : null
      },
      errors: (ctx: HttpContext) => ctx.session?.flashMessages.get('errors'),
    })

    return next()
  }
}