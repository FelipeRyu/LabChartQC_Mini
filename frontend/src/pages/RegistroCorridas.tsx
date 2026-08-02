import React, { useState, useMemo, useEffect } from 'react';
import { type MaterialControl, type Corrida } from '../constants/types';
import { calcularZScore, evaluarRegla1_3s } from '../utils/statistics';
import { PlayCircle, FlaskConical, Beaker, Save, AlertCircle, MessageSquare } from 'lucide-react';

interface RegistroCorridasProps {
  materialesVigentes: MaterialControl[];
  onSave: (nuevasCorridas: Corrida[]) => void;
  onCancel: () => void;
}

export const RegistroCorridas: React.FC<RegistroCorridasProps> = ({ 
  materialesVigentes, 
  onSave, 
  onCancel 
}) => {
  const [materialId, setMaterialId] = useState<number>(materialesVigentes.length > 0 ? materialesVigentes[0].id_material : 0);
  const [analitoId, setAnalitoId] = useState<number | null>(null);
  const [valores, setValores] = useState<Record<number, string>>({});
  const [success, setSuccess] = useState(false);
  const [notasUsuario, setNotasUsuario] = useState('');

  useEffect(() => {
    // Reiniciar analito y valores cuando cambia el material
    setAnalitoId(null);
    setValores({});
    setNotasUsuario('');
  }, [materialId]);

  useEffect(() => {
    // Reiniciar valores cuando cambia el analito
    setValores({});
    setNotasUsuario('');
  }, [analitoId]);

  const materialActivo = useMemo(() => 
    materialesVigentes.find(m => m.id_material === materialId),
    [materialesVigentes, materialId]
  );

  const analitosConsolidados = useMemo(() => {
    if (!materialActivo) return [];
    const mapaAnalitos = new Map();
    materialActivo.niveles.forEach(nivel => {
      nivel.analitosConfigurados.forEach(analito => {
        if (!mapaAnalitos.has(analito.analito_id)) {
          mapaAnalitos.set(analito.analito_id, analito);
        }
      });
    });
    return Array.from(mapaAnalitos.values());
  }, [materialActivo]);

  const handleSave = () => {
    if (!materialActivo || !analitoId) return;

    const nuevasCorridas: Corrida[] = [];
    const nowStr = new Date().toISOString();
    let algunDatoIngresado = false;

    materialActivo.niveles.forEach(nivelObj => {
      const configNivel = nivelObj.analitosConfigurados.find(a => a.analito_id === analitoId);
      if (!configNivel) return;

      const valStr = valores[nivelObj.nivel]?.trim();
      if (valStr) {
        algunDatoIngresado = true;
        const valorNum = Number(valStr);
        if (isNaN(valorNum)) return;

        const zScore = calcularZScore(valorNum, configNivel.media, configNivel.ds);
        const viola1_3s = evaluarRegla1_3s(zScore);

        let justificacionRechazo = '';
        if (viola1_3s) {
          justificacionRechazo = `Violación Regla Westgard 1_3s (Z-Score: ${zScore.toFixed(2)} SD).`;
        }

        nuevasCorridas.push({
          id_corrida: Date.now() + Math.random(),
          material_id: materialActivo.id_material,
          material_nombre: materialActivo.nombre_material,
          area_id: materialActivo.area_id,
          area_nombre: materialActivo.area_nombre,
          analito_id: configNivel.analito_id,
          analito_nombre: configNivel.analito_nombre,
          nivel: nivelObj.nivel,
          lote: nivelObj.lote,
          fecha_corrida: nowStr,
          valor_obtenido: valorNum,
          z_score: Number(zScore.toFixed(2)),
          aceptada: !viola1_3s,
          observaciones: justificacionRechazo,
          notas_usuario: notasUsuario
        });
      }
    });

    if (algunDatoIngresado) {
      onSave(nuevasCorridas);
      setSuccess(true);
      setTimeout(() => {
        onCancel();
      }, 1500);
    }
  };

  const hayDatosIngresados = Object.values(valores).some(v => v.trim() !== '' && !isNaN(Number(v)));

  return (
    <section className="glass-panel rounded-2xl p-8 shadow-xl max-w-5xl mx-auto border border-slate-800/80 animate-fadeIn">
      <header className="flex justify-between items-center mb-8 border-b border-slate-850 pb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <PlayCircle className="w-6 h-6 text-emerald-400" /> Ingresar Corridas Diarias
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Flujo de registro: Material → Analito → Valores por nivel
          </p>
        </div>
      </header>

      {materialesVigentes.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-amber-950/20 border border-amber-900/30">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4 opacity-80" />
          <h4 className="text-amber-400 font-bold mb-2">No hay materiales vigentes</h4>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Para registrar corridas, primero debes configurar y activar un material de control en el sistema que no esté vencido.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {success ? (
            <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                <Save className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">¡Corridas Guardadas!</h2>
              <p className="text-slate-400">Volviendo al panel...</p>
            </div>
          ) : (
            <>
              {/* Paso 1: Seleccionar Material */}
              <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800/80">
                <label htmlFor="materialSelect" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">1</span> 
                  Seleccionar Material de Control
                </label>
                <select
                  id="materialSelect"
                  className="w-full bg-[#0b101f] text-white border border-slate-700/50 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                  value={materialId}
                  onChange={(e) => setMaterialId(Number(e.target.value))}
                >
                  {materialesVigentes.map(m => (
                    <option key={m.id_material} value={m.id_material}>
                      {m.nombre_material} ({m.area_nombre}) - Lotes: {m.niveles.map(n=>n.lote).join(', ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Paso 2: Seleccionar Analito */}
              {materialActivo && (
                <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800/80 animate-fadeIn">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">2</span> 
                    Seleccionar Analito
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {analitosConsolidados.map(an => (
                      <button
                        type="button"
                        key={an.analito_id}
                        onClick={() => setAnalitoId(an.analito_id)}
                        className={`relative p-4 rounded-xl border flex flex-col items-start transition-all cursor-pointer text-left ${
                          analitoId === an.analito_id 
                            ? 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500' 
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <FlaskConical className={`w-5 h-5 mb-2 ${analitoId === an.analito_id ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span className="font-bold text-sm text-white">{an.analito_nombre}</span>
                        <span className="text-xs text-slate-400 mt-1">{an.unidad}</span>
                        {analitoId === an.analito_id && (
                          <div className="absolute top-3 right-3 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Paso 3: Ingresar Valores */}
              {analitoId && materialActivo && (
                <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800/80 animate-fadeIn">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">3</span> 
                    Ingresar Valores por Nivel
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materialActivo.niveles.map(nivelObj => {
                      const configNivel = nivelObj.analitosConfigurados.find(a => a.analito_id === analitoId);
                      if (!configNivel) return null;

                      const valStr = valores[nivelObj.nivel] || '';
                      const valNum = Number(valStr);
                      let zScore: number | null = null;
                      if (valStr && !isNaN(valNum)) {
                        zScore = calcularZScore(valNum, configNivel.media, configNivel.ds);
                      }

                      let zColorClass = 'text-slate-500 bg-slate-800/50 border-slate-700/50';
                      if (zScore !== null) {
                        const absZ = Math.abs(zScore);
                        if (absZ < 2) {
                          zColorClass = 'text-emerald-400 bg-emerald-950/30 border-emerald-900/50';
                        } else if (absZ <= 3) {
                          zColorClass = 'text-amber-400 bg-amber-950/30 border-amber-900/50';
                        } else {
                          zColorClass = 'text-red-400 bg-red-950/30 border-red-900/50';
                        }
                      }

                      return (
                        <div key={nivelObj.nivel} className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex flex-col">
                          <div className="flex justify-between items-center mb-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950/30 text-blue-400 text-xs font-bold border border-blue-900/50">
                              <Beaker className="w-3.5 h-3.5" /> Nivel {nivelObj.nivel}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">Lote: {nivelObj.lote}</span>
                          </div>
                          
                          <div className="flex gap-4 mb-4 text-xs">
                            <div>
                              <span className="block text-slate-500">Media</span>
                              <span className="font-mono text-slate-300">{configNivel.media}</span>
                            </div>
                            <div>
                              <span className="block text-slate-500">DS</span>
                              <span className="font-mono text-slate-300">{configNivel.ds}</span>
                            </div>
                          </div>

                          <div className="mt-auto">
                            <label className="sr-only">Valor Nivel {nivelObj.nivel}</label>
                            <input
                              type="number"
                              step="any"
                              placeholder="0.00"
                              value={valStr}
                              onChange={(e) => setValores({...valores, [nivelObj.nivel]: e.target.value})}
                              className="w-full bg-[#0b101f] text-white border border-slate-700 rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all mb-2"
                            />
                            
                            <div className={`mt-2 flex items-center justify-between px-3 py-1.5 rounded-md border text-xs font-mono transition-colors ${zColorClass}`}>
                              <span>Z-Score:</span>
                              <span>{zScore !== null ? zScore.toFixed(2) : '--'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Paso 4: Notas del Microbiólogo */}
              {analitoId && materialActivo && (
                <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800/80 animate-fadeIn">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    Notas del Microbiólogo (opcional)
                  </label>
                  <textarea
                    placeholder="Ej: Cambio de reactivo, recalibración, muestra hemolizada..."
                    value={notasUsuario}
                    onChange={(e) => setNotasUsuario(e.target.value)}
                    className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all resize-y min-h-[80px]"
                  />
                </div>
              )}

              {/* Footer de Acciones */}
              <footer className="flex justify-between items-center border-t border-slate-850 pt-6 mt-6">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!analitoId || !hayDatosIngresados}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-950/30"
                >
                  <Save className="w-4 h-4" aria-hidden="true" /> Guardar Corridas
                </button>
              </footer>
            </>
          )}
        </div>
      )}
    </section>
  );
};
