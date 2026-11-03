import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
  Layers,
  Building2,
  Briefcase,
  Users,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  X,
} from 'lucide-react';

interface Cargo {
  id: number;
  departamentoId: number;
  nombreCargo: string;
  nivelSeniority: string;
  funcionesPrincipales: string;
  departamento: { id: number; nombre: string; codigo: string };
  colaboradores?: any[];
}

interface Departamento {
  id: number;
  nombre: string;
  codigo: string;
}

interface Props {
  cargos: Cargo[];
  departamentos: Departamento[];
}

export default function CargosPage({ cargos, departamentos }: Props) {
  const [selectedDepto, setSelectedDepto] = useState<number | 'all'>('all');
  const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null);

  const filteredCargos = cargos.filter(
    (c) => selectedDepto === 'all' || c.departamentoId === selectedDepto
  );

  const getSeniorityColor = (seniority: string) => {
    switch (seniority) {
      case 'Gerencia':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Jefatura':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Senior':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Semi-Senior':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <Layout title="Cargos y Funciones">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" />
              <span>Catálogo de Cargos & Responsabilidades</span>
            </div>
            <h1 className="text-2xl font-black text-[#002B66] tracking-tight">
              Fichas de Cargos & Funciones
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Estructura de perfiles, niveles de seniority y responsabilidades de la Vicepresidencia de Finanzas.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-slate-600">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>Total de Cargos: <strong className="text-slate-900">{cargos.length}</strong></span>
          </div>
        </div>

        {/* Filter Tabs by Department */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedDepto('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedDepto === 'all'
                ? 'bg-[#002B66] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({cargos.length})
          </button>
          {departamentos.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelectedDepto(d.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDepto === d.id
                  ? 'bg-[#002B66] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d.nombre} ({cargos.filter((c) => c.departamentoId === d.id).length})
            </button>
          ))}
        </div>

        {/* Cargos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCargos.map((cargo) => (
            <div
              key={cargo.id}
              onClick={() => setSelectedCargo(cargo)}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {cargo.departamento?.nombre}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSeniorityColor(
                      cargo.nivelSeniority
                    )}`}
                  >
                    {cargo.nivelSeniority}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-700 transition-colors">
                  {cargo.nombreCargo}
                </h3>

                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {cargo.funcionesPrincipales}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold group-hover:text-indigo-800">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Ver detalle y colaboradores
                </span>
                <span className="text-slate-500 font-medium text-[11px] bg-slate-100 px-2 py-0.5 rounded-full">
                  {cargo.colaboradores?.length || 0} asignados
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de Detalle de Cargo */}
        {selectedCargo && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    {selectedCargo.departamento?.nombre}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    {selectedCargo.nombreCargo}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCargo(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getSeniorityColor(selectedCargo.nivelSeniority)}`}>
                  Nivel: {selectedCargo.nivelSeniority}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  Código Dpto: {selectedCargo.departamento?.codigo}
                </span>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Funciones y Responsabilidades Principales
                </h4>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  <p>{selectedCargo.funcionesPrincipales}</p>
                </div>
              </div>

              {/* Lista de Colaboradores Asignados */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    Colaboradores Asignados a este Cargo
                  </h4>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    {selectedCargo.colaboradores?.length || 0} personas
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {selectedCargo.colaboradores && selectedCargo.colaboradores.length > 0 ? (
                    selectedCargo.colaboradores.map((colab: any) => (
                      <div
                        key={colab.id}
                        className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-indigo-800 border border-indigo-200 font-bold text-xs flex items-center justify-center shrink-0">
                            {colab.nombreCompleto?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-900 truncate">
                              {colab.nombreCompleto}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {colab.email}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[11px] font-medium text-slate-500 block">
                            {colab.pais === 'Venezuela' ? '🇻🇪 Venezuela' : '🇦🇷 Argentina'}
                          </span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold uppercase">
                            {colab.estado}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center text-xs text-slate-400">
                      No hay colaboradores asignados actualmente a este cargo.
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCargo(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-800 rounded-xl transition-colors"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
