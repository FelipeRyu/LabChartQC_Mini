// Archivo: frontend/src/services/api.ts

import axios from 'axios';

// ==========================================
// 1. CONFIGURACIÓN CENTRAL DE LA API 
// ==========================================
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

// ==========================================
// 2. INTERCEPTOR DE SEGURIDAD (El "Carnet")
// ==========================================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==========================================
// 3. IMPORTACIÓN DE TIPOS
// ==========================================
import {
  type MaterialControl,
  type Corrida,
  type AlertaWestgard
} from '../constants/mockData';

// ==========================================
// 4. RUTAS DE MATERIALES DE CONTROL
// ==========================================

/**
 * Consulta el backend para obtener el catálogo de materiales de control.
 */
export const obtenerMateriales = async (): Promise<MaterialControl[]> => {
  const respuesta = await api.get('/api/materiales');
  
  // ADAPTADOR PARA MATERIALES: Protege contra la falta de analitos (el error "al.media")
  const materialesCrudos = Array.isArray(respuesta.data) ? respuesta.data : [];
  
  return materialesCrudos.map((mat: any) => ({
    id_material: mat.id_material || mat.id || Math.random(),
    area_id: mat.area_id || 1,
    area_nombre: mat.area_nombre || "Área General",
    nombre_material: mat.nombre_material || mat.nombre || "Material BD",
    fabricante: mat.fabricante || "Desconocido",
    fecha_vencimiento: mat.fecha_vencimiento || new Date().toISOString(),
    activo: mat.activo !== undefined ? mat.activo : true,
    
    // Escudo para la estructura profunda de niveles y analitos
    niveles: Array.isArray(mat.niveles) ? mat.niveles.map((niv: any) => ({
      nivel: niv.nivel || 1,
      lote: niv.lote || "Lote-000",
      analitosConfigurados: Array.isArray(niv.analitosConfigurados) ? niv.analitosConfigurados.map((al: any) => ({
        analito_id: al.analito_id || 1,
        analito_nombre: al.analito_nombre || "Analito",
        unidad: al.unidad || "U",
        media: Number(al.media) || 0, // <--- AQUÍ ESTABA EL ERROR OCULTO
        ds: Number(al.ds) || 0
      })) : []
    })) : []
  }));
};

/**
 * Envía un nuevo material al backend para ser registrado.
 */
export const guardarMaterial = async (material: MaterialControl): Promise<MaterialControl> => {
  const respuesta = await api.post('/api/materiales', material);
  return respuesta.data;
};

/**
 * Ordena al backend eliminar un material específico.
 */
export const eliminarMaterial = async (id_material: number): Promise<void> => {
  await api.delete(`/api/materiales/${id_material}`);
};

// ==========================================
// 5. RUTAS DE CORRIDAS (Ingreso de Resultados)
// ==========================================

export const obtenerCorridas = async (): Promise<Corrida[]> => {
  const respuesta = await api.get('/api/corridas');
  
  return respuesta.data.map((item: any) => ({
    id_corrida: item.id_corrida || item.id || Math.random(),
    material_id: item.material_id || 1,
    material_nombre: item.material_nombre || "Material en BD",
    area_id: item.area_id || 1,
    area_nombre: item.area_nombre || "Área General",
    analito_id: item.analito_id || 1,
    analito_nombre: item.analito_nombre || "Analito Pendiente",
    nivel: item.nivel || 1,
    lote: item.lote || "Lote-000",
    fecha_corrida: item.fecha_corrida || item.fecha || new Date().toISOString(),
    valor_obtenido: Number(item.valor_obtenido) || 0,
    z_score: Number(item.z_score) || 0, 
    aceptada: item.aceptada !== undefined ? item.aceptada : true,
    observaciones: item.observaciones || "",
    notas_usuario: item.notas_usuario || ""
  }));
};

export const guardarCorridas = async (corridas: Corrida[]): Promise<Corrida[]> => {
  const respuesta = await api.post('/api/corridas', corridas);
  return respuesta.data;
};

// ==========================================
// 6. RUTAS DE EVENTOS Y ALERTAS WESTGARD
// ==========================================

export const obtenerAlertas = async (): Promise<AlertaWestgard[]> => {
  const respuesta = await api.get('/api/eventos/alertas');
  const eventosCrudos = respuesta.data.eventos || [];
  
  return eventosCrudos.map((al: any) => ({
    id: al.id_evento || al.id || Math.random(),
    analito: al.analito || "Analito Desconocido",
    area: al.area || "Área General",
    material: al.material || "Material BD",
    lote: al.lote || "Lote-000",
    nivel: String(al.nivel || "1"),
    regla: al.regla_violada || al.regla || "Regla Westgard",
    valor: Number(al.valor) || 0,
    media: Number(al.media) || 0, 
    ds: Number(al.ds) || 0,
    z_score: Number(al.z_score) || 0,
    fecha: al.fecha_evento || al.fecha || new Date().toISOString()
  }));
};

export const resolverAlerta = async (id_alerta: number): Promise<void> => {
  await api.put(`/api/eventos/alertas/${id_alerta}/resolver`);
};