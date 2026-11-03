/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

import '../css/app.css';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from '@adonisjs/inertia/helpers';

const appName = 'Farmatodo - VP Finanzas';

createInertiaApp({
  progress: { color: '#0052CC' },

  title: (title) => title ? `${title} | ${appName}` : appName,

  resolve: (name) => {
    return resolvePageComponent(
      `../pages/${name}.tsx`,
      import.meta.glob('../pages/**/*.tsx'),
    );
  },

  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
});
