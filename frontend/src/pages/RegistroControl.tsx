import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AREAS, ANALITOS_POR_AREA, type MaterialControl } from '../constants/mockData';
import { ChevronRight, ChevronLeft, Save, Plus, Edit } from 'lucide-react';

interface RegistroControlProps {
  materialEnEdicion?: MaterialControl;
  onSave: (nuevoMaterial: any) => void;
  onCancel: () => void;
}

export const RegistroControl: React.FC<RegistroControlProps> = ({ materialEnEdicion, onSave, onCancel }) => {
  const [pasoActual, setPasoActual] = useState(1);
  const [nombre, setNombre] = useState('');
  const [areaId, setAreaId] = useState(1);
  const [fabricante, setFabricante] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [nivelesActivos, setNivelesActivos] = useState<Record<number, boolean>>({ 1: true, 2: false, 3: false });
  const [lotesNivel, setLotesNivel] = useState<Record<number, string>>({ 1: '', 2: '', 3: '' });
  const [analitosSeleccionados, setAnalitosSeleccionados] = useState<Record<number, boolean>>({});
  const [unidadesAnalito, setUnidadesAnalito] = useState<Record<number, string>>({});
  const [configuraciones, setConfiguraciones] = useState<Record<string, { media: string; ds: string }>>({});

  useEffect(() => {
    if (materialEnEdicion) {
      setNombre(materialEnEdicion.nombre_material);
      setAreaId(materialEnEdicion.area_id);
      setFabricante(materialEnEdicion.fabricante);
      setFechaVencimiento(materialEnEdicion.fecha_vencimiento);
    }
  }, [materialEnEdicion]);

  const alternarNivel = useCallback((lvl: number) => setNivelesActivos(prev => ({ ...prev, [lvl]: !prev[lvl] })), []);
  const cambiarLote = useCallback((lvl: number, value: string) => setLotesNivel(prev => ({ ...prev, [lvl]: value })), []);
  const alternarAnalito = useCallback((id: number, unidadPorDefecto: string) => {
    setAnalitosSeleccionados(prev => {
      const seleccionado = !prev[id];
      if (seleccionado) setUnidadesAnalito(u => ({ ...u, [id]: u[id] || unidadPorDefecto }));
      return { ...prev, [id]: seleccionado };
    });
  }, []);
  const cambiarUnidad = useCallback((id: number, value: string) => setUnidadesAnalito(prev => ({ ...prev, [id]: value })), []);
  const cambiarConfiguracion = useCallback((analitoId: number, lvl: number, field: 'media' | 'ds', value: string) => {
    const key = `${analitoId}-${lvl}`;
    setConfiguraciones(prev => ({ ...prev, [key]: { ...(prev[key] || { media: '', ds: '' }), [field]: value } }));
  }, []);

  const esPaso1Valido = useMemo(() => nombre.trim() !== '' && fechaVencimiento.trim() !== '' && Object.values(nivelesActivos).some(Boolean) && Object.entries(nivelesActivos).every(([lvl, activo]) => !activo || lotesNivel[Number(lvl)].trim() !== ''), [nombre, fechaVencimiento, nivelesActivos, lotesNivel]);
  const esPaso2Valido = useMemo(() => Object.values(analitosSeleccionados).some(Boolean), [analitosSeleccionados]);
  const esPaso3Valido = useMemo(() => {
    const niveles = Object.entries(nivelesActivos).filter(([, a]) => a).map(([lvl]) => Number(lvl));
    const analitos = Object.entries(analitosSeleccionados).filter(([, s]) => s).map(([id]) => Number(id));
    return analitos.every(aId => niveles.every(lvl => configuraciones[`${aId}-${lvl}`]?.media && !isNaN(Number(configuraciones[`${aId}-${lvl}`].media)) && configuraciones[`${aId}-${lvl}`]?.ds && !isNaN(Number(configuraciones[`${aId}-${lvl}`].ds))));
  }, [nivelesActivos, analitosSeleccionados, configuraciones]);

  const manejarSiguiente = () => pasoActual === 1 && esPaso1Valido ? setPasoActual(2) : pasoActual === 2 && esPaso2Valido && setPasoActual(3);
  const manejarAtras = () => pasoActual > 1 && setPasoActual(prev => prev - 1);

  const manejarGuardado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!esPaso3Valido) return;

    const niveles = Object.entries(nivelesActivos).filter(([, a]) => a).map(([lvl]) => Number(lvl));
    const analitos = Object.entries(analitosSeleccionados).filter(([, s]) => s).map(([id]) => Number(id));

    // ESTE ES EL PAQUETE EXACTO QUE ESPERA FASTAPI Y PYDANTIC
    const payloadBackend = {
      nombre_material: nombre,
      fabricante: fabricante || 'Genérico',
      fecha_vencimiento: fechaVencimiento,
      area_id: areaId,
      niveles: niveles.map(lvl => ({
        nivel: lvl,
        lote: lotesNivel[lvl],
        analitosConfigurados: analitos.map(analitoId => ({
          analito_id: analitoId,
          unidad: unidadesAnalito[analitoId] || 'mg/dL',
          media: Number(configuraciones[`${analitoId}-${lvl}`].media),
          ds: Number(configuraciones[`${analitoId}-${lvl}`].ds)
        }))
      }))
    };

    onSave(payloadBackend);
  };

  const listaAnalitosActivos = ANALITOS_POR_AREA[areaId] || [];

  return (
    <section className="glass-panel rounded-2xl p-8 shadow-xl max-w-4xl mx-auto border border-slate-800/80">
      <header className="flex justify-between items-center mb-8 border-b border-slate-850 pb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            {materialEnEdicion ? <><Edit className="w-5 h-5 text-blue-400" /> Editar Material</> : <><Plus className="w-5 h-5 text-blue-400" /> Nuevo Material</>}
          </h3>
        </div>
      </header>

      <form onSubmit={manejarGuardado}>
        {pasoActual === 1 && (
          <fieldset className="space-y-6">
            <legend className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4">Paso 1: Básicos</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className="flex flex-col gap-2">
                <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Nombre del Material</label>
                <input
                  list="lista-materiales"
                  type="text"
                  placeholder="Ej. Control Siemens QC"
                  className="px-4 py-3 rounded-xl glass-input text-sm"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
                <datalist id="lista-materiales">
                  <option value="LiquidCheck Hemo" />
                  <option value="MultiChem Clin" />
                  <option value="Control Randox Nivel 1" />
                  <option value="Control Siemens QC" />
                </datalist>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Área</label>
                <select className="px-4 py-3 rounded-xl glass-input text-sm bg-[#0a0f1d]" value={areaId} onChange={(e) => { setAreaId(Number(e.target.value)); setAnalitosSeleccionados({}); }}>
                  {AREAS.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Fabricante</label>
                <input type="text" placeholder="Ej. Bio-Rad" className="px-4 py-3 rounded-xl glass-input text-sm" value={fabricante} onChange={(e) => setFabricante(e.target.value)} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Vencimiento</label>
                <input type="date" className="px-4 py-3 rounded-xl glass-input text-sm cursor-pointer" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
              </div>
            </div>

            <fieldset className="border-t border-slate-850 pt-5 mt-6">
              <legend className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">Niveles y Lotes</legend>
              <div className="space-y-4">
                {[1, 2, 3].map((lvl) => (
                  <div key={lvl} className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/40">
                    <label className="flex items-center gap-2.5 cursor-pointer min-w-[140px]">
                      <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded" checked={nivelesActivos[lvl]} onChange={() => alternarNivel(lvl)} />
                      <span className="text-sm font-semibold text-slate-200">Nivel {lvl}</span>
                    </label>
                    {nivelesActivos[lvl] && (
                      <div className="flex-1 flex items-center gap-2.5">
                        <label className="text-xs text-slate-400">Lote:</label>
                        <input type="text" placeholder={`Lote ${lvl}`} className="w-full max-w-xs px-3.5 py-1.5 rounded-lg glass-input text-xs" value={lotesNivel[lvl]} onChange={(e) => cambiarLote(lvl, e.target.value)} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </fieldset>
          </fieldset>
        )}

        {pasoActual === 2 && (
          <fieldset className="space-y-6">
            <legend className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">Paso 2: Analitos y Unidades</legend>
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
              {listaAnalitosActivos.map((an) => (
                <div key={an.id_analito} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-slate-800/40">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4.5 h-4.5 accent-blue-600 rounded" checked={!!analitosSeleccionados[an.id_analito]} onChange={() => alternarAnalito(an.id_analito, an.unidades[0])} />
                    <span className="text-sm font-bold text-white">{an.nombre}</span>
                  </label>
                  {analitosSeleccionados[an.id_analito] && (
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-400">Unidad:</label>
                      <input
                        list={`unidades-${an.id_analito}`}
                        className="w-24 px-3 py-1.5 rounded-lg glass-input text-xs bg-[#0a0f1d]"
                        value={unidadesAnalito[an.id_analito] || ''}
                        onChange={(e) => cambiarUnidad(an.id_analito, e.target.value)}
                      />
                      <datalist id={`unidades-${an.id_analito}`}>
                        {an.unidades.map(u => <option key={u} value={u} />)}
                        <option value="mg/dL" />
                        <option value="mmol/L" />
                        <option value="g/dL" />
                        <option value="µg/mL" />
                      </datalist>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </fieldset>
        )}

        {pasoActual === 3 && (
          <fieldset className="space-y-6">
            <legend className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">Paso 3: Media y DS</legend>
            <div className="space-y-5 max-h-[380px] overflow-y-auto pr-2">
              {Object.entries(analitosSeleccionados).filter(([, s]) => s).map(([idStr]) => {
                const analitoId = Number(idStr);
                const analitoMeta = listaAnalitosActivos.find(a => a.id_analito === analitoId);
                return (
                  <article key={analitoId} className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/80 space-y-4">
                    <header className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                      <span className="text-sm font-extrabold text-white">{analitoMeta?.nombre}</span>
                      <span className="text-xs font-bold bg-blue-950/40 text-blue-400 px-2 py-0.5 rounded-full">{unidadesAnalito[analitoId]}</span>
                    </header>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {Object.entries(nivelesActivos).filter(([, a]) => a).map(([lvlStr]) => {
                        const lvl = Number(lvlStr);
                        const configVal = configuraciones[`${analitoId}-${lvl}`] || { media: '', ds: '' };
                        return (
                          <fieldset key={lvl} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                            <legend className="text-xs font-bold text-indigo-300">Nivel {lvl}</legend>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-slate-400 uppercase">Media</label>
                                <input type="text" className="px-2.5 py-1.5 rounded-lg glass-input text-xs" value={configVal.media} onChange={(e) => cambiarConfiguracion(analitoId, lvl, 'media', e.target.value)} />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-slate-400 uppercase">DS</label>
                                <input type="text" className="px-2.5 py-1.5 rounded-lg glass-input text-xs" value={configVal.ds} onChange={(e) => cambiarConfiguracion(analitoId, lvl, 'ds', e.target.value)} />
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

        <footer className="flex justify-between items-center border-t border-slate-850 pt-6 mt-8">
          <button type="button" onClick={pasoActual === 1 ? onCancel : manejarAtras} className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5">
            <ChevronLeft className="w-4 h-4" /> {pasoActual === 1 ? 'Cancelar' : 'Atrás'}
          </button>
          {pasoActual < 3 ? (
            <button type="button" onClick={manejarSiguiente} disabled={pasoActual === 1 ? !esPaso1Valido : !esPaso2Valido} className="px-5 py-2.5 rounded-xl bg-blue-600 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5">
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="submit" disabled={!esPaso3Valido} className="px-6 py-2.5 rounded-xl bg-emerald-600 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5">
              <Save className="w-4 h-4" /> Guardar Control
            </button>
          )}
        </footer>
      </form>
    </section>
  );
};