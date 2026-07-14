import React, { createContext, useContext, useState, useEffect } from 'react';

interface Usuario {
  username: string;
  nombre: string;
  rol: string;
}

interface TipoContextoAutenticacion {
  usuario: Usuario | null;
  token: string | null;
  estaAutenticado: boolean;
  estaCargando: boolean;
  iniciarSesion: (username: string, contrasena: string) => Promise<boolean>;
  cerrarSesion: () => void;
}

const ContextoAutenticacion = createContext<TipoContextoAutenticacion | undefined>(undefined);

export const ProveedorAutenticacion: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [estaCargando, setEstaCargando] = useState<boolean>(true);

  useEffect(() => {
    // Restaurar sesión guardada
    const tokenGuardado = localStorage.getItem('labchartqc_token');
    const usuarioGuardado = localStorage.getItem('labchartqc_user');

    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado);
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setEstaCargando(false);
  }, []);

  const iniciarSesion = async (username: string, contrasena: string): Promise<boolean> => {
    setEstaCargando(true);
    try {
      // Simulación de Login temporal (para pruebas offline)
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula latencia de red

      if (username.trim() && contrasena.length >= 4) {
        const usuarioFalso: Usuario = {
          username: username,
          nombre: username.charAt(0).toUpperCase() + username.slice(1),
          rol: 'Administrador',
        };
        const tokenFalso = 'jwt-dummy-token-123456';

        setUsuario(usuarioFalso);
        setToken(tokenFalso);
        localStorage.setItem('labchartqc_token', tokenFalso);
        localStorage.setItem('labchartqc_user', JSON.stringify(usuarioFalso));
        setEstaCargando(false);
        return true;
      }
      setEstaCargando(false);
      return false;
    } catch (error) {
      console.error('Error de login:', error);
      setEstaCargando(false);
      return false;
    }
  };

  const cerrarSesion = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('labchartqc_token');
    localStorage.removeItem('labchartqc_user');
  };

  return (
    <ContextoAutenticacion.Provider
      value={{
        usuario,
        token,
        estaAutenticado: !!token,
        estaCargando,
        iniciarSesion,
        cerrarSesion,
      }}
    >
      {children}
    </ContextoAutenticacion.Provider>
  );
};

export const usarAutenticacion = () => {
  const contexto = useContext(ContextoAutenticacion);
  if (contexto === undefined) {
    throw new Error('usarAutenticacion debe usarse dentro de un ProveedorAutenticacion');
  }
  return contexto;
};
