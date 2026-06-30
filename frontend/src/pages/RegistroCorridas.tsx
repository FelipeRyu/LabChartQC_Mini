import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { type MaterialControl, type Corrida } from '../constants/mockData';
import { calcularZScore, evaluarRegla1_3s } from '../utils/statistics';
import { PlayCircle, AlertCircle, Save } from 'lucide-react';

const schemaRegistroCorridas = z.object({
  materialSeleccionadoId: z.number().min(1, "Debe seleccionar un material"),
  valores: z.record(z.string(), z.string()).optional(),
  observaciones: z.string().optional(),
  notasUsuario: z.string().optional()
});

type FormValoresCorridas = z.infer<typeof schemaRegistroCorridas>;

interface RegistroCorridasProps {
  materialesVigentes: MaterialControl[];
  onSave: (nuevasCorridas: Corrida[]) => void;
  onCancel: () => void;
}

/**
 * Componente: RegistroCorridas
 * Responsabilidad: Interfaz para el registro de corridas diarias de control.
 * Incorpora semántica HTML5 (<section>, <header>, <form>) y validación optimizada.
 */
export const RegistroCorridas: React.FC<RegistroCorridasProps> = ({ 
  materialesVigentes, 
  onSave, 
  onCancel 
}) => {
  const defaultMaterialId = materialesVigentes.length > 0 ? materialesVigentes[0].id_material : 0;
  
  const { register, handleSubmit, watch } = useForm<FormValoresCorridas>({
    resolver: zodResolver(schemaRegistroCorridas),
    defaultValues: {
      materialSeleccionadoId: defaultMaterialId,
      valores: {},
      observaciones: '',
      notasUsuario: ''
    }
  });

  const materialSeleccionadoId = watch("materialSeleccionadoId");
  const valores = watch("valores");

  const materialActivo = useMemo(() => 
    materialesVigentes.find(m => m.id_material === materialSeleccionadoId),
    [materialesVigentes, materialSeleccionadoId]
  );

  // Lista consolidada y única de analitos para el material activo
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

  const onSubmit = (data: FormValoresCorridas) => {
    if (!materialActivo) return;

    const nuevasCorridas: Corrida[] = [];
    const nowStr = new Date().toISOString();

    let algunDatoIngresado = false;
    let tieneErrorFormato = false;

    // Recorremos todos los analitos y niveles para capturar lo que digitó el usuario
    materialActivo.niveles.forEach(nivelObj => {
      nivelObj.analitosConfigurados.forEach(an => {
        const key = `${an.analito_id}-${nivelObj.nivel}`;
        const valStr = data.valores?.[key]?.trim();

        if (valStr) {
          algunDatoIngresado = true;
          const valorNum = Number(valStr);
          if (isNaN(valorNum)) {
            tieneErrorFormato = true;
            return;
          }

          // Validación local simple de Westgard (1_3s) mediante utilidad externa
          const zScore = calcularZScore(valorNum, an.media, an.ds);
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
            analito_id: an.analito_id,
            analito_nombre: an.analito_nombre,
            nivel: nivelObj.nivel,
            lote: nivelObj.lote,
            fecha_corrida: nowStr,
            valor_obtenido: valorNum,
            z_score: Number(zScore.toFixed(2)),
            aceptada: !viola1_3s,
            observaciones: data.observaciones || justificacionRechazo,
            notas_usuario: data.notasUsuario || ''
          });
        }
      });
    });

    if (!algunDatoIngresado || tieneErrorFormato) {
      return;
    }

    onSave(nuevasCorridas);
  };

  return (
    <section className="glass-panel rounded-2xl p-8 shadow-xl max-w-5xl mx-auto border border-slate-800/80 animate-fadeIn">
      <header className="flex justify-between items-center mb-8 border-b border-slate-850 pb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <PlayCircle className="w-6 h-6 text-emerald-400" /> Ingresar Corridas Diarias
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Registra los resultados de las máquinas para los controles vigentes
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800/80">
            <label htmlFor="materialSelect" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              1. Seleccionar Material de Control
            </label>
            <select
              id="materialSelect"
              className="w-full bg-[#0b101f] text-white border border-slate-700/50 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
              {...register("materialSeleccionadoId", { valueAsNumber: true })}
            >
              {materialesVigentes.map(m => (
                <option key={m.id_material} value={m.id_material}>
                  {m.nombre_material} ({m.area_nombre}) - Lotes: {m.niveles.map(n=>n.lote).join(', ')}
                </option>
              ))}
            </select>
          </div>

          {materialActivo && (
            <div className="space-y-6 animate-fadeIn">
              
              <article className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-300">
                <p><strong>Área:</strong> {materialActivo.area_nombre}</p>
                <p><strong>Fabricante:</strong> {materialActivo.fabricante}</p>
                <p><strong>Vencimiento:</strong> {materialActivo.fecha_vencimiento}</p>
              </article>

              <div className="overflow-x-auto border border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse">
                  <caption className="sr-only">Formulario de registro de valores por nivel</caption>
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/20 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <th scope="col" className="py-3 px-4">Analito</th>
                      <th scope="col" className="py-3 px-4">Unidades</th>
                      {materialActivo.niveles.map(n => (
                        <th scope="col" key={n.nivel} className="py-3 px-4 text-center">
                          Nivel {n.nivel} <span className="block text-[9px] text-slate-500 font-mono font-normal">Lote: {n.lote}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analitosConsolidados.map((an) => (
                      <tr key={an.analito_id} className="border-b border-slate-850 hover:bg-slate-900/15 transition-colors text-sm">
                        <td className="py-3 px-4 font-bold text-white">{an.analito_nombre}</td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-xs">{an.unidad}</td>
                        {materialActivo.niveles.map(n => {
                          const configNivel = n.analitosConfigurados.find(c => c.analito_id === an.analito_id);
                          return (
                            <td key={n.nivel} className="py-3 px-4 text-center">
                              {configNivel ? (
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  placeholder="0.00"
                                  {...register(`valores.${an.analito_id}-${n.nivel}`)}
                                  className={`w-full bg-slate-950 text-white border rounded-lg px-3 py-2.5 text-center font-mono text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all shadow-inner ${
                                    (valores && valores[`${an.analito_id}-${n.nivel}`] && isNaN(Number(valores[`${an.analito_id}-${n.nivel}`]))) 
                                      ? 'border-red-500 text-red-400' 
                                      : 'border-slate-800'
                                  }`}
                                />
                              ) : (
                                <span className="text-xs text-slate-600 font-medium">N/A</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <legend className="sr-only">Campos adicionales</legend>
                <div>
                  <label htmlFor="observaciones" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Observaciones Generales de la Corrida (Opcional)
                  </label>
                  <textarea
                    id="observaciones"
                    {...register("observaciones")}
                    placeholder="Ej: Cambio de reactivo lote X..."
                    className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all min-h-[80px]"
                  />
                </div>
                
                <div>
                  <label htmlFor="notasUsuario" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Notas Privadas / Internas (Opcional)
                  </label>
                  <textarea
                    id="notasUsuario"
                    {...register("notasUsuario")}
                    placeholder="Comentarios solo visibles para el laboratorio..."
                    className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all min-h-[80px]"
                  />
                </div>
              </fieldset>
            </div>
          )}

          {/* Botones */}
          <footer className="flex justify-between items-center border-t border-slate-850 pt-6 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-950/30"
            >
              <Save className="w-4 h-4" aria-hidden="true" /> Guardar Corridas
            </button>
          </footer>

        </form>
      )}
    </section>
  );
};
