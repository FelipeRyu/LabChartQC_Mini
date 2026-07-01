import React from 'react';
import { FileSpreadsheet, Plus, PlayCircle, Database, AreaChart, User } from 'lucide-react';
// 1. Eliminamos el mock estático y traemos nuestro hook real de autenticación
import { usarAutenticacion } from '../../context/ContextoAutenticacion';

export type TipoPestana = 'resumen' | 'ingreso' | 'corridas' | 'bitacora' | 'graficas';

interface BarraLateralProps {
  pestanaActiva: TipoPestana;
  setPestanaActiva: (pestana: TipoPestana) => void;
}

/**
 * BarraLateral (Sidebar) de navegación.
 * Utiliza semántica HTML5 (<aside>, <nav>) y provee acceso rápido a todas las vistas.
 */
export const BarraLateral: React.FC<BarraLateralProps> = ({ pestanaActiva, setPestanaActiva }) => {
  // 2. Invocamos la memoria de la sesión para saber quién está conectado
  const { usuario } = usarAutenticacion();

  return (
    <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-8 bg-[#0b101f]/95 rounded-2xl p-6 shadow-[0_10px_35px_rgba(0,0,0,0.5)] border border-blue-900/40 flex flex-col gap-6">
      {/* Información del Laboratorio / Usuario */}
      <section className="flex flex-col items-center text-center gap-4 pb-5 border-b border-slate-800">
        
        {/* Cambiamos el logo estático por un avatar dinámico temporal */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-900/40 to-slate-800 flex items-center justify-center border border-blue-700/50 shadow-inner">
           <User className="w-8 h-8 text-blue-400" />
        </div>
        
        <div className="space-y-2">
          <span className="inline-block text-[10px] bg-blue-950/50 text-blue-400 border border-blue-900/50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            {usuario?.rol || 'Operador Autorizado'}
          </span>
          
          {/* 3. Inyectamos el nombre real almacenado en la sesión */}
          <h2 className="text-base font-bold text-white leading-tight">
            Laboratorio {usuario?.nombre || 'Principal'}
          </h2>
          
          {/* Mostramos el correo real de conexión */}
          <p className="text-slate-400 text-[11px]">{usuario?.username || 'Usuario Desconocido'}</p>
        </div>
      </section>

      {/* Menú de pestañas de navegación */}
      <nav className="flex flex-col gap-2.5 w-full" aria-label="Menú principal">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 px-1">
          Menú de Gestión
        </span>
        
        <BotonBarraLateral 
          esActivo={pestanaActiva === 'resumen'} 
          alHacerClic={() => setPestanaActiva('resumen')} 
          icono={<FileSpreadsheet className="w-4 h-4 text-blue-400" />} 
          etiqueta="Resumen General" 
        />
        <BotonBarraLateral 
          esActivo={pestanaActiva === 'ingreso'} 
          alHacerClic={() => setPestanaActiva('ingreso')} 
          icono={<Plus className="w-4 h-4 text-blue-400" />} 
          etiqueta="Registrar Control" 
        />
        <BotonBarraLateral 
          esActivo={pestanaActiva === 'corridas'} 
          alHacerClic={() => setPestanaActiva('corridas')} 
          icono={<PlayCircle className="w-4 h-4 text-blue-400" />} 
          etiqueta="Ingresar Corridas" 
        />
        <BotonBarraLateral 
          esActivo={pestanaActiva === 'bitacora'} 
          alHacerClic={() => setPestanaActiva('bitacora')} 
          icono={<Database className="w-4 h-4 text-blue-400" />} 
          etiqueta="Bitácora de Calidad" 
        />
        <BotonBarraLateral 
          esActivo={pestanaActiva === 'graficas'} 
          alHacerClic={() => setPestanaActiva('graficas')} 
          icono={<AreaChart className="w-4 h-4 text-blue-400" />} 
          etiqueta="Gráficas Levey-Jennings" 
        />
      </nav>
    </aside>
  );
};

interface BotonBarraLateralProps {
  esActivo: boolean;
  alHacerClic: () => void;
  icono: React.ReactNode;
  etiqueta: string;
}

/**
 * Componente interno auxiliar para evitar repetición (DRY) de las clases CSS de los botones.
 */
const BotonBarraLateral: React.FC<BotonBarraLateralProps> = ({ esActivo, alHacerClic, icono, etiqueta }) => {
  const clasesBase = "w-full px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-3";
  const clasesActivas = "bg-blue-700 text-white shadow-md shadow-blue-950/45";
  const clasesInactivas = "border border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700 bg-slate-900/30";

  return (
    <button
      onClick={alHacerClic}
      className={`${clasesBase} ${esActivo ? clasesActivas : clasesInactivas}`}
      aria-current={esActivo ? "page" : undefined}
    >
      {icono} {etiqueta}
    </button>
  );
};