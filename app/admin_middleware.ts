import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn) {
    
    // 1. Verificamos si el usuario actual NO tiene el rol de ADMIN
    if (auth.user?.rol !== 'ADMIN') {
      // 2. Si es un empleado intentando entrar a zona de admins, lo devolvemos al inicio
      return response.redirect().toPath('/dashboard')
    }
    
    // 3. Si efectivamente es ADMIN, lo dejamos pasar a la pestaña de usuarios
    return next()
  }
}