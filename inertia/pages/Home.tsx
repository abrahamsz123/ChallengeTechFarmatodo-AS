import React from 'react';
import { ShieldCheck, Building2, Layers } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Building2 className="w-8 h-8 text-[#002B66]" />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 mb-4">
          <ShieldCheck className="w-3.5 h-3.5" /> Transformación Financiera
        </span>
        <h1 className="text-3xl font-extrabold text-[#002B66] tracking-tight mb-3">
          Farmatodo · VP Finanzas
        </h1>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          Portal Interno de Control y Aprobación de Notas de Crédito con Segregación de Funciones (SoD) y Auditoría.
        </p>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" /> Stack Base Configurado:
          </p>
          <p>• Backend: AdonisJS v6 (TypeScript)</p>
          <p>• Database: PostgreSQL 16 (farmatodo_challenge)</p>
          <p>• Frontend: React 19 + Inertia + Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}
