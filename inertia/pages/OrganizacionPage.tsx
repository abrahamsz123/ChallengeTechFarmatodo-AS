import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
  Building2,
  Users,
  Search,
  Filter,
  Calendar,
  MapPin,
  Briefcase,
  Shield,
  Layers,
} from 'lucide-react';

interface Departamento {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  cargos?: any[];
  colaboradores?: any[];
}

interface Colaborador {
  id: number;
  nombreCompleto: string;
  email: string;
  pais: string;
  fechaIngreso: string;
  rol: string;
  estado: string;
  departamento: { id: number; nombre: string; codigo: string };
  cargo: { id: number; nombreCargo: string; nivelSeniority: string };
}

interface Props {
  departamentos: Departamento[];
  colaboradores: Colaborador[];
}

export default function OrganizacionPage({ departamentos, colaboradores }: Props) {
  const [selectedDepto, setSelectedDepto] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');

  const filteredColaboradores = colaboradores.filter((c) => {
    const matchesDepto = selectedDepto === 'all' || c.departamento?.id === selectedDepto;
    const matchesSearch =
      c.nombreCompleto.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.cargo?.nombreCargo.toLowerCase().includes(search.toLowerCase());
    return matchesDepto && matchesSearch;
  });

  return (
    <Layout title="Estructura Organizacional">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>Directorio de Colaboradores</span>
            </div>
            <h1 className="text-2xl font-black text-[#002B66] tracking-tight">
              Estructura VP de Finanzas
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Directorio oficial de departamentos, equipos y colaboradores de la Vicepresidencia de Finanzas.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-slate-600">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Total en Nómina: <strong className="text-slate-900">{colaboradores.length}</strong></span>
          </div>
        </div>

        {/* Filter Tabs by Department */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedDepto('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDepto === 'all'
                  ? 'bg-[#002B66] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({colaboradores.length})
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
                {d.nombre} ({colaboradores.filter((c) => c.departamento?.id === d.id).length})
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, correo o cargo..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Collaborators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredColaboradores.map((colab) => (
            <div
              key={colab.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2.5 min-w-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 text-[#002B66] font-bold text-sm flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                    {colab.nombreCompleto.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-700 transition-colors truncate" title={colab.nombreCompleto}>
                      {colab.nombreCompleto}
                    </h3>
                    <p className="text-xs text-slate-500 font-normal truncate" title={colab.email}>
                      {colab.email}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 uppercase tracking-wide whitespace-nowrap ${
                    colab.estado === 'activo'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {colab.estado}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600 border border-slate-100 min-w-0">
                <div className="flex items-center gap-1.5 font-medium text-slate-800 min-w-0">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate" title={colab.cargo?.nombreCargo}>
                    {colab.cargo?.nombreCargo}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 min-w-0 gap-2">
                  <span className="truncate">Dpto: {colab.departamento?.codigo}</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-semibold rounded text-[10px] shrink-0 whitespace-nowrap">
                    {colab.cargo?.nivelSeniority}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 min-w-0 gap-2">
                <span className="flex items-center gap-1 shrink-0 truncate">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {colab.pais === 'Venezuela' ? '🇻🇪 Venezuela' : '🇦🇷 Argentina'}
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  Ingreso: {colab.fechaIngreso}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredColaboradores.length === 0 && (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-sm">
            No se encontraron colaboradores que coincidan con la búsqueda.
          </div>
        )}
      </div>
    </Layout>
  );
}
