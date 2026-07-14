/**
 * ARCHIVO: src/services/api.ts
 * MISIÓN: Capa de servicio que conecta el frontend con el backend FastAPI real.
 *
 * Estrategia de integración:
 *  - Todos los datos vienen del backend real en http://127.0.0.1:8000
 *  - Se adaptan (transforman) las respuestas del backend al formato que espera el frontend
 *  - Las corridas usan el motor Westgard real del backend (no el cálculo local)
 *
 * Flujo de datos de Materiales:
 *   Backend:  MaterialControl (plano) + LoteMaterial[] + InsertoValor[] (tablas separadas)
 *   Frontend: MaterialControl (enriquecido con niveles[] y analitosConfigurados[])
 */

import { apiClient } from './apiClient';
import {
  type MaterialControl,
  type Corrida,
  type AlertaWestgard,
} from '../constants/mockData';

// ============================================================
// Tipos que devuelve el backend (respuesta plana de PostgreSQL)
// ============================================================

interface MaterialBackend {
  id_material: number;
  laboratorio_id: number;
  area_id: number | null;
  nombre_material: string;
  fabricante: string | null;
  fecha_vencimiento: string | null;
  activo: boolean;
  eliminado: boolean;
}

interface LoteBackend {
  id_lote: number;
  material_id: number;
  numero_lote: string;
  nivel_control_id: number | null;
  activo: boolean;
  eliminado: boolean;
}

interface InsertoBackend {
  id_inserto: number;
  lote_id: number;
  analito_id: number;
  media_objetivo: number;
  ds_objetivo: number;
  activo: boolean;
}

interface CorridaBackend {
  id_corrida: number;
  operario_id: number | null;
  inserto_id: number;
  fecha_corrida: string;
  valor_obtenido: number;
  aceptada: boolean;
  observaciones: string | null;
  notas_usuario: string | null;
}

interface AlertaBackend {
  id_corrida: number;
  operario_id: number | null;
  inserto_id: number;
  fecha_corrida: string;
  valor_obtenido: number;
  aceptada: boolean;
  notas_usuario: string | null;
}

// Nombres de analitos por ID (basados en mockData para enriquecer respuestas del backend)
const NOMBRES_ANALITOS: Record<number, { nombre: string; unidad: string }> = {
  101: { nombre: 'Hemoglobina (Hb)', unidad: 'g/dL' },
  102: { nombre: 'Hematocrito (Hto)', unidad: '%' },
  103: { nombre: 'Plaquetas', unidad: '10^3/µL' },
  104: { nombre: 'Leucocitos', unidad: '10^3/µL' },
  201: { nombre: 'Glucosa', unidad: 'mg/dL' },
  202: { nombre: 'Colesterol Total', unidad: 'mg/dL' },
  203: { nombre: 'Creatinina', unidad: 'mg/dL' },
  204: { nombre: 'Urea', unidad: 'mg/dL' },
  301: { nombre: 'TSH', unidad: 'µUI/mL' },
  302: { nombre: 'T4 Libre', unidad: 'ng/dL' },
  303: { nombre: 'Troponina I', unidad: 'ng/mL' },
  401: { nombre: 'TP (Tiempo de Protrombina)', unidad: 'segundos' },
  402: { nombre: 'TPT', unidad: 'segundos' },
};

const NOMBRES_AREAS: Record<number, string> = {
  1: 'Hematología',
  2: 'Química Clínica',
  3: 'Inmunología',
  4: 'Coagulación',
};

// Mapeo de nivel_control_id → número de nivel (1=Bajo, 2=Normal, 3=Alto)
const NIVEL_ID_A_NUMERO: Record<number, number> = { 1: 1, 2: 2, 3: 3 };

// ==========================================
// MATERIALES DE CONTROL
// ==========================================

