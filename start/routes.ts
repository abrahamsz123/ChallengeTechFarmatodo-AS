/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
*/

import router from '@adonisjs/core/services/router'

// Ruta inicial del portal
router.on('/').renderInertia('Home')

// Health check para monitoreo de la API
router.get('/api/health', async ({ response }) => {
  return response.ok({
    status: 'online',
    app: 'Farmatodo - VP Finanzas Portal',
    timestamp: new Date().toISOString(),
  })
})
