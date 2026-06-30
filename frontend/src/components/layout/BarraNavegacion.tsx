import React from 'react';
import { LogOut } from 'lucide-react';
import { usarAutenticacion } from '../../context/ContextoAutenticacion';

/**
 * BarraNavegacion (Header) de la aplicación.
 * Contiene el logotipo, información del usuario y acción de cerrar sesión.
 * Utiliza semántica HTML5 (<header>, <nav>).
 */
export const BarraNavegacion: React.FC = () => {
  const { usuario, cerrarSesion } = usarAutenticacion();

  return (
    <header className="relative z-10 bg-[#0a0f1d] border-b-2 border-blue-500 shadow-[0_4px_30px_rgba(37,99,235,0.15)] px-6 py-4">
      <nav className="max-w-full mx-auto px-4 sm:px-8 xl:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo del sistema */}
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center relative shadow-inner">
            <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h18" strokeDasharray="2 2" className="opacity-40" />
              <path d="M4 14l4-4 4 3 4-6 4 3" stroke="url(#dash-chart-gradient)" strokeWidth="2" />
              <circle cx="4" cy="14" r="1" className="fill-blue-500" />
              <circle cx="8" cy="10" r="1" className="fill-blue-500" />
              <circle cx="12" cy="13" r="1" className="fill-blue-500" />
              <circle cx="16" cy="7" r="1" className="fill-slate-400" />
              <circle cx="20" cy="10" r="1" className="fill-slate-400" />
              <defs>
                <linearGradient id="dash-chart-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-none">
              LabChartQC <span className="text-gradient">Mini</span>
            </h1>
            <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">Panel de Control</span>
          </div>
        </div>

        {/* Sección de Usuario */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400 font-medium">Operario Activo</p>
            <p className="text-sm font-semibold text-white">{usuario?.nombre || 'Felipe Ryu'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-700 to-slate-700 flex items-center justify-center font-bold text-sm text-white shadow-md">
            {usuario?.nombre?.charAt(0) || 'F'}
          </div>
          <button
            onClick={cerrarSesion}
            className="p-2 rounded-xl border border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>
    </header>
  );
};
