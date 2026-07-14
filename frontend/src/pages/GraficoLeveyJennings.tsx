import React, { useState, useMemo } from 'react';
import { type Corrida } from '../constants/types';
import { AREAS, ANALITOS_POR_AREA } from '../constants/config';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine
} from 'recharts';
import { Sliders, Eye, EyeOff, AreaChart, LineChart as ChartIcon } from 'lucide-react';
import { obtenerColorZScore } from '../utils/statistics';

interface GraficoLeveyJenningsProps {
  corridas: Corrida[];
}

// Renderizador personalizado de puntos (marcadores geométricos) para los niveles
const RenderCustomDot = (props: any) => {
  const { cx, cy, stroke, payload } = props;
  if (!cx || !cy) return null;
  
  // Si la corrida tiene reglas violadas (fuera de control), usar círculo rojo.
  // De lo contrario, usar marcador estándar según el nivel.
  if (payload.alertas && payload.alertas.some((a: any) => a.estado === 'pendiente' || a.estado === 'resuelta')) {
    return (
      <svg cx={cx} cy={cy} x={cx - 6} y={cy - 6} width={12} height={12} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="#ef4444" stroke="#fff" strokeWidth={10} />
      </svg>
    );
  }

  const nivel = payload.nivel;
  if (nivel === 1) {
    return (
      <svg cx={cx} cy={cy} x={cx - 5} y={cy - 5} width={10} height={10} viewBox="0 0 10 10">
        <circle cx="5" cy="5" r="4" fill={stroke} stroke="#fff" strokeWidth={1} />
      </svg>
    );
  } else if (nivel === 2) {
    return (
      <svg cx={cx} cy={cy} x={cx - 5} y={cy - 5} width={10} height={10} viewBox="0 0 10 10">
        <rect x="1" y="1" width="8" height="8" fill={stroke} stroke="#fff" strokeWidth={1} />
      </svg>
    );
  } else {
    return (
      <svg cx={cx} cy={cy} x={cx - 5} y={cy - 5} width={10} height={10} viewBox="0 0 10 10">
        <polygon points="5,0 10,5 5,10 0,5" fill={stroke} stroke="#fff" strokeWidth={1} />
      </svg>
    );
  }
};

