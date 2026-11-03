import React, { useState } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import Layout from '../components/Layout';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Eye,
  X,
  Lock,
  Building,
  UserCheck,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface Tienda {
  id: number;
  nombre: string;
  pais: string;
}

interface Compania {
  id: number;
  nombre: string;
  rubro: string;
}

interface Auditoria {
  id: number;
  accion: string;
  estadoAnterior: string | null;
  estadoNuevo: string;
  comentario: string | null;
  fecha: string;
  usuario?: {
    id: number;
    nombreCompleto: string;
    rol: string;
    cargo?: { nombreCargo: string };
  };
}

interface NotaCredito {
  id: number;
  monto: number;
  moneda: string;
  motivo: string;
  tiendaId: number;
  companiaId: number;
  departamentoResponsable: string;
  departamentoId: number | null;
  creadoPorId: number | null;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  riskScore: number;
  riskLevel: 'BAJO' | 'MEDIO' | 'ALTO';
  riskJustification: string | null;
  fechaCreacion: string;
  tienda?: Tienda;
  compania?: Compania;
  creador?: {
    id: number;
    nombreCompleto: string;
    email: string;
    cargo?: { nombreCargo: string };
  };
  auditorias?: Auditoria[];
}

interface KPIs {
  totalNotas: number;
  pendientes: number;
  aprobadas: number;
  rechazadas: number;
  tasaAprobacion: number;
  montoTotalUSD: number;
  montoTotalVES: number;
  riesgoAltoCount: number;
}

interface Props {
  notas: NotaCredito[];
  kpis: KPIs;
  tiendas: Tienda[];
  companias: Compania[];
  departamentos: any[];
  filtros: {
    estado?: string;
    moneda?: string;
    riskLevel?: string;
    search?: string;
  };
}

