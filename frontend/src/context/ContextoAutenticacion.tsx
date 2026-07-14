/**
 * ARCHIVO: src/context/ContextoAutenticacion.tsx
 * MISIÓN: Proveedor de autenticación conectado al backend FastAPI real.
 * 
 * Flujo:
 *  1. Al iniciar sesión, hace POST /api/login con OAuth2PasswordRequestForm
 *  2. Guarda el JWT real en localStorage
 *  3. Al cargar la app, restaura la sesión si el token existe
 *  4. Al cerrar sesión, limpia token y datos del usuario
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

interface Usuario {
  username: string;   // email del laboratorio
  nombre: string;     // nombre del laboratorio
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
    // Restaurar sesión guardada en localStorage
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
      // FastAPI usa OAuth2PasswordRequestForm: necesita application/x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', contrasena);

      const respuesta = await apiClient.postForm<{ access_token: string; token_type: string }>(
        '/api/login',
        formData
      );

      const tokenReal = respuesta.access_token;

      // Construimos el usuario a partir del email (username es el email en nuestro backend)
      const usuarioReal: Usuario = {
        username: username,
        nombre: username.split('@')[0].charAt(0).toUpperCase() + username.split('@')[0].slice(1),
        rol: 'Laboratorio',
      };

      setToken(tokenReal);
      setUsuario(usuarioReal);
      localStorage.setItem('labchartqc_token', tokenReal);
      localStorage.setItem('labchartqc_user', JSON.stringify(usuarioReal));
      setEstaCargando(false);
      return true;

    } catch (error: unknown) {
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
