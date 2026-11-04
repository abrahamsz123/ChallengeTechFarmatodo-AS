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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pt-16">
      {/* Top Navbar */}
      <header className="bg-[#002B66] text-white fixed top-0 left-0 right-0 z-50 shadow-md border-b border-blue-900/40 h-16">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo Oficial Farmatodo */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/notas-credito"
              className="bg-white/95 hover:bg-white px-3 py-1.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center"
            >
              <img
                src="/images/farmatodo-logo.png"
                alt="Farmatodo"
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </Link>
          </div>

          {/* User Profile Pill & Dropdown (Modo Demo Integrado Discreto) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-white text-[#002B66] font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                {user?.nombreCompleto?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="truncate max-w-[130px]">{user?.nombreCompleto}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-500/30 text-blue-200 uppercase">
                    {user?.rol}
                  </span>
                </div>
                <div className="text-[11px] text-blue-200/80 truncate max-w-[170px]">
                  {user?.departamentoNombre}
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-blue-200 transition-transform ${showDemoMenu ? 'rotate-180' : ''}`} />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.nombreCompleto}</p>
                  <p className="text-[11px] text-slate-500">{user?.cargoNombre}</p>
                  <p className="text-[10px] text-blue-600 font-medium mt-0.5">{user?.departamentoNombre} · {user?.pais}</p>
                </div>

                {/* Selector Discreto para Demostración */}
                <div className="px-3.5 pt-2.5 pb-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Cambiar Perfil Demo (1 Clic)
                  </p>
                </div>
                <div className="px-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => handleDemoSwitch('admin')}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-50 text-xs flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-blue-700">👔 Abraham Santana</div>
                      <div className="text-[10px] text-slate-400">Administrador General</div>
                    </div>
                    <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoSwitch('jefe_cxp')}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-50 text-xs flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-blue-700">🧑‍💼 Mariana Gómez</div>
                      <div className="text-[10px] text-slate-400">Jefe · Cuentas por Pagar (Aprueba)</div>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">Jefe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoSwitch('colaborador_cxp')}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-50 text-xs flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-blue-700">👨‍💻 Andrés Silva</div>
                      <div className="text-[10px] text-slate-400">Colaborador · Cuentas por Pagar (Crea)</div>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">Colab</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoSwitch('colaborador_tesoreria')}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-50 text-xs flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-blue-700">👩‍💼 Santiago Méndez</div>
                      <div className="text-[10px] text-slate-400">Colaborador · Tesorería</div>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">Tesorería</span>
                  </button>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 px-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="max-w-[1500px] mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col md:flex-row gap-5">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-56 lg:w-60 shrink-0 space-y-4">
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
