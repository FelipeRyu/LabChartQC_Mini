/**
 * ARCHIVO: src/constants/config.ts
 * MISIÓN: Constantes de configuración estática de la aplicación.
 * Estos datos definen las áreas, analitos y opciones de UI.
 * NO son datos mock — son configuración fija del sistema.
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
  { id: 4, nombre: "Coagulación" }
];

export const ANALITOS_POR_AREA: Record<number, { id_analito: number; nombre: string; unidades: string[] }[]> = {
  1: [ // Hematología
    { id_analito: 101, nombre: "Hemoglobina (Hb)", unidades: ["g/dL", "g/L"] },
    { id_analito: 102, nombre: "Hematocrito (Hto)", unidades: ["%", "L/L"] },
    { id_analito: 103, nombre: "Plaquetas", unidades: ["10^3/µL", "10^9/L"] },
    { id_analito: 104, nombre: "Leucocitos", unidades: ["10^3/µL", "10^9/L"] }
  ],
  2: [ // Química Clínica
    { id_analito: 201, nombre: "Glucosa", unidades: ["mg/dL", "mmol/L"] },
    { id_analito: 202, nombre: "Colesterol Total", unidades: ["mg/dL", "mmol/L"] },
    { id_analito: 203, nombre: "Creatinina", unidades: ["mg/dL", "µmol/L"] },
    { id_analito: 204, nombre: "Urea", unidades: ["mg/dL", "mmol/L"] }
  ],
  3: [ // Inmunología
    { id_analito: 301, nombre: "TSH", unidades: ["µUI/mL", "mUI/L"] },
    { id_analito: 302, nombre: "T4 Libre", unidades: ["ng/dL", "pmol/L"] },
    { id_analito: 303, nombre: "Troponina I", unidades: ["ng/mL", "µg/L"] }
  ],
  4: [ // Coagulación
    { id_analito: 401, nombre: "TP (Tiempo de Protrombina)", unidades: ["segundos", "INR"] },
    { id_analito: 402, nombre: "TPT (Tiempo Parcial de Tromboplastina)", unidades: ["segundos"] }
  ]
};
