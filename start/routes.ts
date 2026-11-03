/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
| Farmatodo · Transformación Financiera · Portal Interno VP Finanzas
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')
const OrganizacionController = () => import('#controllers/organizacion_controller')
const NotasCreditoController = () => import('#controllers/notas_credito_controller')

// =============================================================================
// 1. RUTAS PÚBLICAS (Login y Acceso Demo)
// =============================================================================
router.get('/', [AuthController, 'showLogin'])
router.get('/login', [AuthController, 'showLogin'])
router.post('/login', [AuthController, 'login'])
router.post('/demo-login', [AuthController, 'demoLogin'])

// =============================================================================
// 2. RUTAS PROTEGIDAS WEB (Inertia + React)
// =============================================================================
router
  .group(() => {
    router.post('/logout', [AuthController, 'logout'])

    // Redirección principal al módulo neurálgico
    router.get('/dashboard', ({ response }) => response.redirect().toPath('/dashboard/notas-credito'))

    // MÓDULO 1 (DUMMY 1): Estructura Organizacional de la VP de Finanzas
    router.get('/dashboard/organizacion', [OrganizacionController, 'index'])

    // MÓDULO 2 (DUMMY 2): Fichas de Cargos y Funciones Asociadas
    router.get('/dashboard/cargos', [OrganizacionController, 'cargos'])

    // MÓDULO 3 (PROFUNDO): Proceso de Negocio de Notas de Crédito & Control Interno
    router.get('/dashboard/notas-credito', [NotasCreditoController, 'index'])
    router.post('/dashboard/notas-credito', [NotasCreditoController, 'store'])
    router.post('/dashboard/notas-credito/:id/resolver', [NotasCreditoController, 'resolver'])
  })
  .use(middleware.auth())

// =============================================================================
// 3. API REST ENDPOINTS (/api/v1/...) - Requisito 1 y 4 Obligatorios
// =============================================================================
router
  .group(() => {
    // Health Check del Sistema
    router.get('/health', async ({ response }) => {
      return response.ok({
        status: 'online',
        entorno: 'development',
        sistema: 'Farmatodo - VP Finanzas (Transformación Financiera)',
        database: 'PostgreSQL 16 (Conectado)',
        timestamp: new Date().toISOString(),
      })
    })

    // Sesión del usuario actual
    router.get('/auth/me', [AuthController, 'me'])

    // Endpoints del Módulo Organizacional
    router.get('/departamentos', [OrganizacionController, 'index'])
    router.get('/colaboradores', [OrganizacionController, 'colaboradoresApi'])
    router.get('/cargos', [OrganizacionController, 'cargos'])

    // Endpoints del Proceso de Notas de Crédito & Auditoría
    router.get('/kpis', [NotasCreditoController, 'kpisApi'])
    router.get('/notas-credito', [NotasCreditoController, 'index'])
    router.post('/notas-credito', [NotasCreditoController, 'store'])
    router.get('/notas-credito/:id', [NotasCreditoController, 'show'])
    router.post('/notas-credito/:id/resolver', [NotasCreditoController, 'resolver'])
  })
  .prefix('/api/v1')
  .use(middleware.auth())
