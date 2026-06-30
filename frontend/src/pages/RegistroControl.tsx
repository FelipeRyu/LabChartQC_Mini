import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AREAS, ANALITOS_POR_AREA, type MaterialControl } from '../constants/mockData';
import { ChevronRight, ChevronLeft, Save, Plus, Edit } from 'lucide-react';

interface RegistroControlProps {
  materialEnEdicion?: MaterialControl;
  onSave: (nuevoMaterial: MaterialControl) => void;
  onCancel: () => void;
}

/**
 * Componente: RegistroControl
 * Responsabilidad: Wizard (Asistente) de 3 pasos para registrar o editar un material de control.
 * Se implementa con etiquetas HTML5 semánticas (<form>, <fieldset>, <legend>) para mayor accesibilidad.
 */
export const RegistroControl: React.FC<RegistroControlProps> = ({ materialEnEdicion, onSave, onCancel }) => {
  const [pasoActual, setPasoActual] = useState(1);

  // Paso 1 State (Información Básica)
  const [nombre, setNombre] = useState('');
  const [areaId, setAreaId] = useState(1);
  const [fabricante, setFabricante] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [nivelesActivos, setNivelesActivos] = useState<Record<number, boolean>>({ 1: true, 2: false, 3: false });
  const [lotesNivel, setLotesNivel] = useState<Record<number, string>>({ 1: '', 2: '', 3: '' });

  // Paso 2 State (Analitos y unidades)
  const [analitosSeleccionados, setAnalitosSeleccionados] = useState<Record<number, boolean>>({});
  const [unidadesAnalito, setUnidadesAnalito] = useState<Record<number, string>>({});

  // Paso 3 State (Media y DS)
  const [configuraciones, setConfiguraciones] = useState<Record<string, { media: string; ds: string }>>({});

  // Efecto para inicializar datos si es modo edición
  useEffect(() => {
    if (materialEnEdicion) {
      setNombre(materialEnEdicion.nombre_material);
      setAreaId(materialEnEdicion.area_id);
      setFabricante(materialEnEdicion.fabricante);
      setFechaVencimiento(materialEnEdicion.fecha_vencimiento);
      
      const sigNivelesActivos: Record<number, boolean> = { 1: false, 2: false, 3: false };
      const sigLotes: Record<number, string> = { 1: '', 2: '', 3: '' };
      const sigConfiguraciones: Record<string, { media: string; ds: string }> = {};
      const sigAnalitosSeleccionados: Record<number, boolean> = {};
      const sigUnidadesAnalito: Record<number, string> = {};

      materialEnEdicion.niveles.forEach(n => {
        sigNivelesActivos[n.nivel] = true;
        sigLotes[n.nivel] = n.lote;
        n.analitosConfigurados.forEach(a => {
          sigAnalitosSeleccionados[a.analito_id] = true;
          sigUnidadesAnalito[a.analito_id] = a.unidad;
          sigConfiguraciones[`${a.analito_id}-${n.nivel}`] = {
            media: a.media.toString(),
            ds: a.ds.toString()
          };
        });
      });

      setNivelesActivos(sigNivelesActivos);
      setLotesNivel(sigLotes);
      setAnalitosSeleccionados(sigAnalitosSeleccionados);
      setUnidadesAnalito(sigUnidadesAnalito);
      setConfiguraciones(sigConfiguraciones);
    }
  }, [materialEnEdicion]);

  // Manejadores Memoizados para optimizar rendimiento (DRY y Performance)
  const alternarNivel = useCallback((lvl: number) => {
    setNivelesActivos(prev => ({ ...prev, [lvl]: !prev[lvl] }));
  }, []);

  const cambiarLote = useCallback((lvl: number, value: string) => {
    setLotesNivel(prev => ({ ...prev, [lvl]: value }));
  }, []);

  const alternarAnalito = useCallback((id: number, unidadPorDefecto: string) => {
    setAnalitosSeleccionados(prev => {
      const estaSeleccionado = !prev[id];
      if (estaSeleccionado) {
        setUnidadesAnalito(unidades => ({ ...unidades, [id]: unidades[id] || unidadPorDefecto }));
      }
      return { ...prev, [id]: estaSeleccionado };
    });
  }, []);

  const cambiarUnidad = useCallback((id: number, value: string) => {
    setUnidadesAnalito(prev => ({ ...prev, [id]: value }));
  }, []);

  const cambiarConfiguracion = useCallback((analitoId: number, lvl: number, field: 'media' | 'ds', value: string) => {
    const key = `${analitoId}-${lvl}`;
    setConfiguraciones(prev => ({
      ...prev,
      [key]: { ...(prev[key] || { media: '', ds: '' }), [field]: value }
    }));
  }, []);

  // Validaciones
  const esPaso1Valido = useMemo(() => {
    const tieneNombre = nombre.trim().length > 0;
    const tieneVencimiento = fechaVencimiento.trim().length > 0;
    const tieneNivelActivo = Object.values(nivelesActivos).some(Boolean);
    const lotesValidos = Object.entries(nivelesActivos).every(([lvl, activo]) => 
      !activo || lotesNivel[Number(lvl)].trim().length > 0
    );
    return tieneNombre && tieneVencimiento && tieneNivelActivo && lotesValidos;
  }, [nombre, fechaVencimiento, nivelesActivos, lotesNivel]);

  const esPaso2Valido = useMemo(() => Object.values(analitosSeleccionados).some(Boolean), [analitosSeleccionados]);

  const esPaso3Valido = useMemo(() => {
    const niveles = Object.entries(nivelesActivos).filter(([, activo]) => activo).map(([lvl]) => Number(lvl));
    const analitos = Object.entries(analitosSeleccionados).filter(([, sel]) => sel).map(([id]) => Number(id));

    return analitos.every(analitoId => 
      niveles.every(lvl => {
        const config = configuraciones[`${analitoId}-${lvl}`];
        return config && config.media && !isNaN(Number(config.media)) && config.ds && !isNaN(Number(config.ds));
      })
    );
  }, [nivelesActivos, analitosSeleccionados, configuraciones]);

  const manejarSiguiente = () => {
    if (pasoActual === 1 && esPaso1Valido) setPasoActual(2);
    else if (pasoActual === 2 && esPaso2Valido) setPasoActual(3);
  };

  const manejarAtras = () => {
    if (pasoActual > 1) setPasoActual(prev => prev - 1);
  };

  const manejarGuardado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!esPaso3Valido) return;

    const areaObj = AREAS.find(a => a.id === areaId);
    const niveles = Object.entries(nivelesActivos).filter(([, activo]) => activo).map(([lvl]) => Number(lvl));
    const analitos = Object.entries(analitosSeleccionados).filter(([, sel]) => sel).map(([id]) => Number(id));

    const materialNiveles = niveles.map(lvl => ({
      nivel: lvl,
      lote: lotesNivel[lvl],
      analitosConfigurados: analitos.map(analitoId => {
        const analitoMeta = ANALITOS_POR_AREA[areaId].find(a => a.id_analito === analitoId);
        const configVal = configuraciones[`${analitoId}-${lvl}`];
        return {
          analito_id: analitoId,
          analito_nombre: analitoMeta?.nombre || 'Analito',
          unidad: unidadesAnalito[analitoId] || 'mg/dL',
          media: Number(configVal.media),
          ds: Number(configVal.ds)
        };
      })
    }));

    onSave({
      id_material: materialEnEdicion?.id_material || Date.now(),
      area_id: areaId,
      area_nombre: areaObj?.nombre || 'Otra Área',
      nombre_material: nombre,
      fabricante: fabricante || 'Genérico',
      fecha_vencimiento: fechaVencimiento,
      activo: true,
      niveles: materialNiveles
    });
  };

  const listaAnalitosActivos = ANALITOS_POR_AREA[areaId] || [];

  return (
    <section className="glass-panel rounded-2xl p-8 shadow-xl max-w-4xl mx-auto border border-slate-800/80 animate-fadeIn">
      {/* Cabecera del Wizard */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-850 pb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            {materialEnEdicion ? (
              <><Edit className="w-5 h-5 text-blue-400" /> Editar Material de Control</>
            ) : (
              <><Plus className="w-5 h-5 text-blue-400" /> Ingresar Nuevo Material de Control</>
            )}
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            {materialEnEdicion ? 'Modifica los lotes, analitos y límites definidos' : 'Configuración manual de lotes, analitos y límites'}
          </p>
        </div>

        {/* Indicadores de Pasos */}
        <nav aria-label="Progreso del formulario" className="flex items-center gap-3">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  pasoActual === num
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 scale-110'
                    : pasoActual > num
                      ? 'bg-emerald-950/40 border border-emerald-900/50 text-emerald-400'
                      : 'bg-slate-800/80 border border-slate-700/50 text-slate-500'
                }`}
              >
                {pasoActual > num ? '✓' : num}
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-wider hidden sm:block ${pasoActual === num ? 'text-blue-400' : 'text-slate-500'}`}>
                {num === 1 ? 'Básicos' : num === 2 ? 'Analitos' : 'Valores'}
              </span>
              {num < 3 && <div className="w-6 h-px bg-slate-800"></div>}
            </div>
          ))}
        </nav>
      </header>

      {/* Formulario Semántico */}
      <form onSubmit={manejarGuardado}>
        {/* PASO 1: INFORMACIÓN BÁSICA */}
        {pasoActual === 1 && (
          <fieldset className="space-y-6">
            <legend className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4">Paso 1: Información básica del control</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="nombre" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Nombre del Material</label>
                <input
                  id="nombre"
                  type="text"
                  placeholder="Ej. LiquidCheck Hemo"
                  className="px-4 py-3 rounded-xl glass-input text-sm"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="area" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Área del Laboratorio</label>
                <select
                  id="area"
                  className="px-4 py-3 rounded-xl glass-input text-sm bg-[#0a0f1d]"
                  value={areaId}
                  onChange={(e) => {
                    setAreaId(Number(e.target.value));
                    setAnalitosSeleccionados({});
                  }}
                >
                  {AREAS.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="fabricante" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Casa Comercial / Fabricante</label>
                <input
                  id="fabricante"
                  type="text"
                  placeholder="Ej. Bio-Rad Laboratories"
                  className="px-4 py-3 rounded-xl glass-input text-sm"
                  value={fabricante}
                  onChange={(e) => setFabricante(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="fecha" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Fecha de Vencimiento</label>
                <input
                  id="fecha"
                  type="date"
                  className="px-4 py-3 rounded-xl glass-input text-sm cursor-pointer"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                />
              </div>
            </div>

            <fieldset className="border-t border-slate-850 pt-5 mt-6">
              <legend className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">Niveles a Configurar y Números de Lote</legend>
              <div className="space-y-4">
                {[1, 2, 3].map((lvl) => (
                  <div key={lvl} className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/40">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none min-w-[140px]">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                        checked={nivelesActivos[lvl]}
                        onChange={() => alternarNivel(lvl)}
                      />
                      <span className="text-sm font-semibold text-slate-200">Nivel {lvl}</span>
                    </label>

                    {nivelesActivos[lvl] && (
                      <div className="flex-1 flex items-center gap-2.5 animate-fadeIn">
                        <label htmlFor={`lote-${lvl}`} className="text-xs text-slate-400 whitespace-nowrap">Lote:</label>
                        <input
                          id={`lote-${lvl}`}
                          type="text"
                          placeholder={`Ej. Lote Nivel ${lvl}`}
                          className="w-full max-w-xs px-3.5 py-1.5 rounded-lg glass-input text-xs"
                          value={lotesNivel[lvl]}
                          onChange={(e) => cambiarLote(lvl, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </fieldset>
          </fieldset>
        )}

        {/* PASO 2: ASIGNACIÓN DE ANALITOS */}
        {pasoActual === 2 && (
          <fieldset className="space-y-6">
            <legend className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">Paso 2: Selección de analitos y unidades</legend>
            <p className="text-slate-400 text-xs mb-4">Filtro aplicado por área: <span className="text-white font-semibold">{AREAS.find(a => a.id === areaId)?.nombre}</span></p>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
              {listaAnalitosActivos.map((an) => (
                <div key={an.id_analito} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-slate-800/40 hover:border-slate-800 transition-colors">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-4.5 h-4.5 accent-blue-600 rounded cursor-pointer"
                      checked={!!analitosSeleccionados[an.id_analito]}
                      onChange={() => alternarAnalito(an.id_analito, an.unidades[0])}
                    />
                    <span className="text-sm font-bold text-white">{an.nombre}</span>
                  </label>

                  {analitosSeleccionados[an.id_analito] && (
                    <div className="flex items-center gap-2 animate-fadeIn">
                      <label htmlFor={`unidad-${an.id_analito}`} className="text-xs text-slate-400">Unidad:</label>
                      <select
                        id={`unidad-${an.id_analito}`}
                        className="px-3 py-1.5 rounded-lg glass-input text-xs bg-[#0a0f1d] cursor-pointer"
                        value={unidadesAnalito[an.id_analito]}
                        onChange={(e) => cambiarUnidad(an.id_analito, e.target.value)}
                      >
                        {an.unidades.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </fieldset>
        )}

        {/* PASO 3: VALORES DE MEDIA Y DS */}
        {pasoActual === 3 && (
          <fieldset className="space-y-6">
            <legend className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">Paso 3: Asignar valores (Media y DS)</legend>
            <p className="text-slate-400 text-xs mb-4">Especifica los límites de control objetivo según el lote e inserto para cada nivel.</p>

            <div className="space-y-5 max-h-[380px] overflow-y-auto pr-2">
              {Object.entries(analitosSeleccionados)
                .filter(([, seleccionado]) => seleccionado)
                .map(([idStr]) => {
                  const analitoId = Number(idStr);
                  const analitoMeta = listaAnalitosActivos.find(a => a.id_analito === analitoId);
                  const unidad = unidadesAnalito[analitoId] || 'mg/dL';

                  return (
                    <article key={analitoId} className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/80 space-y-4">
                      <header className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                        <span className="text-sm font-extrabold text-white">{analitoMeta?.nombre}</span>
                        <span className="text-xs font-bold bg-blue-950/40 text-blue-400 border border-blue-900/50 px-2 py-0.5 rounded-full">{unidad}</span>
                      </header>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {Object.entries(nivelesActivos).filter(([, activo]) => activo).map(([lvlStr]) => {
                          const lvl = Number(lvlStr);
                          const configVal = configuraciones[`${analitoId}-${lvl}`] || { media: '', ds: '' };

                          return (
                            <fieldset key={lvl} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                              <legend className="text-xs font-bold text-indigo-300">Nivel {lvl} (Lote: {lotesNivel[lvl]})</legend>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div className="flex flex-col gap-1">
                                  <label htmlFor={`media-${analitoId}-${lvl}`} className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Media</label>
                                  <input
                                    id={`media-${analitoId}-${lvl}`}
                                    type="text"
                                    placeholder="0.0"
                                    className="px-2.5 py-1.5 rounded-lg glass-input text-xs"
                                    value={configVal.media}
                                    onChange={(e) => cambiarConfiguracion(analitoId, lvl, 'media', e.target.value)}
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label htmlFor={`ds-${analitoId}-${lvl}`} className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">DS</label>
                                  <input
                                    id={`ds-${analitoId}-${lvl}`}
                                    type="text"
                                    placeholder="0.0"
                                    className="px-2.5 py-1.5 rounded-lg glass-input text-xs"
                                    value={configVal.ds}
                                    onChange={(e) => cambiarConfiguracion(analitoId, lvl, 'ds', e.target.value)}
                                  />
                                </div>
                              </div>
                            </fieldset>
                          );
                        })}
                      </div>
                    </article>
                  );
                })}
            </div>
          </fieldset>
        )}

        {/* Controles del Formulario */}
        <footer className="flex justify-between items-center border-t border-slate-850 pt-6 mt-8">
          <button
            type="button"
            onClick={pasoActual === 1 ? onCancel : manejarAtras}
            className="px-5 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-bold tracking-wide transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" /> {pasoActual === 1 ? 'Cancelar' : 'Atrás'}
          </button>

          {pasoActual < 3 ? (
            <button
              type="button"
              onClick={manejarSiguiente}
              disabled={pasoActual === 1 ? !esPaso1Valido : !esPaso2Valido}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-blue-950/30"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!esPaso3Valido}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-800 hover:from-emerald-500 hover:to-teal-700 disabled:opacity-40 text-white text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-950/30"
            >
              <Save className="w-4 h-4" /> {materialEnEdicion ? 'Guardar Cambios' : 'Guardar Control'}
            </button>
          )}
        </footer>
      </form>
    </section>
  );
};
