import React from 'react';
import { Navigate } from 'react-router-dom';
import { usarAutenticacion } from '../context/ContextoAutenticacion';

interface RutaProtegidaProps {
  children: React.ReactNode;
}

export const RutaProtegida: React.FC<RutaProtegidaProps> = ({ children }) => {
  const { estaAutenticado, estaCargando } = usarAutenticacion();

  if (estaCargando) {
    return (
      <div className="min-h-screen bg-[#070a13] flex items-center justify-center flex-col gap-4">
        {/* Spinner animado premium */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-blue-300 font-medium tracking-wide animate-pulse">Cargando laboratorio...</p>
      </div>
    );
  }

  if (!estaAutenticado) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  return <>{children}</>;
};
