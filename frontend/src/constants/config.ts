/**
 * ARCHIVO: src/constants/config.ts
 * MISIÓN: Constantes de configuración estática de la aplicación.
 * Estos datos definen las áreas, analitos y opciones de UI.
 * 
 * IMPORTANTE: Los id_analito deben coincidir con los IDs reales
 * de la tabla 'analitos' en PostgreSQL.
 */

import type { Area } from './types';

export const LAB_INFO = {
  nombre: "Laboratorio Clínico San José",
  codigo_habilitacion: "H-54001-02",
  ciudad: "Cúcuta, Norte de Santander",
  logo_url: "/lab_logo_sanjose.png"
};

export const AREAS: Area[] = [
  { id: 1, nombre: "Hematología" },
  { id: 2, nombre: "Química Clínica" },
  { id: 3, nombre: "Inmunología" },
  { id: 4, nombre: "Coagulación" },
  { id: 5, nombre: "Endocrinología" }
];

/** Maps a DB categoria string to an area ID */
export const categoriaToAreaId = (categoria: string): number => {
  const cat = categoria.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (cat.includes('hematolog')) return 1;
  if (cat.includes('quimica') || cat.includes('qumica')) return 2;
  if (cat.includes('inmunolog')) return 3;
  if (cat.includes('hemostasia') || cat.includes('coagulac')) return 4;
  if (cat.includes('endocrinolog') || cat.includes('hormon')) return 5;
  return 2; // default to Química Clínica
};

/**
 * Catálogo de analitos por área. (Fallback local si no carga BD)
 * Los IDs corresponden a la tabla 'analitos' de PostgreSQL.
 */
export const ANALITOS_POR_AREA: Record<number, { id_analito: number; nombre: string; unidades: string[] }[]> = {
  1: [ // Hematología (IDs reales de BD)
    { id_analito: 76, nombre: "Hemoglobina (Hb)", unidades: ["g/dL", "g/L"] },
    { id_analito: 77, nombre: "Hematocrito (Hto)", unidades: ["%", "L/L"] },
    { id_analito: 79, nombre: "Plaquetas", unidades: ["10^3/µL", "10^9/L"] },
    { id_analito: 81, nombre: "Leucocitos (WBC)", unidades: ["10^3/µL", "10^9/L"] }
  ],
  2: [ // Química Clínica (IDs reales de BD)
    { id_analito: 1, nombre: "Glucosa", unidades: ["mg/dL", "mmol/L"] },
    { id_analito: 7, nombre: "Colesterol Total", unidades: ["mg/dL", "mmol/L"] },
    { id_analito: 19, nombre: "Creatinina", unidades: ["mg/dL", "µmol/L"] },
    { id_analito: 17, nombre: "Urea", unidades: ["mg/dL", "mmol/L"] }
  ],
  3: [ // Inmunología (IDs reales de BD)
    { id_analito: 28, nombre: "TSH", unidades: ["µUI/mL", "mUI/L"] },
    { id_analito: 94, nombre: "T4 Libre", unidades: ["ng/dL", "pmol/L"] },
    { id_analito: 95, nombre: "Troponina I", unidades: ["ng/mL", "µg/L"] }
  ],
  4: [ // Coagulación (IDs reales de BD)
    { id_analito: 72, nombre: "TP (Tiempo de Protrombina)", unidades: ["segundos", "INR"] },
    { id_analito: 73, nombre: "TPT (Tiempo Parcial de Tromboplastina)", unidades: ["segundos"] }
  ]
};