export const GraficoLeveyJennings: React.FC<GraficoLeveyJenningsProps> = ({ 
  corridas 
}) => {
  // Configuración de Filtros
  const [modo, setModo] = useState<'analito' | 'area'>('analito');
  const [areaId, setAreaId] = useState<number>(1); // Hematología
  const [analitoId, setAnalitoId] = useState<number>(101); // Hb por defecto
  const [fechaInicio, setFechaInicio] = useState("2026-05-01");
  const [fechaFin, setFechaFin] = useState("2026-06-15");
  
  // Mostrar u ocultar línea conectora
  const [showConnectionLine, setShowConnectionLine] = useState(true);

  // Niveles seleccionados (Solo para modo Analito)
  const [selectedLevels, setSelectedLevels] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true
  });

  // Nivel único (Solo para modo Área)
  const [selectedSingleLevel, setSelectedSingleLevel] = useState<number>(1);

  // Analitos seleccionados (Solo para modo Área, por defecto todos)
  const [selectedAnalytesArea, setSelectedAnalytesArea] = useState<Record<number, boolean>>({});

  const filteredAnalitosList = ANALITOS_POR_AREA[areaId] || [];

  // Toggle de nivel
  const handleLevelToggle = (lvl: number) => {
    setSelectedLevels(prev => ({ ...prev, [lvl]: !prev[lvl] }));
  };

  // Obtener colores consistentes para las líneas (Estilo Acero y Océano)
  const colors = ['#2563eb', '#0d9488', '#6366f1', '#475569', '#be123c', '#059669'];

  // 1. PROCESAR DATOS PARA EL MODO ANALITO:
  // Mostramos un único analito con selección múltiple de niveles
  const dataModoAnalito = useMemo(() => {
    if (modo !== 'analito') return [];

    // Filtrar corridas del analito, en el rango de fecha
    const corridasFiltradas = corridas
      .filter(c => {
        if (c.analito_id !== analitoId) return false;
        if (c.area_id !== areaId) return false;
        if (!selectedLevels[c.nivel]) return false;
        
        const fecha = c.fecha_corrida.substring(0, 10);
        if (fechaInicio && fecha < fechaInicio) return false;
        if (fechaFin && fecha > fechaFin) return false;
        return true;
      })
      // Ordenar por fecha cronológicamente
      .sort((a, b) => new Date(a.fecha_corrida).getTime() - new Date(b.fecha_corrida).getTime())
      // Mostrar solo los últimos 30 datos
      .slice(-30);

    // Formatear datos para el gráfico
    return corridasFiltradas.map(c => {
      const dateLabel = new Date(c.fecha_corrida).toLocaleDateString('es-CO', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      return {
        id: c.id_corrida,
        fechaRaw: c.fecha_corrida,
        fecha: dateLabel,
        nivel: c.nivel,
        // Guardamos el Z-Score dinámico de cada nivel en una propiedad con clave única
        [`Nivel ${c.nivel}`]: c.z_score,
        // Guardamos los datos completos para el tooltip
        meta: {
          valor: c.valor_obtenido,
          z_score: c.z_score,
          lote: c.lote,
          material: c.material_nombre,
          aceptada: c.aceptada,
          observaciones: c.observaciones,
          notas: c.notas_usuario,
          unidad: c.analito_nombre.includes('Hb') ? 'g/dL' : c.analito_nombre.includes('TSH') ? 'µUI/mL' : 'mg/dL'
        }
      };
    });
  }, [modo, areaId, analitoId, fechaInicio, fechaFin, selectedLevels, corridas]);

  // 2. PROCESAR DATOS PARA EL MODO ÁREA:
  // Mostramos todos los analitos del área en un único nivel seleccionado
  const dataModoArea = useMemo(() => {
    if (modo !== 'area') return [];

    // Filtrar corridas del área y del nivel elegido
    const corridasFiltradas = corridas
      .filter(c => {
        if (c.area_id !== areaId) return false;
        if (c.nivel !== selectedSingleLevel) return false;
        
        // Si hay analitos filtrados por checkbox (si no hay ninguno marcado, se muestran todos)
        const activeFilterIds = Object.entries(selectedAnalytesArea)
          .filter(([_, sel]) => sel)
          .map(([id]) => Number(id));
        if (activeFilterIds.length > 0 && !activeFilterIds.includes(c.analito_id)) return false;

        const fecha = c.fecha_corrida.substring(0, 10);
        if (fechaInicio && fecha < fechaInicio) return false;
        if (fechaFin && fecha > fechaFin) return false;
        return true;
      })
      .sort((a, b) => new Date(a.fecha_corrida).getTime() - new Date(b.fecha_corrida).getTime());

    // Agrupamos las corridas por su fecha aproximada o índice para graficar varias series juntas.
    // Para simplificar, agrupamos por fecha exacta del registro.
    const agrupadosPorFecha: Record<string, any> = {};

    corridasFiltradas.forEach(c => {
      const dateLabel = new Date(c.fecha_corrida).toLocaleDateString('es-CO', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      if (!agrupadosPorFecha[c.fecha_corrida]) {
        agrupadosPorFecha[c.fecha_corrida] = {
          fechaRaw: c.fecha_corrida,
          fecha: dateLabel,
          nivel: c.nivel
        };
      }

      // Guardamos la puntuación Z-Score de este analito en su columna respectiva
      agrupadosPorFecha[c.fecha_corrida][c.analito_nombre] = c.z_score;
      
      // Metadatos para el tooltip
      agrupadosPorFecha[c.fecha_corrida][`meta-${c.analito_nombre}`] = {
        valor: c.valor_obtenido,
        z_score: c.z_score,
        lote: c.lote,
        material: c.material_nombre,
        aceptada: c.aceptada,
        observaciones: c.observaciones
      };
    });

    // Convertir objeto a arreglo ordenado, mostrando los últimos 30 puntos
    return Object.values(agrupadosPorFecha)
      .sort((a, b) => new Date(a.fechaRaw).getTime() - new Date(b.fechaRaw).getTime())
      .slice(-30);
  }, [modo, areaId, selectedSingleLevel, selectedAnalytesArea, fechaInicio, fechaFin, corridas]);

  // Tooltip personalizado clínico
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="p-4 rounded-xl bg-slate-950/95 border border-slate-800 text-xs shadow-2xl backdrop-blur-md space-y-2.5 max-w-sm">
          <p className="font-bold text-blue-300 border-b border-slate-800 pb-1.5">{label}</p>
          
          {payload.map((p: any, idx: number) => {
            // Buscamos los metadatos de la corrida según el modo
            const meta = modo === 'analito' ? p.payload.meta : p.payload[`meta-${p.name}`];
            if (!meta) return null;

            return (
              <div key={idx} className="space-y-1.5 border-b border-slate-900/60 pb-1.5 last:border-0 last:pb-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                  <span className="font-bold text-white text-[13px]">{p.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400 font-mono text-[10px]">
                  <p>Valor: <span className="text-slate-200 font-bold">{meta.valor}</span></p>
                  <p>Z-Score: <span className={`font-bold ${obtenerColorZScore(meta.z_score)}`}>{meta.z_score > 0 ? `+${meta.z_score}` : meta.z_score} SD</span></p>
                  <p className="col-span-2">Control: <span className="text-slate-300">{meta.material} (Lote: {meta.lote})</span></p>
                  <p className="col-span-2">Estado: <span className={meta.aceptada ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{meta.aceptada ? 'Aceptado ✓' : 'RECHAZADO ✗'}</span></p>
                </div>
                {meta.observaciones && (
                  <p className="text-[9px] bg-red-950/40 border border-red-900/50 text-red-400 p-1.5 rounded-lg font-sans">
                    <strong>Alerta:</strong> {meta.observaciones}
                  </p>
                )}
                {meta.notas && (
                  <p className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 p-1.5 rounded-lg font-sans italic">
                    <strong>Acción:</strong> {meta.notas}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Determinar los analitos del área para el filtro del modo Área
  const handleAnalyteAreaToggle = (id: number) => {
    setSelectedAnalytesArea(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      
      {/* Controles de Selección Superior */}
      <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-800/80">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-850 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Configurar Gráfico de Levey-Jennings</h3>
              <p className="text-slate-400 text-xs mt-0.5">Selecciona el modo de visualización y define tus criterios estadísticos</p>
            </div>
          </div>

          {/* Selector de Modo */}
          <div className="inline-flex rounded-xl p-1 bg-slate-950/80 border border-slate-800/60 self-stretch sm:self-auto">
            <button
              onClick={() => {
                setModo('analito');
                setSelectedAnalytesArea({});
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                modo === 'analito' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ChartIcon className="w-3.5 h-3.5" /> Por Analito
            </button>
            <button
              onClick={() => {
                setModo('area');
                setSelectedLevels({ 1: true, 2: true, 3: true });
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                modo === 'area' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AreaChart className="w-3.5 h-3.5" /> Por Área
            </button>
          </div>
        </div>

        {/* Grid de Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-2">Fecha Desde</label>
            <input
              type="date"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs cursor-pointer"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>

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
            <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-2">Área del Laboratorio</label>
            <select
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs bg-[#0b0f19] cursor-pointer"
              value={areaId}
              onChange={(e) => {
                const newAreaId = Number(e.target.value);
                setAreaId(newAreaId);
                const list = ANALITOS_POR_AREA[newAreaId] || [];
                if (list.length > 0) setAnalitoId(list[0].id_analito);
                setSelectedAnalytesArea({});
              }}
            >
              {AREAS.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>

          {/* Condicional según Modo */}
          {modo === 'analito' ? (
            /* Selector de Analito único */
            <div>
              <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-2">Analito Específico</label>
              <select
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs bg-[#0b0f19] cursor-pointer"
                value={analitoId}
                onChange={(e) => setAnalitoId(Number(e.target.value))}
              >
                {filteredAnalitosList.map(an => (
                  <option key={an.id_analito} value={an.id_analito}>{an.nombre}</option>
                ))}
              </select>
            </div>
          ) : (
            /* Selector de Nivel único para Modo Área */
            <div>
              <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-2">Nivel a Graficar</label>
              <select
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs bg-[#0b0f19] cursor-pointer"
                value={selectedSingleLevel}
                onChange={(e) => setSelectedSingleLevel(Number(e.target.value))}
              >
                <option value={1}>Nivel 1 (Bajo)</option>
                <option value={2}>Nivel 2 (Normal)</option>
                <option value={3}>Nivel 3 (Alto)</option>
              </select>
            </div>
          )}
        </div>

        {/* Opciones Avanzadas en Fila Inferior */}
        <div className="border-t border-slate-850 mt-5 pt-4 flex flex-wrap justify-between items-center gap-4">
          
          {/* Opciones de Nivel / Analito Múltiple */}
          <div className="flex flex-wrap items-center gap-4">
            {modo === 'analito' ? (
              <>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Niveles a Graficar:</span>
                <div className="flex gap-3">
                  {[1, 2, 3].map(lvl => (
                    <label key={lvl} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300 select-none">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded accent-blue-500"
                        checked={selectedLevels[lvl]}
                        onChange={() => handleLevelToggle(lvl)}
                      />
                      <span>Nivel {lvl}</span>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Analitos a Mostrar:</span>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {filteredAnalitosList.map(an => (
                    <label key={an.id_analito} className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-300 select-none">
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 rounded accent-blue-500"
                        checked={selectedAnalytesArea[an.id_analito] !== false} // por defecto true
                        onChange={() => handleAnalyteAreaToggle(an.id_analito)}
                      />
                      <span>{an.nombre.split(' ')[0]}</span> {/* Cortar nombre largo */}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Toggle de Línea de Conexión */}
          <button
            type="button"
            onClick={() => setShowConnectionLine(!showConnectionLine)}
            className="px-3.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold tracking-wide cursor-pointer flex items-center gap-1.5 transition-all"
          >
            {showConnectionLine ? (
              <>
                <EyeOff className="w-3.5 h-3.5" /> Ocultar Línea
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" /> Mostrar Línea
              </>
            )}
          </button>
        </div>

      </div>

      {/* Tarjeta del Gráfico */}
      <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-800/80">
        <div className="mb-6 flex flex-wrap justify-between items-center gap-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            📊 Gráfica Levey-Jennings (Escala Z-Score)
          </h3>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Nivel 1 (●)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-indigo-500 rotate-45 shrink-0 block"></span> Nivel 2 (▲)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-emerald-500 shrink-0 block"></span> Nivel 3 (◆)
            </span>
          </div>
        </div>

        {/* Renderizado del Chart */}
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={modo === 'analito' ? dataModoAnalito : dataModoArea}
              margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
              
              {/* Eje X: Fechas de las corridas */}
              <XAxis 
                dataKey="fecha" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                dy={8}
              />
              
              {/* Eje Y: Escala Z-Score de -3.5 a +3.5 */}
              <YAxis 
                domain={[-3.5, 3.5]} 
                ticks={[-3, -2, -1, 0, 1, 2, 3]}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                dx={-8}
                tickFormatter={(val) => val === 0 ? 'Media' : val > 0 ? `+${val} SD` : `${val} SD`}
              />
              
              {/* Tooltip interactivo clínico */}
              <Tooltip content={<CustomTooltip />} />
              
              {/* Leyenda */}
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />

              {/* LÍNEAS DE REFERENCIA CLÍNICAS (Levey-Jennings) */}
              <ReferenceLine y={0} stroke="#2563eb" strokeWidth={2} label={{ value: 'MEDIA', fill: '#2563eb', fontSize: 9, position: 'insideRight', offset: 10 }} />
              
              {/* Líneas +1 y -1 SD (Verdes - Advertencia Temprana) */}
              <ReferenceLine y={1} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1} label={{ value: '+1 SD', fill: '#10b981', fontSize: 8, position: 'insideRight' }} />
              <ReferenceLine y={-1} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1} label={{ value: '-1 SD', fill: '#10b981', fontSize: 8, position: 'insideRight' }} />
              
              {/* Líneas +2 y -2 SD (Amarillo/Naranja - Límite de Alerta) */}
              <ReferenceLine y={2} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: '+2 SD', fill: '#f59e0b', fontSize: 8, position: 'insideRight' }} />
              <ReferenceLine y={-2} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: '-2 SD', fill: '#f59e0b', fontSize: 8, position: 'insideRight' }} />
              
              {/* Líneas +3 y -3 SD (Rojas - Límite de Rechazo Crítico) */}
              <ReferenceLine y={3} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '+3 SD', fill: '#ef4444', fontSize: 8, position: 'insideRight' }} />
              <ReferenceLine y={-3} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '-3 SD', fill: '#ef4444', fontSize: 8, position: 'insideRight' }} />

              {/* Renderización dinámica de las series de datos */}
              {modo === 'analito' ? (
                // Modo Analito: Dibujamos una línea por cada nivel de control activo/seleccionado
                [1, 2, 3].map((lvl, index) => {
                  if (!selectedLevels[lvl]) return null;
                  return (
                    <Line
                      key={lvl}
                      type="monotone"
                      dataKey={`Nivel ${lvl}`}
                      name={`Nivel ${lvl}`}
                      stroke={colors[index]}
                      strokeWidth={showConnectionLine ? 2 : 0} // Si se oculta la línea, ocultamos el trazo
                      dot={<RenderCustomDot />}
                      activeDot={{ r: 7 }}
                      animationDuration={600}
                      connectNulls
                    />
                  );
                })
              ) : (
                // Modo Área: Dibujamos una línea por cada analito del área
                filteredAnalitosList.map((an, index) => {
                  // Si está desmarcado en los filtros, no lo renderizamos
                  if (selectedAnalytesArea[an.id_analito] === false) return null;
                  return (
                    <Line
                      key={an.id_analito}
                      type="monotone"
                      dataKey={an.nombre}
                      name={an.nombre.split(' ')[0]} // Nombre simplificado
                      stroke={colors[index % colors.length]}
                      strokeWidth={showConnectionLine ? 2 : 0}
                      dot={<RenderCustomDot />}
                      activeDot={{ r: 6 }}
                      animationDuration={600}
                      connectNulls
                    />
                  );
                })
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Explicación Técnica Clinica */}
        <div className="mt-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 space-y-1.5 leading-relaxed">
          <p>
            💡 <strong>Nota del Motor Estadístico:</strong> Los gráficos de Levey-Jennings están representados en <strong>unidades de Desviación Estándar (Z-Score)</strong>. Esto te permite comparar simultáneamente analitos con diferentes rangos de valor absoluto (ej. Glucosa y Colesterol) o controles de diferente nivel en una sola pantalla estandarizada.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Puntos dentro de las líneas verdes (±1 SD) se consideran óptimos.</li>
            <li>Puntos fuera de las líneas amarillas (±2 SD) son señales de alerta (Reglas 1_2s, 4_1s, etc.).</li>
            <li>Puntos fuera de las líneas rojas (±3 SD) deben rechazarse de inmediato (Violación de la regla crítica 1_3s).</li>
          </ul>
        </div>

      </div>

    </div>
  );
};
