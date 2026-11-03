import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
  Building2,
  Users,
  FileCheck2,
  Layers,
  ShieldCheck,
  LogOut,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const { auth, flash } = usePage<any>().props;
  const user = auth?.user;
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const handleDemoSwitch = (persona: string) => {
    router.post('/demo-login', { persona }, {
      onFinish: () => setShowDemoMenu(false),
    });
  };

  const handleLogout = () => {
    router.post('/logout');
  };

  const getRoleBadge = (rol: string) => {
    switch (rol) {
      case 'admin':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">Administrador VP</span>;
      case 'jefe':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">Jefe de Departamento</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">Colaborador</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-[#002B66] text-white sticky top-0 z-40 shadow-md border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Oficial Farmatodo */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard/notas-credito" className="bg-white px-3 py-1.5 rounded-xl shadow-sm hover:opacity-95 transition-opacity flex items-center">
              <img
                src="/images/farmatodo-logo.png"
                alt="Farmatodo"
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </Link>
            <div className="hidden sm:block">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-400/30">
                Vicepresidencia de Finanzas
              </span>
            </div>
          </div>

          {/* User info & Demo Mode Switcher */}
          <div className="flex items-center gap-3">
            {/* Demo Mode Persona Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-xs font-medium text-blue-100 border border-blue-700/50 transition-all shadow-sm"
                title="Cambio rápido de perfil para evaluación"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-300" />
                <span className="hidden md:inline">Modo Demo:</span>
                <span className="font-bold text-white truncate max-w-[120px]">{user?.nombreCompleto?.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-blue-300" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Alternar Perfil Demo (1 Clic)</p>
                    <p className="text-xs text-slate-500">Prueba los flujos y permisos de cada rol:</p>
                  </div>
                  <div className="p-1 space-y-1">
                    <button
                      type="button"
                      onClick={() => handleDemoSwitch('admin')}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 text-xs flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-blue-700">👔 Abraham Santana</div>
                        <div className="text-[10px] text-slate-500">Administrador General VP Finanzas</div>
                      </div>
                      <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">Admin</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDemoSwitch('jefe_cxp')}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 text-xs flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-blue-700">🧑‍💼 Mariana Gómez</div>
                        <div className="text-[10px] text-slate-500">Jefe · Cuentas por Pagar (Aprueba)</div>
                      </div>
                      <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">Jefe</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDemoSwitch('colaborador_cxp')}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 text-xs flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-blue-700">👨‍💻 Andrés Silva</div>
                        <div className="text-[10px] text-slate-500">Colaborador · Cuentas por Pagar (Crea)</div>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">Colab</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDemoSwitch('colaborador_tesoreria')}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 text-xs flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-blue-700">👩‍💼 Santiago Méndez</div>
                        <div className="text-[10px] text-slate-500">Colaborador · Tesorería (Área Externa)</div>
                      </div>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">Tesorería</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Current user pill */}
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-bold leading-tight">{user?.nombreCompleto}</span>
              <span className="text-[11px] text-blue-200/80">{user?.departamentoNombre} · {user?.cargoNombre}</span>
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-blue-800 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 space-y-4">
          {/* User profile card */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm shadow-inner shrink-0">
                {user?.nombreCompleto?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 truncate" title={user?.nombreCompleto}>
                  {user?.nombreCompleto}
                </p>
                <div className="mt-1">{getRoleBadge(user?.rol)}</div>
              </div>
            </div>
            <div className="mt-3.5 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
              <div className="flex justify-between items-center">
                <span>Departamento:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[130px]">{user?.departamentoNombre}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Seniority:</span>
                <span className="font-semibold text-slate-800">{user?.seniority || 'Staff'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>País:</span>
                <span className="font-semibold text-slate-800">{user?.pais}</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="bg-white p-3 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
            <p className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Navegación del Portal
            </p>

            <Link
              href="/dashboard/notas-credito"
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all hover:bg-blue-50 text-slate-700 hover:text-blue-700 group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate font-bold">Notas de Crédito</div>
                <div className="text-[10px] text-slate-400 font-normal">Gestión y Aprobaciones</div>
              </div>
            </Link>

            <Link
              href="/dashboard/organizacion"
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all hover:bg-blue-50 text-slate-700 hover:text-blue-700 group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate font-bold">Colaboradores</div>
                <div className="text-[10px] text-slate-400 font-normal">Directorio Organizacional</div>
              </div>
            </Link>

            <Link
              href="/dashboard/cargos"
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all hover:bg-blue-50 text-slate-700 hover:text-blue-700 group"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-100/70 text-indigo-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate font-bold">Cargos & Funciones</div>
                <div className="text-[10px] text-slate-400 font-normal">Matriz de Responsabilidades</div>
              </div>
            </Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 space-y-4">
          {/* Flash Messages */}
          {flash?.success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 shadow-sm animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs sm:text-sm font-medium">{flash.success}</p>
            </div>
          )}

          {flash?.error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-3 shadow-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-xs sm:text-sm font-medium">{flash.error}</p>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
