import React, { useState, useEffect } from 'react';
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
  AlertCircle,
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
  estado: 'pendiente' | 'aprobada_parcial' | 'aprobada' | 'rechazada';
  riskScore: number;
  riskLevel: 'BAJO' | 'MEDIO' | 'ALTO';
  riskJustification: string | null;
  tasaCambioBcv?: number | null;
  montoUsdEquivalente?: number | null;
  requiereDobleAprobacion?: boolean;
  primerAprobadorId?: number | null;
  fechaPrimeraAprobacion?: string | null;
  segundoAprobadorId?: number | null;
  fechaSegundaAprobacion?: string | null;
  fechaCreacion: string;
  tienda?: Tienda;
  compania?: Compania;
  creador?: {
    id: number;
    nombreCompleto: string;
    email: string;
    rol?: string;
    cargo?: { nombreCargo: string };
    departamento?: { nombre: string };
  };
  primerAprobador?: {
    id: number;
    nombreCompleto: string;
    rol?: string;
    cargo?: { nombreCargo: string };
  };
  segundoAprobador?: {
    id: number;
    nombreCompleto: string;
    rol?: string;
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
  tasaBcv?: number;
  filtros: {
    estado?: string;
    moneda?: string;
    riskLevel?: string;
    search?: string;
  };
}