export const obtenerMateriales = async (): Promise<MaterialControl[]> => {
  try {
    // 1. Obtener materiales planos del backend
    const materiales = await apiClient.get<MaterialBackend[]>('/api/materiales');

    if (!materiales || materiales.length === 0) return [];

    // 2. Para cada material, obtener sus lotes e insertos para armar la estructura completa
    const materialesEnriquecidos = await Promise.all(
      materiales.map(async (mat) => {
        try {
          const lotes = await apiClient.get<LoteBackend[]>(`/api/lotes/${mat.id_material}`);
          const nivelesEnriquecidos = await Promise.all(
            lotes
              .filter((l) => !l.eliminado && l.activo)
              .map(async (lote) => {
                const insertos = await apiClient.get<InsertoBackend[]>(
                  `/api/insertos/lote/${lote.id_lote}`
                );
                const nivel = lote.nivel_control_id
                  ? (NIVEL_ID_A_NUMERO[lote.nivel_control_id] ?? lote.nivel_control_id)
                  : 1;
                return {
                  nivel,
                  lote: lote.numero_lote,
                  analitosConfigurados: insertos.map((ins) => ({
                    analito_id: ins.analito_id,
                    analito_nombre: NOMBRES_ANALITOS[ins.analito_id]?.nombre ?? `Analito #${ins.analito_id}`,
                    unidad: NOMBRES_ANALITOS[ins.analito_id]?.unidad ?? 'unidad',
                    media: ins.media_objetivo,
                    ds: ins.ds_objetivo,
                  })),
                };
              })
          );

          return {
            id_material: mat.id_material,
            area_id: mat.area_id ?? 1,
            area_nombre: mat.area_id ? (NOMBRES_AREAS[mat.area_id] ?? 'Área General') : 'Área General',
            nombre_material: mat.nombre_material,
            fabricante: mat.fabricante ?? 'Sin fabricante',
            fecha_vencimiento: mat.fecha_vencimiento ?? '',
            activo: mat.activo,
            niveles: nivelesEnriquecidos,
          } as MaterialControl;
        } catch {
          // Si falla la obtención de lotes/insertos de un material, retornamos el material vacío
          return {
            id_material: mat.id_material,
            area_id: mat.area_id ?? 1,
            area_nombre: mat.area_id ? (NOMBRES_AREAS[mat.area_id] ?? 'Área General') : 'Área General',
            nombre_material: mat.nombre_material,
            fabricante: mat.fabricante ?? 'Sin fabricante',
            fecha_vencimiento: mat.fecha_vencimiento ?? '',
            activo: mat.activo,
            niveles: [],
          } as MaterialControl;
        }
      })
    );

    return materialesEnriquecidos;
  } catch (error) {
    console.error('[API] Error al obtener materiales:', error);
    throw error;
  }
};

export const guardarMaterial = async (material: MaterialControl): Promise<MaterialControl> => {
  try {
    const payload = {
      nombre_material: material.nombre_material,
      fabricante: material.fabricante,
      fecha_vencimiento: material.fecha_vencimiento,
      area_id: material.area_id || null,
    };

    if (material.id_material && material.id_material > 1000000) {
      // ID generado localmente (nuevo material que aún no existe en BD)
      const respuesta = await apiClient.post<{ id_material: number }>('/api/materiales', payload);
      const nuevoId = respuesta.id_material;

      // Crear lotes e insertos asociados al nuevo material
      await _crearLotesEInsertos(nuevoId, material);

      return { ...material, id_material: nuevoId };
    } else {
      // Material existente: actualizar datos básicos
      await apiClient.put(`/api/materiales/${material.id_material}`, payload);
      return material;
    }
  } catch (error) {
    console.error('[API] Error al guardar material:', error);
    throw error;
  }
};

/** Crea los lotes e insertos asociados a un material recién creado */
const _crearLotesEInsertos = async (materialId: number, material: MaterialControl) => {
  for (const nivelObj of material.niveles) {
    try {
      // Mapear número de nivel → nivel_control_id (1=Bajo, 2=Normal, 3=Alto)
      const loteResp = await apiClient.post<{ lote: { id_lote: number } }>('/api/lotes', {
        numero_lote: nivelObj.lote,
        material_id: materialId,
        nivel_control_id: nivelObj.nivel, // 1, 2, ó 3
      });

      const idLote = loteResp.lote?.id_lote;
      if (!idLote) continue;

      // Crear insertos para cada analito del nivel
      for (const an of nivelObj.analitosConfigurados) {
        await apiClient.post('/api/insertos', {
          lote_id: idLote,
          analito_id: an.analito_id,
          media_objetivo: an.media,
          ds_objetivo: an.ds,
        });
      }
    } catch (err) {
      console.warn(`[API] No se pudo crear lote/inserto para nivel ${nivelObj.nivel}:`, err);
    }
  }
};

