import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { usarAutenticacion } from '../context/ContextoAutenticacion';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import labBg from '../assets/laboratory_bg.png'; // Cargamos la imagen premium generada

interface EntradasFormularioIniciarSesion {
  usuario: string;
  contrasena: string;
}

export const IniciarSesion: React.FC = () => {
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const { iniciarSesion } = usarAutenticacion();
  const navegar = useNavigate();

  const {
    register: registrar,
    handleSubmit: manejarEnvio,
    formState: { errors: errores, isSubmitting: estaEnviando }
  } = useForm<EntradasFormularioIniciarSesion>();

  const alIniciarSesion = async (datos: EntradasFormularioIniciarSesion) => {
    setMensajeError(null);
    const exito = await iniciarSesion(datos.usuario, datos.contrasena);
    if (exito) {
      navegar('/panel-principal');
    } else {
      setMensajeError('Credenciales inválidas. Verifica tu usuario y contraseña.');
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-mesh relative overflow-hidden font-sans"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(11, 15, 25, 0.50), rgba(11, 15, 25, 0.65)), url(${labBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Círculos de luz decorativos en el fondo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        {/* Card Principal */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl relative border border-slate-700/30">

          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/10 to-blue-900/15 border border-blue-500/30 mb-3 shadow-xl relative group">
              <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <svg className="w-9 h-9 text-blue-400 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h18" strokeDasharray="2 2" className="opacity-50" />
                <path d="M3 6h18" strokeDasharray="3 3" className="opacity-30 stroke-rose-500/40" />
                <path d="M3 18h18" strokeDasharray="3 3" className="opacity-30 stroke-rose-500/40" />
                <path d="M4 15l4-5 4 4 4-7 4 3" stroke="url(#chart-gradient)" strokeWidth="2.5" />
                <circle cx="4" cy="15" r="1.5" className="fill-blue-400" />
                <circle cx="8" cy="10" r="1.5" className="fill-blue-400" />
                <circle cx="12" cy="14" r="1.5" className="fill-blue-400" />
                <circle cx="16" cy="7" r="1.5" className="fill-slate-400" />
                <circle cx="20" cy="10" r="1.5" className="fill-slate-400" />
                <defs>
                  <linearGradient id="chart-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#64748b" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
              LabChartQC <span className="text-gradient">Mini</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              Sistema de control de calidad y validación estadística en laboratorios clínicos
            </p>
          </div>

          {/* Mensaje de Alerta */}
          {mensajeError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex gap-2.5 items-start">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{mensajeError}</span>
            </div>
          )}

          {/* Formulario de Login */}
          <form onSubmit={manejarEnvio(alIniciarSesion)} className="space-y-5">
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ingresa tu usuario"
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
                  {...registrar('usuario', { required: 'El usuario es requerido' })}
                />
              </div>
              {errores.usuario && (
                <p className="text-rose-400 text-xs mt-1.5 ml-1">{errores.usuario.message}</p>
              )}
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type={mostrarContrasena ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 rounded-xl glass-input text-sm"
                  {...registrar('contrasena', {
                    required: 'La contraseña es requerida',
                    minLength: { value: 4, message: 'La contraseña debe tener al menos 4 caracteres' }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {mostrarContrasena ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {errores.contrasena && (
                <p className="text-rose-400 text-xs mt-1.5 ml-1">{errores.contrasena.message}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={estaEnviando}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-sm tracking-wide shadow-lg hover:shadow-blue-950/30 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {estaEnviando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>

        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          &copy; {new Date().getFullYear()} LabChartQC Mini®. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};
