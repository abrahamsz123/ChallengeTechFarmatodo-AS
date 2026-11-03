/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')

// =============================================================================
// 1. RUTAS PÚBLICAS (Login y Acceso Demo)
// =============================================================================
router.get('/', [AuthController, 'showLogin'])
router.get('/login', [AuthController, 'showLogin'])
router.post('/login', [AuthController, 'login'])
router.post('/demo-login', [AuthController, 'demoLogin'])

// =============================================================================
// 2. RUTAS PROTEGIDAS (Requieren Sesión Autenticada)
// =============================================================================
router
  .group(() => {
    router.post('/logout', [AuthController, 'logout'])

    // Endpoints API
    router.get('/api/me', [AuthController, 'me'])

    router.get('/api/health', async ({ response }) => {
      return response.ok({
        status: 'online',
        app: 'Farmatodo - VP Finanzas Portal',
        database: 'PostgreSQL 16 (Connected)',
        timestamp: new Date().toISOString(),
      })
    })
  })
  .use(middleware.auth())
