import React, { useState, useMemo } from 'react';
import { type Corrida } from '../constants/types';
import { AREAS, ANALITOS_POR_AREA } from '../constants/config';
import { Filter, Database, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';

interface BitacoraCalidadProps {
  corridas: Corrida[];
}

export const BitacoraCalidad: React.FC<BitacoraCalidadProps> = ({ corridas }) => {
  // Filtros iniciales: rango de los últimos 15 días (desde mayo 25 hasta junio 15, 2026)
  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().substring(0, 10);
  });
  const [fechaFin, setFechaFin] = useState(() => new Date().toISOString().substring(0, 10));
  const [areaId, setAreaId] = useState<number>(2); // Hematología por defecto
  
  // Analito seleccionado (id_analito o 0 para todos)
  const [analitoId, setAnalitoId] = useState<number>(0); // Hemoglobina por defecto

  const filteredAnalitosList = ANALITOS_POR_AREA[areaId] || [];

  // Filtrar las corridas en base a los criterios (Memorizado para performance)
  const corridasFiltradas = useMemo(() => {
    return corridas.filter(c => {
      // 1. Filtrar por área
      if (c.area_id !== areaId) return false;
      
      // 2. Filtrar por analito específico
      if (analitoId !== 0 && c.analito_id !== analitoId) return false;

      // 3. Filtrar por rango de fecha (usando substring, más rápido que split)
      const fechaCorrida = c.fecha_corrida.substring(0, 10);
      if (fechaInicio && fechaCorrida < fechaInicio) return false;
      if (fechaFin && fechaCorrida > fechaFin) return false;

      return true;
    });
  }, [corridas, areaId, analitoId, fechaInicio, fechaFin]);

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      
      {/* Panel de Filtros */}
      <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-800/80">
        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filtros de Búsqueda
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Fecha Inicio */}
          <div>
            <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-2">Fecha Desde</label>
            <input
              type="date"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs cursor-pointer"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-2">Fecha Hasta</label>
            <input
              type="date"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs cursor-pointer"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>

          {/* Área */}
          <div>
            <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-2">Área</label>
            <select
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs bg-[#0a0f1d] cursor-pointer"
              value={areaId}
              onChange={(e) => {
                const newAreaId = Number(e.target.value);
                setAreaId(newAreaId);
                
                // Actualizar automáticamente al primer analito del área nueva
                const list = ANALITOS_POR_AREA[newAreaId] || [];
                if (list.length > 0) {
                  setAnalitoId(list[0].id_analito);
                } else {
                  setAnalitoId(0);
                }
              }}
            >
              {AREAS.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>

          {/* Analito */}
          <div>
            <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-2">Analito Específico</label>
            <select
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs bg-[#0a0f1d] cursor-pointer"
              value={analitoId}
              onChange={(e) => setAnalitoId(Number(e.target.value))}
              disabled={filteredAnalitosList.length === 0}
            >
              <option value="0">-- Todos los Analitos --</option>
              {filteredAnalitosList.map(an => (
                <option key={an.id_analito} value={an.id_analito}>{an.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-800/80">
        <div className="flex justify-between items-center mb-4 border-b border-slate-850 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" /> Resultados de la Bitácora
          </h3>
          <span className="text-xs bg-blue-950/40 text-blue-400 px-3 py-1 rounded-full font-bold border border-blue-900/50">
            {corridasFiltradas.length} Registros Encontrados
          </span>
        </div>

        {corridasFiltradas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <caption className="sr-only">Bitácora de resultados de control de calidad</caption>
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th scope="col" className="py-3 px-4">Fecha / Hora</th>
                  <th scope="col" className="py-3 px-4">Lote / Nivel</th>
                  <th scope="col" className="py-3 px-4">Analito</th>
                  <th scope="col" className="py-3 px-4 text-right">Resultado</th>
                  <th scope="col" className="py-3 px-4 text-right">Z-Score</th>
                  <th scope="col" className="py-3 px-4 text-center">Estado</th>
                  <th scope="col" className="py-3 px-4">Observaciones / Acción</th>
                </tr>
              </thead>
              <tbody>
                {corridasFiltradas.map((c) => (
                  <tr key={c.id_corrida} className="border-b border-slate-850 hover:bg-slate-900/20 transition-colors text-sm">
                    <td className="py-4 px-4 text-slate-300 font-mono text-xs">
                      {new Date(c.fecha_corrida).toLocaleString('es-CO', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      })}
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      <p className="font-semibold text-xs text-indigo-300">Nivel {c.nivel}</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">Lote: {c.lote} &bull; {c.material_nombre}</p>
                    </td>
                    <td className="py-4 px-4 text-white font-bold">{c.analito_nombre}</td>
                    <td className="py-4 px-4 text-right font-extrabold text-white font-mono">{c.valor_obtenido}</td>
                    <td className="py-4 px-4 text-right font-mono text-xs">
                      <span className={`font-bold ${Math.abs(c.z_score) > 3 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {c.z_score > 0 ? `+${c.z_score}` : c.z_score} SD
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {c.aceptada ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 text-xs font-bold uppercase">
                          <CheckCircle className="w-3.5 h-3.5" /> Aceptado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 text-xs font-bold uppercase">
                          <AlertTriangle className="w-3.5 h-3.5" /> Rechazado
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400 max-w-xs truncate">
                      {c.observaciones && (
                        <p className="flex items-start gap-1 text-red-400">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{c.observaciones}</span>
                        </p>
                      )}
                      {c.notas_usuario && (
                        <p className="flex items-start gap-1 text-slate-400 mt-1">
                          <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span className="italic">Acción: {c.notas_usuario}</span>
                        </p>
                      )}
                      {!c.observaciones && !c.notas_usuario && <span className="text-slate-600">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl">
            <Database className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-semibold">No se encontraron corridas en la bitácora para los filtros seleccionados</p>
            <p className="text-slate-500 text-xs mt-1">Prueba a ampliar el rango de fechas o registrar una corrida nueva en "Ingresar Corridas".</p>
          </div>
        )}
      </div>

    </div>
  );
};