export default function NotasCreditoPage({
  notas,
  kpis,
  tiendas,
  companias,
  departamentos,
  tasaBcv = 893.22,
  filtros,
}: Props) {
  const { auth } = usePage<any>().props;
  const currentUser = auth?.user;

  // Estados de Modales
  const [selectedNota, setSelectedNota] = useState<NotaCredito | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Evitar salto o desborde del scroll cuando cualquier modal está abierto
  useEffect(() => {
    if (selectedNota || showCreateModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedNota, showCreateModal]);

  // Formulario de Resolución (Aprobar / Rechazar)
  const resolveForm = useForm({
    accion: 'aprobada',
    comentario: '',
  });

  // Formulario de Creación (Inicia completamente vacío)
  const createForm = useForm({
    tienda_id: '',
    compania_id: '',
    monto: '',
    moneda: 'USD',
    motivo: '',
    departamento_responsable: '',
  });

  const handleOpenCreateModal = () => {
    createForm.reset();
    createForm.setData({
      tienda_id: '',
      compania_id: '',
      monto: '',
      moneda: 'USD',
      motivo: '',
      departamento_responsable: '',
    });
    setShowCreateModal(true);
  };

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

  // Cálculo en vivo del Score de Riesgo diferenciado (USD directo o VES convertido con tasa BCV)
  const previewScore = () => {
    let score = 0;
    const monto = Number(createForm.data.monto) || 0;
    const tasa = tasaBcv || 893.22;
    const montoUSD = createForm.data.moneda === 'VES' ? (tasa > 0 ? monto / tasa : monto) : monto;

    let montoPts = 15;
    let montoLabel = '< $1.000 USD';
    if (montoUSD > 3000) {
      montoPts = 50;
      montoLabel = '> $3.000 USD';
    } else if (montoUSD >= 1000) {
      montoPts = 30;
      montoLabel = '$1.000 - $3.000 USD';
    }
    score += montoPts;

    const mot = createForm.data.motivo.toLowerCase();
    const isAfectacionFisica = [
      'mal estado', 'vencimiento', 'vencid', 'avería', 'averia', 'roto', 'rota',
      'merma', 'dañado', 'dañada', 'daño', 'caducad', 'expirad', 'falta', 'faltante',
      'incomplet', 'no llegó', 'no llego', 'faltaron', 'deterioro', 'rotura', 'perdida', 'pérdida'
    ].some((k) => mot.includes(k));

    const isInconsistenciaDoc = [
      'diferencia', 'error', 'duplicidad', 'duplicad', 'precio', 'factura', 'facturación',
      'facturacion', 'descuadre', 'cobro', 'descuento', 'orden de compra'
    ].some((k) => mot.includes(k));

    let motivoPts = 10;
    let motivoLabel = 'Ajuste comercial ordinario';
    if (isAfectacionFisica) {
      motivoPts = 35;
      motivoLabel = 'Afectación física de inventario (merma / avería / faltante)';
    } else if (isInconsistenciaDoc) {
      motivoPts = 20;
      motivoLabel = 'Inconsistencia administrativa / factura';
    }
    score += motivoPts;

    const isProvCritico = Number(createForm.data.compania_id) === 4 || Number(createForm.data.compania_id) === 6;
    const provPts = isProvCritico ? 15 : 0;
    score += provPts;

    score = Math.min(score, 100);
    return {
      score,
      level: score >= 70 ? 'ALTO' : score >= 40 ? 'MEDIO' : 'BAJO',
      montoUSD,
      tasa,
      montoPts,
      montoLabel,
      motivoPts,
      motivoLabel,
      provPts,
      isProvCritico,
    };
  };

  const renderAuditComment = (comentario: string) => {
    if (!comentario) return null;
    const parts = comentario.split(/(?<=\))\.\s+|\.\s+(?=[A-ZÁÉÍÓÚ])/).filter(Boolean);
    if (parts.length > 1) {
      return (
        <ul className="mt-1.5 space-y-1">
          {parts.map((p, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 leading-snug">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <span>{p.trim().replace(/\.$/, '')}</span>
            </li>
          ))}
        </ul>
      );
    }
    return (
      <div className="flex items-start gap-2 text-[11px] text-slate-700 mt-1 leading-snug">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
        <span>{comentario}</span>
      </div>
    );
  };

  const getStatusBadge = (estado: string, requiereDoble?: boolean) => {
    switch (estado) {
      case 'aprobada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Aprobada
          </span>
        );
      case 'aprobada_parcial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 animate-pulse">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Aprobación 1/2
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
            <Clock className="w-3.5 h-3.5" />
            {requiereDoble ? 'Pendiente (Dual)' : 'Pendiente'}
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
              <span>Módulo de Control & Gestión</span>
            </div>
            <h1 className="text-2xl font-black text-[#002B66] tracking-tight">
              Flujo de Notas de Crédito & Control Interno
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Registro comercial, evaluación de riesgo financiero y trazabilidad de autorizaciones con Segregación de Funciones.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
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
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3">Tienda</th>
                  <th className="py-3 px-3">Proveedor</th>
                  <th className="py-3 px-3">Monto</th>
                  <th className="py-3 px-3">Dpto</th>
                  <th className="py-3 px-3">Riesgo</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notas.map((nota) => (
                  <tr key={nota.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                      #{nota.id}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                      {nota.fechaCreacion?.substring(0, 10)}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                      <span className="truncate block max-w-[130px]" title={nota.tienda?.nombre}>
                        {nota.tienda?.nombre}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      <span className="truncate block max-w-[160px]" title={nota.compania?.nombre}>
                        {nota.compania?.nombre}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-black text-slate-900 whitespace-nowrap">
                      <div>
                        {nota.moneda === 'USD' ? '$ ' : 'Bs. '}
                        {Number(nota.monto).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      {nota.moneda === 'VES' && nota.tasaCambioBcv && (
                        <div className="text-[10px] text-blue-600 font-semibold tracking-tight">
                          ≈ ${Number(nota.montoUsdEquivalente).toFixed(2)} USD
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                        {nota.departamentoResponsable === 'Cuentas por Pagar' ? 'CxP' : 'CxC'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {getRiskBadge(nota.riskLevel, nota.riskScore)}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {getStatusBadge(nota.estado, nota.requiereDobleAprobacion)}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedNota(nota)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-[#002B66] text-blue-700 hover:text-white font-bold transition-all text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver</span>
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
        {/* MODAL 1: DETALLE Y EXPEDIENTE DE NOTA DE CRÉDITO                   */}
        {/* =================================================================== */}
        {selectedNota && (() => {
          const isCreator = selectedNota.creadoPorId === currentUser?.id;
          const isColaborador = currentUser?.rol === 'colaborador';
          const isResolved = selectedNota.estado === 'aprobada' || selectedNota.estado === 'rechazada';
          const alreadySignedFirst =
            selectedNota.estado === 'aprobada_parcial' && selectedNota.primerAprobadorId === currentUser?.id;
          const canUserApprove = !isResolved && !isCreator && !isColaborador && !alreadySignedFirst;

          return (
            <div className="fixed inset-x-0 bottom-0 top-16 bg-slate-900/50 backdrop-blur-sm z-40 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[calc(100vh-6rem)] overflow-y-auto p-6 sm:p-7 space-y-4 animate-in fade-in zoom-in-95 my-auto">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                        Expediente #{selectedNota.id}
                      </span>
                      {getStatusBadge(selectedNota.estado, selectedNota.requiereDobleAprobacion)}
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mt-1">
                      {selectedNota.compania?.nombre}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedNota.tienda?.nombre} ({selectedNota.tienda?.pais})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedNota(null)}
                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Resumen de Datos Clave (4 Tarjetas Independientes y Modernas) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  {/* Tarjeta 1: Monto Solicitado */}
                  <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 flex flex-col justify-between shadow-xs">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                      Monto Solicitado
                    </span>
                    <div className="mt-1.5">
                      <span className="text-sm font-black text-[#002B66] block leading-tight">
                        {selectedNota.moneda === 'USD' ? '$ ' : 'Bs. '}
                        {Number(selectedNota.monto).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </span>
                      {selectedNota.moneda === 'VES' && selectedNota.montoUsdEquivalente && (
                        <span className="text-[11px] text-blue-700 font-black block mt-0.5">
                          ≈ ${Number(selectedNota.montoUsdEquivalente).toFixed(2)} USD
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tarjeta 2: Tasa Oficial BCV o Moneda */}
                  <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 flex flex-col justify-between shadow-xs">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                      {selectedNota.moneda === 'VES' ? 'Tasa Oficial BCV' : 'Moneda Operación'}
                    </span>
                    <div className="mt-1.5">
                      <span className="text-xs font-black text-slate-800 block leading-tight">
                        {selectedNota.moneda === 'VES'
                          ? `Bs. ${Number(selectedNota.tasaCambioBcv || 893.22).toFixed(2)}/USD`
                          : 'Dólares (USD $)'}
                      </span>
                      {selectedNota.moneda === 'VES' ? (
                        <span className="text-[10px] text-emerald-700 font-bold inline-flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          Banco Central
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                          Moneda Fuerte
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tarjeta 3: Departamento */}
                  <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 flex flex-col justify-between shadow-xs">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                      Departamento
                    </span>
                    <div className="mt-1.5">
                      <span className="text-xs font-black text-slate-800 block leading-tight">
                        {selectedNota.departamentoResponsable}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                        {selectedNota.departamentoResponsable?.includes('Pagar') ? 'Cuentas por Pagar' : 'Cuentas por Cobrar'}
                      </span>
                    </div>
                  </div>

                  {/* Tarjeta 4: Riesgo Control */}
                  <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 flex flex-col justify-between shadow-xs">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                      Riesgo Control
                    </span>
                    <div className="mt-1.5">
                      {getRiskBadge(selectedNota.riskLevel, selectedNota.riskScore)}
                    </div>
                  </div>
                </div>

                {/* Barra de Progreso DOA (Matriz de Delegación de Autoridad) */}
                <div className="p-3.5 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-slate-50 rounded-2xl border border-blue-200/70 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#002B66]">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>
                        {selectedNota.requiereDobleAprobacion
                          ? 'Flujo de Doble Aprobación Requerida'
                          : 'Flujo Estándar de Supervisión (1 Firma)'}
                      </span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-blue-200 text-blue-800 shadow-2xs">
                      {selectedNota.requiereDobleAprobacion ? '2 Firmas Requeridas' : '1 Firma Requerida'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                    {/* Paso 1: Solicitud */}
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-200 flex items-start gap-2 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 block">1. Registro Solicitud</span>
                        <span className="text-[10px] text-slate-500 block truncate" title={selectedNota.creador?.nombreCompleto}>
                          {selectedNota.creador?.nombreCompleto || 'Colaborador'}
                        </span>
                      </div>
                    </div>

                    {/* Paso 2: 1ra Firma */}
                    <div className={`p-2.5 bg-white rounded-xl border flex items-start gap-2 shadow-2xs ${
                      selectedNota.fechaPrimeraAprobacion ? 'border-emerald-200' : selectedNota.estado === 'rechazada' ? 'border-red-200' : 'border-amber-200 bg-amber-50/30'
                    }`}>
                      {selectedNota.fechaPrimeraAprobacion ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : selectedNota.estado === 'rechazada' ? (
                        <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-spin" />
                      )}
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 block">
                          {selectedNota.requiereDobleAprobacion ? '2. Primera Firma (1/2)' : '2. Aprobación Jefatura'}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate" title={selectedNota.primerAprobador?.nombreCompleto}>
                          {selectedNota.primerAprobador
                            ? `${selectedNota.primerAprobador.nombreCompleto}`
                            : selectedNota.estado === 'rechazada' ? 'Rechazada' : 'En espera de firma'}
                        </span>
                      </div>
                    </div>

                    {/* Paso 3: 2da Firma */}
                    {selectedNota.requiereDobleAprobacion ? (
                      <div className={`p-2.5 bg-white rounded-xl border flex items-start gap-2 shadow-2xs ${
                        selectedNota.fechaSegundaAprobacion ? 'border-emerald-200' : selectedNota.estado === 'rechazada' ? 'border-red-200' : 'border-slate-200'
                      }`}>
                        {selectedNota.fechaSegundaAprobacion ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : selectedNota.estado === 'rechazada' ? (
                          <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 block">3. Ratificación Final (2/2)</span>
                          <span className="text-[10px] text-slate-500 block truncate" title={selectedNota.segundoAprobador?.nombreCompleto}>
                            {selectedNota.segundoAprobador
                              ? `${selectedNota.segundoAprobador.nombreCompleto}`
                              : selectedNota.estado === 'aprobada_parcial' ? 'Listo para 2da Firma' : 'En espera de 1ra firma'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-slate-50/50 rounded-xl border border-slate-200/60 flex items-start gap-2 opacity-60">
                        <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-600 block">3. Desembolso Contable</span>
                          <span className="text-[10px] text-slate-400 block">Automático al aprobar</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Motivo Comercial Registrado */}
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Motivo Comercial Registrado
                  </h4>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-800 font-medium leading-relaxed">
                    "{selectedNota.motivo}"
                  </div>
                </div>

                {/* Evaluación de Riesgo con Viñetas Verticales (Punto por Punto) */}
                <div className="p-3.5 rounded-2xl border border-blue-100 bg-blue-50/60 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs">Criterios de Riesgo Evaluados</span>
                  </div>
                  <ul className="space-y-1.5 pl-0.5">
                    {selectedNota.riskJustification
                      ? selectedNota.riskJustification.split(' • ').map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 leading-snug">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                            <span>{item.trim()}</span>
                          </li>
                        ))
                      : (
                          <li className="flex items-start gap-2 text-[11px] text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                            <span>Evaluación estándar del despacho comercial.</span>
                          </li>
                        )}
                  </ul>
                </div>

                {/* Historial de Auditoría Punto por Punto */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Historial de Auditoría
                  </h4>
                  <div className="border-l-2 border-blue-200 ml-2.5 pl-3.5 space-y-3">
                    {selectedNota.auditorias?.map((aud) => (
                      <div key={aud.id} className="relative text-xs">
                        <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white shadow-sm" />
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">
                            {aud.accion === 'creacion'
                              ? 'Registro de Solicitud'
                              : aud.accion === 'primera_aprobacion'
                              ? 'Primera Firma (1/2)'
                              : aud.accion === 'aprobacion_final'
                              ? 'Segunda Firma de Aprobación (2/2)'
                              : `Resolución: ${aud.estadoNuevo?.toUpperCase()}`}
                          </span>
                          <span className="text-[10px] text-slate-400">{aud.fecha?.substring(0, 16)}</span>
                        </div>
                        {renderAuditComment(aud.comentario)}
                        {aud.usuario && (
                          <p className="text-[10px] text-blue-700 font-semibold mt-1">
                            Operado por: {aud.usuario.nombreCompleto} ({aud.usuario.rol?.toUpperCase()})
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Panel de Dictamen (Solo visible si el usuario tiene facultad de aprobar) */}
                {canUserApprove && (
                  <div className="pt-3 border-t border-slate-100 space-y-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <span>
                        {selectedNota.requiereDobleAprobacion && selectedNota.estado === 'pendiente'
                          ? 'Emitir 1ra Firma de Aprobación (1/2)'
                          : selectedNota.requiereDobleAprobacion && selectedNota.estado === 'aprobada_parcial'
                          ? 'Emitir 2da Firma de Aprobación Final (2/2)'
                          : 'Dictamen de Jefatura (Autorización / Rechazo)'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                        Comentario de Resolución
                      </label>
                      <input
                        type="text"
                        value={resolveForm.data.comentario}
                        onChange={(e) => resolveForm.setData('comentario', e.target.value)}
                        placeholder={
                          selectedNota.requiereDobleAprobacion && selectedNota.estado === 'aprobada_parcial'
                            ? 'ej. Visto bueno gerencial verificado conforme con soportes fiscales...'
                            : 'ej. Validado soporte con guía de recepción física en tienda...'
                        }
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleResolve('aprobada')}
                        className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {selectedNota.requiereDobleAprobacion && selectedNota.estado === 'pendiente'
                            ? 'Autorizar 1ra Firma (1/2)'
                            : selectedNota.requiereDobleAprobacion && selectedNota.estado === 'aprobada_parcial'
                            ? 'Ratificar Aprobación Final (2/2)'
                            : 'Aprobar Solicitud'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleResolve('rechazada')}
                        className="flex-1 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-600/20"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Rechazar Solicitud</span>
                      </button>
                    </div>
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
          );
        })()}

        {/* =================================================================== */}
        {/* MODAL 2: CREACIÓN DE NUEVA NOTA DE CRÉDITO                          */}
        {/* =================================================================== */}
        {showCreateModal && (
          <div className="fixed inset-x-0 bottom-0 top-16 bg-slate-900/50 backdrop-blur-sm z-40 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto animate-in fade-in zoom-in-95 my-auto">
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

              <form onSubmit={handleCreateSubmit} className="space-y-3.5">
                {/* Tienda */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tienda Destino</label>
                  <select
                    required
                    value={createForm.data.tienda_id}
                    onChange={(e) => createForm.setData('tienda_id', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                  >
                    <option value="" disabled>-- Seleccione una tienda --</option>
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
                    required
                    value={createForm.data.compania_id}
                    onChange={(e) => createForm.setData('compania_id', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                  >
                    <option value="" disabled>-- Seleccione una compañía proveedora --</option>
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
                    required
                    value={createForm.data.departamento_responsable}
                    onChange={(e) => createForm.setData('departamento_responsable', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                  >
                    <option value="" disabled>-- Seleccione departamento responsable --</option>
                    <option value="Cuentas por Pagar">Cuentas por Pagar (Proveedores)</option>
                    <option value="Cuentas por Cobrar">Cuentas por Cobrar (Clientes/Disputas)</option>
                  </select>
                </div>

                {/* Previsualización en Vivo del Risk Score con Tasa BCV Oficial */}
                {createForm.data.monto && (() => {
                  const pScore = previewScore();
                  return (
                    <div className="p-3.5 bg-gradient-to-br from-blue-50/80 to-slate-50 border border-blue-200/80 rounded-2xl space-y-2.5 text-xs shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-[#002B66]">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <span>Previsualización de Riesgo en Vivo:</span>
                        </div>
                        {getRiskBadge(pScore.level, pScore.score)}
                      </div>

                      {/* Recuadro Circular de Conversión Oficial BCV */}
                      {createForm.data.moneda === 'VES' && (
                        <div className="p-3 bg-white rounded-2xl border border-blue-100 shadow-xs space-y-1">
                          <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <span className="text-sm">💱</span>
                            <span>
                              Conversión Oficial BCV:{' '}
                              <strong className="text-blue-900 font-black">
                                Bs. {Number(createForm.data.monto).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                              </strong>{' '}
                              ≈{' '}
                              <strong className="text-emerald-700 font-black">
                                ${pScore.montoUSD.toFixed(2)} USD
                              </strong>
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium pl-6">
                            Tasa oficial del día:{' '}
                            <strong className="text-slate-700">Bs. {pScore.tasa.toFixed(2)} / USD</strong>{' '}
                            <span className="text-emerald-600 font-semibold">(Verificada en Banco Central de Venezuela)</span>
                          </div>
                        </div>
                      )}

                      {/* Desglose dinámico de factores evaluados */}
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        <span className="px-2 py-0.5 rounded-lg bg-blue-100/70 text-blue-800 text-[10px] font-bold">
                          Monto: +{pScore.montoPts} pts ({pScore.montoLabel})
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-100/70 text-indigo-800 text-[10px] font-bold">
                          Motivo: +{pScore.motivoPts} pts
                        </span>
                        {pScore.isProvCritico ? (
                          <span className="px-2 py-0.5 rounded-lg bg-red-100 text-red-800 text-[10px] font-black border border-red-200">
                            Proveedor Alta Incidencia: +15 pts
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-lg bg-slate-200/70 text-slate-700 text-[10px] font-medium">
                            Proveedor Neutro: +0 pts
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
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