export const eliminarMaterial = async (id_material: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/materiales/${id_material}`);
  } catch (error) {
    console.error('[API] Error al eliminar material:', error);
    throw error;
  }
};

// ==========================================
// CORRIDAS DIARIAS
// ==========================================

export const obtenerCorridas = async (): Promise<Corrida[]> => {
  try {
    const corridas = await apiClient.get<CorridaBackend[]>('/api/corridas');

    // Transformar respuesta plana del backend al tipo enriquecido del frontend
    return corridas.map((c) => ({
      id_corrida: c.id_corrida,
      material_id: 0, // No disponible directamente, se resolvería con join futuro
      material_nombre: `Inserto #${c.inserto_id}`,
      area_id: 0,
      area_nombre: 'Ver BD',
      analito_id: 0,
      analito_nombre: `Inserto #${c.inserto_id}`,
      nivel: 1,
      lote: '-',
      fecha_corrida: c.fecha_corrida,
      valor_obtenido: c.valor_obtenido,
      z_score: 0, // El backend no retorna z_score en GET, solo evalúa en POST
      aceptada: c.aceptada,
      observaciones: c.observaciones ?? undefined,
      notas_usuario: c.notas_usuario ?? undefined,
    }));
  } catch (error) {
    console.error('[API] Error al obtener corridas:', error);
    throw error;
  }
};

export const guardarCorridas = async (corridas: Corrida[]): Promise<Corrida[]> => {
  try {
    // El backend evalúa Westgard automáticamente en POST /api/corridas
    // Necesitamos inserto_id: usamos la configuración del material para hallarlo
    const resultados: Corrida[] = [];

    for (const corrida of corridas) {
      try {
        // Buscar el inserto_id correcto desde el backend
        const insertos = await apiClient.get<InsertoBackend[]>(
          `/api/insertos/por-analito-nivel?analito_id=${corrida.analito_id}&lote_nombre=${encodeURIComponent(corrida.lote)}`
        );

        const inserto = insertos?.[0];
        if (!inserto) {
          console.warn(`[API] No se encontró inserto para analito ${corrida.analito_id} nivel ${corrida.nivel}`);
          continue;
        }

        const respuesta = await apiClient.post<CorridaBackend>('/api/corridas', {
          inserto_id: inserto.id_inserto,
          valor_obtenido: corrida.valor_obtenido,
          notas_usuario: corrida.notas_usuario || corrida.observaciones || '',
          // operario_id: no requerido si el backend lo hace opcional
        });

        resultados.push({
          ...corrida,
          id_corrida: respuesta.id_corrida,
          aceptada: respuesta.aceptada,
          notas_usuario: respuesta.notas_usuario ?? undefined,
        });
      } catch (err) {
        console.warn('[API] Error al guardar corrida individual:', err);
      }
    }

    return resultados;
  } catch (error) {
    console.error('[API] Error al guardar corridas:', error);
    throw error;
  }
};

// ==========================================
// ALERTAS WESTGARD (Eventos de calidad)
// ==========================================

export const obtenerAlertas = async (): Promise<AlertaWestgard[]> => {
  try {
    const respuesta = await apiClient.get<{ total_alertas: number; eventos: AlertaBackend[] }>(
      '/api/eventos/alertas'
    );

    const eventos = respuesta.eventos ?? [];

    // Transformar corridas rechazadas al tipo AlertaWestgard del frontend
    return eventos.map((ev, idx) => {
      // Extraer la regla violada del campo notas_usuario (el backend la guarda ahí)
      const notas = ev.notas_usuario ?? '';
      const reglaMatch = notas.match(/(\d_\d+s|R_4s)/);
      const regla = reglaMatch ? reglaMatch[0] : 'Westgard';

      // Calcular z-score aproximado si tenemos acceso a los datos (o mostramos 0)
      return {
        id: ev.id_corrida,
        analito: `Inserto #${ev.inserto_id}`,
        area: 'Ver BD',
        material: `Inserto #${ev.inserto_id}`,
        lote: '-',
        nivel: 'N/A',
        regla,
        valor: ev.valor_obtenido,
        media: 0,
        ds: 0,
        z_score: 0,
        fecha: ev.fecha_corrida,
      } as AlertaWestgard;
    });
  } catch (error) {
    console.error('[API] Error al obtener alertas:', error);
    throw error;
  }
};

export const resolverAlerta = async (id_corrida: number, accionCorrectiva = ''): Promise<void> => {
  try {
    await apiClient.patch(`/api/eventos/${id_corrida}/resolver`, {
      accion_correctiva: accionCorrectiva,
    });
  } catch (error) {
    console.error('[API] Error al resolver alerta:', error);
    throw error;
  }
};
