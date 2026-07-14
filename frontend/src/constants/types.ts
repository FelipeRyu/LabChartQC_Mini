/**
 * ARCHIVO: src/constants/types.ts
 * MISIÓN: Interfaces TypeScript centralizadas para toda la aplicación.
 * Estos tipos definen la estructura de datos que usa el frontend.
 */

export interface Area {
  id: number;
  nombre: string;
}

export interface Analito {
  id_analito: number;
  nombre: string;
  unidad_medida: string;
  area_id: number;
}

export interface MaterialControl {
  id_material: number;
  area_id: number;
  area_nombre: string;
  nombre_material: string;
  fabricante: string;
  fecha_vencimiento: string;
  activo: boolean;
  niveles: {
    nivel: number;
    lote: string;
    analitosConfigurados: {
      analito_id: number;
      analito_nombre: string;
      unidad: string;
      media: number;
      ds: number;
    }[];
  }[];
}

export interface AlertaWestgard {
  id: number;
  analito: string;
  area: string;
  material: string;
  lote: string;
  nivel: string;
  regla: string;
  valor: number;
  media: number;
  ds: number;
  z_score: number;
  fecha: string;
}

export interface Corrida {
  id_corrida: number;
  material_id: number;
  material_nombre: string;
  area_id: number;
  area_nombre: string;
  analito_id: number;
  analito_nombre: string;
  nivel: number;
  lote: string;
  fecha_corrida: string;
  valor_obtenido: number;
  z_score: number;
  aceptada: boolean;
  observaciones?: string;
  notas_usuario?: string;
}
