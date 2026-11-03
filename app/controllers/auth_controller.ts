import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  /**
   * Renderiza la página de login
   */
  public async showLogin({ auth, inertia, response }: HttpContext) {
    if (await auth.use('web').check()) {
      return response.redirect().toPath('/dashboard')
    }
    return inertia.render('LoginPage')
  }

  /**
   * Procesa el inicio de sesión
   */
  public async login({ request, auth, response, session }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const user = await User.verifyCredentials(email, password)

      if (user.estado === 'inactivo') {
        session.flash('errors', { email: 'Este usuario se encuentra inactivo en la estructura organizacional.' })
        return response.redirect().back()
      }

      await auth.use('web').login(user)

      if (request.wantsJSON()) {
        await user.load('departamento')
        await user.load('cargo')
        return response.ok({
          message: 'Autenticación exitosa',
          user,
        })
      }

      return response.redirect().toPath('/dashboard')
    } catch {
      session.flash('errors', { email: 'Credenciales inválidas. Verifique su correo y contraseña.' })
      return response.redirect().back()
    }
  }

  /**
   * Cierre de sesión seguro
   */
  public async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toPath('/login')
  }

  /**
   * Perfil del usuario autenticado (Endpoint de API)
   */
  public async me({ auth, response }: HttpContext) {
    const user = auth.use('web').user!
    await user.load('departamento')
    await user.load('cargo')

    return response.ok({
      user,
    })
  }

  /**
   * Inicio de sesión rápido para la demo del Tech Challenge
   */
  public async demoLogin({ request, auth, response }: HttpContext) {
    const { persona } = request.only(['persona'])

    const emails: Record<string, string> = {
      admin: 'admin@farmatodo.local',
      jefe_cxp: 'jefe.cxp@farmatodo.local',
      colaborador_cxp: 'analista.cxp@farmatodo.local',
      jefe_cxc: 'jefe.cxc@farmatodo.local',
      colaborador_tesoreria: 'analista.tesoreria@farmatodo.local',
    }

    const email = emails[persona] || emails.admin
    const user = await User.findByOrFail('email', email)
    await auth.use('web').login(user)

    return response.redirect().toPath('/dashboard')
  }
}
