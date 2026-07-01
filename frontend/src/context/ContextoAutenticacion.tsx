// Archivo: frontend/src/context/ContextoAutenticacion.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios'; // Importamos la herramienta real de comunicación

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

  // Al recargar la página, verificamos si ya hay un carnet guardado
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token'); // Ahora coincide con api.ts
    const usuarioGuardado = localStorage.getItem('labchartqc_user');

    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado);
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setEstaCargando(false);
  }, []);

  /**
   * Conexión Real al Backend de FastAPI para el Inicio de Sesión
   */
  const iniciarSesion = async (username: string, contrasena: string): Promise<boolean> => {
    setEstaCargando(true);
    try {
      // FastAPI exige que los datos de login se envíen como un "Formulario Web" tradicional
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', contrasena);

      // Petición POST real a tu base de datos
      const respuesta = await axios.post('http://127.0.0.1:8000/api/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // Si las credenciales son correctas, FastAPI nos entrega el token real
      const tokenReal = respuesta.data.access_token;

      // Creamos el perfil del usuario para mostrarlo en pantalla
      const usuarioLogueado: Usuario = {
        username: username,
        nombre: username.split('@')[0].toUpperCase(), // Toma la primera parte del correo
        rol: 'Administrador',
      };

      // Guardamos en la memoria temporal de React
      setUsuario(usuarioLogueado);
      setToken(tokenReal);
      
      // Guardamos en la memoria persistente del navegador
      localStorage.setItem('token', tokenReal);
      localStorage.setItem('labchartqc_user', JSON.stringify(usuarioLogueado));
      
      setEstaCargando(false);
      return true; // ¡Acceso concedido!

    } catch (error) {
      // Si FastAPI devuelve un error (ej. 401 Credenciales incorrectas), caemos aquí
      console.error('El backend rechazó las credenciales:', error);
      setEstaCargando(false);
      return false; // Acceso denegado
    }
  };

  /**
   * Destruye el carnet y expulsa al usuario del sistema
   */
  const cerrarSesion = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('token');
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