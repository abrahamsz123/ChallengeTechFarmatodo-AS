import React, { useState } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import {
  Building2,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Database,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const { errors } = usePage<any>().props;
  const { data, setData, post, processing } = useForm({
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/login');
  };

  const handleDemoLogin = (persona: string) => {
    router.post('/demo-login', { persona });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002B66] via-[#003B8C] to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      <div className="max-w-md w-full">
        {/* Farmatodo Logo & Card Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl border border-white/20">
            <span className="text-[#002B66] font-black text-3xl tracking-tighter">F+</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">FARMATODO</h1>
          <p className="text-blue-200 text-xs font-semibold tracking-wider uppercase mt-1">
            Vicepresidencia de Finanzas · Portal Interno
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Iniciar Sesión</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Accede al módulo de control y aprobación de notas de crédito.
            </p>
          </div>

          {errors?.email && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errors.email}</span>
            </div>
          )}

          {/* Formulario Real */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Correo Institucional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  placeholder="ej. mariana.gomez@farmatodo.local"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 px-4 bg-[#0052CC] hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{processing ? 'Verificando...' : 'Ingresar al Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Selector de Acceso Rápido para la Demo (El salvavidas de la presentación) */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Acceso Rápido para Demostración (1 Clic)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Haz clic en cualquiera de estos perfiles para probar el flujo de roles y la segregación de funciones:
            </p>

            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 transition-colors text-xs"
              >
                <div className="font-bold text-purple-900">👔 Administrador</div>
                <div className="text-[10px] text-purple-700">Acceso transversal</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('jefe_cxp')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 transition-colors text-xs"
              >
                <div className="font-bold text-blue-900">🧑‍💼 Jefe CxP</div>
                <div className="text-[10px] text-blue-700">Facultad de Aprobación</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('colaborador_cxp')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 transition-colors text-xs"
              >
                <div className="font-bold text-emerald-900">👨‍💻 Colaborador CxP</div>
                <div className="text-[10px] text-emerald-700">Crea (Sin autoaprobar)</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('colaborador_tesoreria')}
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 transition-colors text-xs"
              >
                <div className="font-bold text-amber-900">👩‍💼 Tesorería</div>
                <div className="text-[10px] text-amber-700">RBAC Restringido</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-blue-200/80 space-y-1">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" /> Control de Acceso RBAC validado en Backend
          </p>
          <p className="text-[11px] text-blue-300/60">
            AdonisJS v6 · React 19 · Inertia.js · PostgreSQL 16
          </p>
        </div>
      </div>
    </div>
  );
}