export default function NotasCreditoPage({ notas, kpis, tiendas, companias, departamentos, filtros }: Props) {
  const { auth } = usePage<any>().props;
  const currentUser = auth?.user;

  // Estados de Modales
  const [selectedNota, setSelectedNota] = useState<NotaCredito | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Formulario de Resolución (Aprobar / Rechazar)
  const resolveForm = useForm({
    accion: 'aprobada',
    comentario: '',
  });

  // Formulario de Creación
  const createForm = useForm({
    tienda_id: tiendas[0]?.id || 1,
    compania_id: companias[0]?.id || 1,
    monto: '',
    moneda: 'USD',
    motivo: '',
    departamento_responsable: 'Cuentas por Pagar',
  });

  // Filtros locales
  const [estadoFilter, setEstadoFilter] = useState(filtros.estado || 'todos');
  const [monedaFilter, setMonedaFilter] = useState(filtros.moneda || 'todas');
  const [riskFilter, setRiskFilter] = useState(filtros.riskLevel || 'todos');
  const [search, setSearch] = useState(filtros.search || '');

  const applyFilters = (newFilters: any) => {
    router.get('/dashboard/notas-credito', {
      estado: newFilters.estado ?? estadoFilter,
      moneda: newFilters.moneda ?? monedaFilter,
      risk_level: newFilters.riskLevel ?? riskFilter,
      search: newFilters.search ?? search,
    }, { preserveState: true });
  };

  const handleResolve = (accion: 'aprobada' | 'rechazada') => {
    if (!selectedNota) return;
    resolveForm.setData('accion', accion);

    router.post(
      `/dashboard/notas-credito/${selectedNota.id}/resolver`,
      {
        accion,
        comentario: resolveForm.data.comentario,
      },
      {
        onSuccess: () => {
          setSelectedNota(null);
          resolveForm.reset();
        },
      }
    );
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createForm.post('/dashboard/notas-credito', {
      onSuccess: () => {
        setShowCreateModal(false);
        createForm.reset();
      },
    });
  };

  // Cálculo en vivo del Score de Riesgo mientras tipea en el modal de creación
  const previewScore = () => {
    let score = 0;
    const monto = Number(createForm.data.monto) || 0;
    const montoUSD = createForm.data.moneda === 'VES' ? monto / 45 : monto;

    if (montoUSD > 3000) score += 50;
    else if (montoUSD > 1000) score += 30;
    else score += 15;

    const mot = createForm.data.motivo.toLowerCase();
    if (mot.includes('mal estado') || mot.includes('vencimiento') || mot.includes('avería')) score += 35;
    else if (mot.includes('error') || mot.includes('diferencia')) score += 20;
    else score += 10;

    if (Number(createForm.data.compania_id) === 4 || Number(createForm.data.compania_id) === 6) score += 15;

    score = Math.min(score, 100);
    return {
      score,
      level: score >= 70 ? 'ALTO' : score >= 40 ? 'MEDIO' : 'BAJO',
    };
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'aprobada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Aprobada
          </span>
        );
      case 'rechazada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3.5 h-3.5" /> Rechazada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pendiente
          </span>
        );
    }
  };

  const getRiskBadge = (level: string, score: number) => {
    switch (level) {
      case 'ALTO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-red-50 text-red-700 border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            Alto ({score}/100)
          </span>
        );
      case 'MEDIO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Medio ({score}/100)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Bajo ({score}/100)
          </span>
        );
    }
  };

  return (
    <Layout title="Gestión de Notas de Crédito">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
              <FileCheck2 className="w-4 h-4" />
              <span>Módulo Funcional a Profundidad (Sección 3.4)</span>
            </div>
            <h1 className="text-2xl font-black text-[#002B66] tracking-tight">
              Flujo de Notas de Crédito & Control Interno
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Persistencia relacional, evaluación automática de riesgo y Segregación de Funciones (SoD).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#0052CC] hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Solicitud</span>
          </button>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Pendientes */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-bold">Pendientes de Aprobación</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{kpis.pendientes}</div>
            <p className="text-[11px] text-slate-400">Requieren decisión de Jefatura</p>
          </div>

          {/* KPI 2: Aprobadas & Tasa */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-bold">Tasa de Aprobación</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{kpis.tasaAprobacion}%</div>
            <p className="text-[11px] text-emerald-600 font-semibold">{kpis.aprobadas} aprobadas · {kpis.rechazadas} rechazadas</p>
          </div>

          {/* KPI 3: Monto Comprometido */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-bold">Volumen Comprometido</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-[#002B66]">
              ${kpis.montoTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500">
              + Bs. {kpis.montoTotalVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* KPI 4: Alertas de Riesgo Alto */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-bold">Riesgo Alto (Motor AI)</span>
              <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-red-600">{kpis.riesgoAltoCount}</div>
            <p className="text-[11px] text-red-500 font-medium">Score &ge; 70 pts (Auditoría Prioritaria)</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  applyFilters({ search: e.target.value });
                }}
                placeholder="Buscar por ID, motivo o proveedor..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-600 transition-all"
              />
            </div>

            {/* Estado filter */}
            <select
              value={estadoFilter}
              onChange={(e) => {
                setEstadoFilter(e.target.value);
                applyFilters({ estado: e.target.value });
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium outline-none"
            >
              <option value="todos">Estado: Todos</option>
              <option value="pendiente">Solo Pendientes</option>
              <option value="aprobada">Solo Aprobadas</option>
              <option value="rechazada">Solo Rechazadas</option>
            </select>

            {/* Moneda filter */}
            <select
              value={monedaFilter}
              onChange={(e) => {
                setMonedaFilter(e.target.value);
                applyFilters({ moneda: e.target.value });
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium outline-none"
            >
              <option value="todas">Moneda: Todas</option>
              <option value="USD">Solo USD ($)</option>
              <option value="VES">Solo VES (Bs.)</option>
            </select>

            {/* Risk filter */}
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                applyFilters({ riskLevel: e.target.value });
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium outline-none"
            >
              <option value="todos">Nivel de Riesgo: Todos</option>
              <option value="ALTO">🔴 Riesgo Alto (&ge; 70)</option>
              <option value="MEDIO">🟡 Riesgo Medio (40-69)</option>
              <option value="BAJO">🟢 Riesgo Bajo (&lt; 40)</option>
            </select>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Nota #</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Tienda</th>
                  <th className="py-3.5 px-4">Compañía Proveedora</th>
                  <th className="py-3.5 px-4">Monto</th>
                  <th className="py-3.5 px-4">Dpto Responsable</th>
                  <th className="py-3.5 px-4">Riesgo Control</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notas.map((nota) => (
                  <tr key={nota.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      #{nota.id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {nota.fechaCreacion?.substring(0, 10)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {nota.tienda?.nombre}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {nota.compania?.nombre}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 whitespace-nowrap">
                      {nota.moneda === 'USD' ? '$' : 'Bs. '}
                      {Number(nota.monto).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                        {nota.departamentoResponsable}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getRiskBadge(nota.riskLevel, nota.riskScore)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(nota.estado)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedNota(nota)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#002B66] text-slate-700 hover:text-white font-bold transition-all text-xs group-hover:shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Auditar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {notas.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-sm">
              No se encontraron notas de crédito con los filtros seleccionados.
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* MODAL 1: DETALLE, SEÑALÉTICA SOD Y LÍNEA DE TIEMPO DE AUDITORÍA    */}
        {/* =================================================================== */}
        {selectedNota && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      Expediente de Control #{selectedNota.id}
                    </span>
                    {getStatusBadge(selectedNota.estado)}
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    {selectedNota.compania?.nombre}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Tienda: {selectedNota.tienda?.nombre} ({selectedNota.tienda?.pais})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNota(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Importes y Datos Clave */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Monto Solicitado</span>
                  <div className="text-base font-black text-[#002B66] mt-0.5">
                    {selectedNota.moneda === 'USD' ? '$' : 'Bs. '}
                    {Number(selectedNota.monto).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Departamento</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedNota.departamentoResponsable}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Fecha Emisión</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedNota.fechaCreacion?.substring(0, 10)}</div>
                </div>
              </div>

              {/* Motivo de la reclamación */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Motivo Declarado</h4>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 font-medium leading-relaxed">
                  "{selectedNota.motivo}"
                </div>
              </div>

              {/* Motor de Scoring de Control Interno */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Evaluación del Motor de Riesgo (AI Heuristic Score)</span>
                  </div>
                  {getRiskBadge(selectedNota.riskLevel, selectedNota.riskScore)}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <strong>Criterios evaluados:</strong> {selectedNota.riskJustification || 'Evaluación estándar del despacho.'}
                </p>
              </div>

              {/* Trazabilidad y Línea de Tiempo de Auditoría */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Trazabilidad de Auditoría (Timeline Inmutable)
                </h4>

                <div className="border-l-2 border-blue-200 ml-3 pl-4 space-y-4">
                  {selectedNota.auditorias?.map((aud) => (
                    <div key={aud.id} className="relative text-xs">
                      <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-sm" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 uppercase tracking-wide text-[10px]">
                          {aud.accion === 'creacion' ? 'Creación de Solicitud' : `Resolución: ${aud.estadoNuevo?.toUpperCase()}`}
                        </span>
                        <span className="text-[10px] text-slate-400">{aud.fecha?.substring(0, 16)}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{aud.comentario}</p>
                      {aud.usuario && (
                        <p className="text-[10px] text-blue-700 font-semibold mt-0.5">
                          Operado por: {aud.usuario.nombreCompleto} ({aud.usuario.rol?.toUpperCase()} · {aud.usuario.cargo?.nombreCargo || 'Finanzas'})
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ============================================================= */}
              {/* PANEL DE RESOLUCIÓN & VALIDACIÓN SEGREGACIÓN DE FUNCIONES (SOD)*/}
              {/* ============================================================= */}
              {selectedNota.estado === 'pendiente' && (
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  {/* CASO A: Violación de Segregación de Funciones (El creador intenta autoaprobarse) */}
                  {selectedNota.creadoPorId === currentUser?.id ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                      <Lock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-red-900">
                          Acción Bloqueada por Segregación de Funciones (SoD)
                        </p>
                        <p className="text-red-700 leading-relaxed">
                          Tú eres el colaborador que registró esta nota. Por política de control interno, el solicitante <strong>no tiene autorización para aprobar sus propias notas de crédito</strong>. Debe ser aprobada por tu Jefatura.
                        </p>
                      </div>
                    </div>
                  ) : currentUser?.rol === 'colaborador' ? (
                    /* CASO B: Es un colaborador sin facultades */
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-amber-900">Privilegios Insuficientes</p>
                        <p className="text-amber-700">
                          Tu rol es <strong>Colaborador</strong>. Solo los Jefes de Departamento o Administradores pueden autorizar desembolsos.
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* CASO C: Usuario con facultad (Jefe de Dpto o Admin) -> Formulario de Aprobación */
                    <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                        <span>Dictamen de Jefatura (Autorización / Rechazo)</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                          Comentario de Auditoría (Obligatorio)
                        </label>
                        <input
                          type="text"
                          value={resolveForm.data.comentario}
                          onChange={(e) => resolveForm.setData('comentario', e.target.value)}
                          placeholder="ej. Validado soporte con guía de recepción física en tienda..."
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                        />
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleResolve('aprobada')}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Aprobar Solicitud</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResolve('rechazada')}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-600/20"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Rechazar Solicitud</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Botón de cierre */}
              <button
                type="button"
                onClick={() => setSelectedNota(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-800 rounded-xl transition-colors"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* MODAL 2: CREACIÓN DE NUEVA NOTA DE CRÉDITO                          */}
        {/* =================================================================== */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Nueva Solicitud de Nota de Crédito
                  </h2>
                  <p className="text-xs text-slate-500">
                    Registrada por: <strong>{currentUser?.nombreCompleto}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {/* Tienda */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tienda Destino</label>
                  <select
                    value={createForm.data.tienda_id}
                    onChange={(e) => createForm.setData('tienda_id', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                  >
                    {tiendas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre} ({t.pais})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Compañía Proveedora */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Compañía Proveedora</label>
                  <select
                    value={createForm.data.compania_id}
                    onChange={(e) => createForm.setData('compania_id', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                  >
                    {companias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} · {c.rubro}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Importe y Moneda */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Monto de la Nota</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="ej. 2500.00"
                      value={createForm.data.monto}
                      onChange={(e) => createForm.setData('monto', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Moneda</label>
                    <select
                      value={createForm.data.moneda}
                      onChange={(e) => createForm.setData('moneda', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-600 font-bold"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="VES">VES (Bs.)</option>
                    </select>
                  </div>
                </div>

                {/* Motivo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Motivo Detallado</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="ej. Devolución de producto por fecha de vencimiento menor a 60 días..."
                    value={createForm.data.motivo}
                    onChange={(e) => createForm.setData('motivo', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-600 resize-none"
                  />
                </div>

                {/* Departamento Responsable */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Departamento Responsable</label>
                  <select
                    value={createForm.data.departamento_responsable}
                    onChange={(e) => createForm.setData('departamento_responsable', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                  >
                    <option value="Cuentas por Pagar">Cuentas por Pagar (Proveedores)</option>
                    <option value="Cuentas por Cobrar">Cuentas por Cobrar (Clientes/Retail)</option>
                  </select>
                </div>

                {/* Previsualización en Vivo del Risk Score */}
                {createForm.data.monto && (
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-semibold text-blue-900">Previsualización de Riesgo:</span>
                    {getRiskBadge(previewScore().level, previewScore().score)}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createForm.processing}
                    className="flex-1 py-2.5 bg-[#0052CC] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    {createForm.processing ? 'Registrando...' : 'Emitir Solicitud'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
