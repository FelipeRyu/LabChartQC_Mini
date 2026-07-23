import React, { useState, useMemo } from 'react';
import { type MaterialControl, type Corrida, type AlertaWestgard } from '../constants/types';
import { AREAS } from '../constants/config';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEstadoQC } from '../store/useEstadoQC';
import {
  obtenerMateriales, guardarMaterial, eliminarMaterial,
  obtenerCorridas, guardarCorridas,
  obtenerAlertas, resolverAlerta
} from '../services/api';
import { RegistroControl } from './RegistroControl';
import { RegistroCorridas } from './RegistroCorridas';
import { BitacoraCalidad } from './BitacoraCalidad';
import { GraficoLeveyJennings } from './GraficoLeveyJennings';
import { BarraNavegacion } from '../components/layout/BarraNavegacion';
import { BarraLateral } from '../components/layout/BarraLateral';
import {
  FlaskConical,
  AlertTriangle,
  Calendar,
  Layers,
  CheckCircle,
  Clock,
  ShieldAlert,
  Trash2,
  Edit
} from 'lucide-react';

export const PanelPrincipal: React.FC = () => {
  const clienteConsultas = useQueryClient();

  // 1. Estado Local desde Zustand
  const {
    pestanaActiva, setPestanaActiva,
    filtroAreaSeleccionada, setFiltroAreaSeleccionada,
    materialEnEdicion, setMaterialEnEdicion
  } = useEstadoQC();

  // 2. Data Fetching con React Query (Server State)
  const { data: materiales = [], isLoading: estaCargandoMateriales } = useQuery({
    queryKey: ['materiales'],
    queryFn: obtenerMateriales
  });

  const { data: corridas = [], isLoading: estaCargandoCorridas } = useQuery({
    queryKey: ['corridas'],
    queryFn: obtenerCorridas
  });

  const { data: alertas = [], isLoading: estaCargandoAlertas } = useQuery({
    queryKey: ['alertas'],
    queryFn: obtenerAlertas
  });

  // Estados interactivos para resolución de alertas
  const [alertaEnResolucion, setAlertaEnResolucion] = useState<AlertaWestgard | null>(null);
  const [textoAccionResolucion, setTextoAccionResolucion] = useState("");

  // Fecha actual de referencia del sistema (usa fecha real)
  const CURRENT_DATE = useMemo(() => new Date(), []);

  // Cálculos derivados memorizados para optimizar rendimiento
  const materialesVigentes = useMemo(
    () => materiales.filter(m => new Date(m.fecha_vencimiento) >= CURRENT_DATE && m.activo),
    [materiales]
  );

  const materialesVencidos = useMemo(
    () => materiales.filter(m => new Date(m.fecha_vencimiento) < CURRENT_DATE),
    [materiales]
  );

  const materialesFiltradosArea = useMemo(
    () => materialesVigentes.filter(m => m.area_id === filtroAreaSeleccionada),
    [materialesVigentes, filtroAreaSeleccionada]
  );

  // 3. Mutaciones (React Query)
  const mutacionGuardarMaterial = useMutation({
    mutationFn: guardarMaterial,
    onSuccess: (nuevoMaterial) => {
      clienteConsultas.invalidateQueries({ queryKey: ['materiales'] });
      toast.success(`Control "${nuevoMaterial.nombre_material}" registrado correctamente`);
      setPestanaActiva('resumen');
      setMaterialEnEdicion(null);
    },
    onError: () => toast.error('Error al guardar el material')
  });

  const mutacionEliminarMaterial = useMutation({
    mutationFn: eliminarMaterial,
    onSuccess: () => {
      clienteConsultas.invalidateQueries({ queryKey: ['materiales'] });
      toast.success('Material de control eliminado correctamente');
    }
  });

  const mutacionGuardarCorridas = useMutation({
    mutationFn: guardarCorridas,
    onSuccess: (nuevas) => {
      clienteConsultas.invalidateQueries({ queryKey: ['corridas'] });
      toast.success(`¡Se registraron ${nuevas.length} corridas con éxito!`);
      setPestanaActiva('bitacora');
    }
  });

  const mutacionResolverAlerta = useMutation({
    mutationFn: ({ id, accion }: { id: number; accion: string }) => resolverAlerta(id, accion),
    onSuccess: () => {
      clienteConsultas.invalidateQueries({ queryKey: ['alertas'] });
      clienteConsultas.invalidateQueries({ queryKey: ['corridas'] });
      toast.success('¡Alerta de Westgard resuelta con éxito!');
      setAlertaEnResolucion(null);
      setTextoAccionResolucion("");
    }
  });

  // Handlers
  const manejarGuardarNuevoMaterial = (nuevoMaterial: MaterialControl) => {
    mutacionGuardarMaterial.mutate(nuevoMaterial);
  };

  const manejarGuardarNuevasCorridas = (nuevas: Corrida[]) => {
    mutacionGuardarCorridas.mutate(nuevas);
  };

  const manejarEliminarMaterial = (materialId: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este material de control vencido?")) {
      mutacionEliminarMaterial.mutate(materialId);
    }
  };

  const manejarIniciarEdicionMaterial = (mat: MaterialControl) => {
    setMaterialEnEdicion(mat);
    setPestanaActiva('ingreso');
  };

  const manejarConfirmarResolucionAlerta = () => {
    if (!alertaEnResolucion) return;
    mutacionResolverAlerta.mutate({ id: alertaEnResolucion.id, accion: textoAccionResolucion });
  };

  const estaCargandoGlobalmente = estaCargandoMateriales || estaCargandoCorridas || estaCargandoAlertas;

  return (
    <main className="min-h-screen bg-[#070a13] font-sans text-slate-100 bg-mesh relative pb-12">
      {/* Círculos de luz decorativos */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-slate-800/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-900/5 rounded-full blur-[120px] pointer-events-none"></div>

      <BarraNavegacion />

      {/* Contenido Principal */}
      <section className="relative z-10 max-w-full mx-auto px-4 sm:px-8 xl:px-12 py-8">

        {estaCargandoGlobalmente && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#070a13]/80 backdrop-blur-sm min-h-[50vh]">
            <div className="flex flex-col items-center animate-pulse">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-blue-400 font-semibold tracking-widest uppercase text-sm">Cargando Datos QC...</p>
            </div>
          </div>
        )}

        {/* Contenedor Grid Principal para Sidebar y Contenido */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <BarraLateral pestanaActiva={pestanaActiva} setPestanaActiva={setPestanaActiva} />

          {/* Área de Contenido Principal a la Derecha */}
          <div className="flex-1 w-full min-w-0">
            {pestanaActiva === 'resumen' && (
              <div className="space-y-8">

                {/* Grid de Resumen Superior */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Alertas de Reglas Rotas */}
                  <div className="glass-panel rounded-2xl p-6 shadow-lg border border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 animate-pulse">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <span className="text-xs bg-red-950/50 text-red-400 font-bold px-2 py-0.5 rounded-full uppercase">
                        Crítico
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Reglas Westgard Rotas</p>
                    <p className="text-3xl font-extrabold text-white mt-1">{alertas.length}</p>
                    <p className="text-xs text-slate-500 mt-2">Corridas marcadas para rechazo analítico</p>
                  </div>

                  {/* Materiales Activos */}
                  <div className="glass-panel rounded-2xl p-6 shadow-lg border border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/50 text-blue-400">
                        <FlaskConical className="w-6 h-6" />
                      </div>
                      <span className="text-xs bg-blue-950/50 text-blue-400 font-bold px-2 py-0.5 rounded-full uppercase">
                        Vigentes
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Controles Activos</p>
                    <p className="text-3xl font-extrabold text-white mt-1">{materialesVigentes.length}</p>
                    <p className="text-xs text-slate-500 mt-2">Materiales aptos para control diario</p>
                  </div>

                  {/* Materiales Vencidos */}
                  <div className="glass-panel rounded-2xl p-6 shadow-lg border border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-900/50 text-amber-400">
                        <Clock className="w-6 h-6" />
                      </div>
                      <span className="text-xs bg-amber-950/50 text-amber-400 font-bold px-2 py-0.5 rounded-full uppercase">
                        Expirados
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Materiales Vencidos</p>
                    <p className="text-3xl font-extrabold text-white mt-1">{materialesVencidos.length}</p>
                    <p className="text-xs text-slate-500 mt-2">Viales fuera de fecha de caducidad</p>
                  </div>

                </div>

                {/* SECCIÓN 1: REGLAS DE WESTGARD ROTAS */}
                <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-800/80">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" /> Alertas Críticas: Reglas de Westgard Rotas
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                          <th className="py-3 px-4">Analito / Área</th>
                          <th className="py-3 px-4">Control / Lote</th>
                          <th className="py-3 px-4 text-center">Regla Viola</th>
                          <th className="py-3 px-4 text-right">Valor Obtenido</th>
                          <th className="py-3 px-4 text-right">Z-Score</th>
                          <th className="py-3 px-4 text-right">Configuración (Media &plusmn; DS)</th>
                          <th className="py-3 px-4 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alertas.length > 0 ? (
                          alertas.map((al) => (
                            <tr key={al.id} className="border-b border-slate-850 hover:bg-slate-900/30 transition-colors text-sm">
                              <td className="py-4 px-4">
                                <p className="font-bold text-white">{al.analito}</p>
                                <p className="text-slate-500 text-xs mt-0.5">{al.area}</p>
                              </td>
                              <td className="py-4 px-4 text-slate-300">
                                <p className="font-medium">{al.material}</p>
                                <p className="text-slate-500 text-xs mt-0.5">Lote: {al.lote} &bull; {al.nivel}</p>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className="inline-block px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 text-xs font-extrabold uppercase">
                                  {al.regla}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right font-extrabold text-slate-100">{al.valor}</td>
                              <td className="py-4 px-4 text-right">
                                <span className={`font-mono text-xs font-bold ${Math.abs(al.z_score) > 3 ? 'text-red-400' : 'text-amber-400'}`}>
                                  {al.z_score > 0 ? `+${al.z_score}` : al.z_score} SD
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right text-xs text-slate-400 font-mono">
                                {al.media.toFixed(2)} &plusmn; {al.ds.toFixed(2)}
                              </td>
                              <td className="py-4 px-4 text-center">
                                <button
                                  onClick={() => {
                                    setAlertaEnResolucion(al);
                                    setTextoAccionResolucion("");
                                  }}
                                  className="px-3.5 py-1.5 rounded-lg bg-blue-700/80 hover:bg-blue-600 border border-blue-900/40 text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-blue-950/40"
                                  title="Resolver Alerta de Westgard"
                                >
                                  Resolver
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                              ✨ ¡Felicidades! No hay alertas de calidad activas en este momento.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SECCIÓN 2: MATERIALES DE CONTROL ACTIVOS POR ÁREA */}
                <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-800/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-850 pb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-blue-400" /> Materiales de Control Activos
                    </h3>

                    {/* Selector de Áreas */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {AREAS.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => setFiltroAreaSeleccionada(a.id)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap tracking-wide transition-all cursor-pointer ${filtroAreaSeleccionada === a.id
                            ? 'bg-blue-950/50 text-blue-400 border border-blue-900/50'
                            : 'border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                            }`}
                        >
                          {a.nombre}
                        </button>
                      ))}
                    </div>
                  </div>

                  {materialesFiltradosArea.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {materialesFiltradosArea.map((mat) => (
                        <div key={mat.id_material} className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/80 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-white text-base">{mat.nombre_material}</h4>
                              <p className="text-slate-500 text-xs mt-0.5">Fabricante: {mat.fabricante}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => manejarIniciarEdicionMaterial(mat)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 bg-slate-800 text-[10px] font-bold tracking-wide transition-colors"
                              >
                                <Edit className="w-3 h-3" /> Editar
                              </button>
                              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 text-xs font-semibold whitespace-nowrap">
                                <Calendar className="w-3.5 h-3.5" /> Vence: {mat.fecha_vencimiento}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3 pt-2">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Niveles & Lotes Configurados:</span>
                            <div className="grid grid-cols-1 gap-2.5">
                              {mat.niveles.map((n, idx) => (
                                <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
                                  <div className="flex justify-between items-center text-xs font-semibold">
                                    <span className="text-blue-300">Nivel {n.nivel}</span>
                                    <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Lote: {n.lote}</span>
                                  </div>
                                  <div className="space-y-1.5">
                                    {n.analitosConfigurados.map((an, aIdx) => (
                                      <div key={aIdx} className="flex justify-between items-center text-xs font-mono text-slate-400 bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-slate-850">
                                        <span className="font-bold text-slate-300">{an.analito_nombre}</span>
                                        <span>{an.media} &plusmn; {an.ds} {an.unidad}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl">
                      <FlaskConical className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm font-semibold">No hay materiales de control configurados para esta área</p>
                      <p className="text-slate-500 text-xs mt-1">Haz clic en "Registrar Control" arriba para registrar uno nuevo</p>
                    </div>
                  )}
                </div>

                {/* SECCIÓN 3: MATERIALES DE CONTROL VENCIDOS */}
                <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-800/80">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-red-400" /> Alerta de Inventario: Materiales de Control Vencidos
                  </h3>

                  {materialesVencidos.length > 0 ? (
                    <div className="space-y-3.5">
                      {materialesVencidos.map((mv) => (
                        <div key={mv.id_material} className="p-4 rounded-xl bg-red-950/20 border border-red-900/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex gap-3 items-center">
                            <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 shrink-0">
                              <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-white">{mv.nombre_material}</p>
                              <p className="text-slate-500 text-xs mt-0.5">Área: {mv.area_nombre} &bull; Fabricante: {mv.fabricante}</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <p className="text-red-400 font-extrabold text-xs bg-red-950/40 border border-red-900/50 px-3 py-1 rounded-full uppercase tracking-wider">
                                Vencido el: {mv.fecha_vencimiento}
                              </p>
                              <p className="text-slate-500 text-[10px] mt-1.5">No usar para corridas analíticas de calidad</p>
                            </div>
                            <button
                              onClick={() => manejarEliminarMaterial(mv.id_material)}
                              className="p-2.5 rounded-xl border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                              title="Eliminar Material Vencido"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-slate-900/10 border border-slate-800 rounded-2xl">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-slate-400 text-xs font-semibold">¡Felicidades! Todos tus materiales de control están vigentes</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Pestaña: Registrar Control */}
            {pestanaActiva === 'ingreso' && (
              <RegistroControl
                materialEnEdicion={materialEnEdicion || undefined}
                onSave={manejarGuardarNuevoMaterial}
                onCancel={() => setPestanaActiva('resumen')}
              />
            )}

            {/* Pestaña: Ingresar Corridas Diarias */}
            {pestanaActiva === 'corridas' && (
              <RegistroCorridas
                materialesVigentes={materialesVigentes}
                onSave={manejarGuardarNuevasCorridas}
                onCancel={() => setPestanaActiva('resumen')}
              />
            )}

            {/* Pestaña: Bitácora de Resultados */}
            {pestanaActiva === 'bitacora' && (
              <BitacoraCalidad corridas={corridas} />
            )}

            {/* Pestaña: Gráficas Levey-Jennings */}
            {pestanaActiva === 'graficas' && (
              <GraficoLeveyJennings corridas={corridas} />
            )}

          </div>
        </div>

        {/* MODAL: Resolver Alerta de Westgard */}
        {alertaEnResolucion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#070a13]/80 backdrop-blur-sm" onClick={() => setAlertaEnResolucion(null)}></div>

            <div className="relative glass-panel rounded-2xl w-full max-w-md shadow-2xl border border-rose-900/40 p-6 animate-fadeIn">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" /> Resolver Alerta: {alertaEnResolucion.regla}
              </h3>
              <p className="text-slate-400 text-xs mb-5">
                Analito: <strong className="text-slate-300">{alertaEnResolucion.analito}</strong><br />
                Lote: {alertaEnResolucion.lote} (Nivel {alertaEnResolucion.nivel})
              </p>

              <div className="mb-6">
                <label htmlFor="resolvingAction" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Acción Correctiva Realizada
                </label>
                <textarea
                  id="resolvingAction"
                  className="w-full bg-slate-900 text-white border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all h-24 resize-none"
                  placeholder="Ej: Se repitió la corrida tras limpieza de aguja..."
                  value={textoAccionResolucion}
                  onChange={(e) => setTextoAccionResolucion(e.target.value)}
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setAlertaEnResolucion(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={manejarConfirmarResolucionAlerta}
                  disabled={textoAccionResolucion.trim().length === 0}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-rose-950/30 cursor-pointer"
                >
                  Confirmar y Registrar
                </button>
              </div>
            </div>
          </div>
        )}

      </section>
    </main>
  );
};
