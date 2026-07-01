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

export const MOCK_ALERTAS_WESTGARD: AlertaWestgard[] = [
  {
    id: 1,
    analito: "Hemoglobina (Hb)",
    area: "Hematología",
    material: "LiquidCheck Hemo",
    lote: "H-904",
    nivel: "Nivel 3 (Alto)",
    regla: "1_3s",
    valor: 16.8,
    media: 15.0,
    ds: 0.5,
    z_score: 3.6,
    fecha: "2026-06-09T08:34:00Z"
  },
  {
    id: 2,
    analito: "Glucosa",
    area: "Química Clínica",
    material: "MultiChem Clin",
    lote: "Q-702",
    nivel: "Nivel 1 (Bajo)",
    regla: "2_2s",
    valor: 64.0,
    media: 70.0,
    ds: 2.5,
    z_score: -2.4,
    fecha: "2026-06-09T09:12:00Z"
  }
];

export const MOCK_MATERIALES_CONTROL: MaterialControl[] = [
  {
    id_material: 1,
    area_id: 1,
    area_nombre: "Hematología",
    nombre_material: "LiquidCheck Hemo",
    fabricante: "Bio-Rad Laboratories",
    fecha_vencimiento: "2026-12-15", // Vigente
    activo: true,
    niveles: [
      {
        nivel: 1,
        lote: "H-902",
        analitosConfigurados: [
          { analito_id: 101, analito_nombre: "Hemoglobina (Hb)", unidad: "g/dL", media: 11.2, ds: 0.3 }
        ]
      },
      {
        nivel: 2,
        lote: "H-903",
        analitosConfigurados: [
          { analito_id: 101, analito_nombre: "Hemoglobina (Hb)", unidad: "g/dL", media: 13.5, ds: 0.4 }
        ]
      }
    ]
  },
  {
    id_material: 2,
    area_id: 2,
    area_nombre: "Química Clínica",
    nombre_material: "MultiChem Clin",
    fabricante: "Technopath Clinical Diagnostics",
    fecha_vencimiento: "2026-05-01", // Vencido (Mayo 2026, fecha actual es Junio 2026)
    activo: true,
    niveles: [
      {
        nivel: 1,
        lote: "Q-702",
        analitosConfigurados: [
          { analito_id: 201, analito_nombre: "Glucosa", unidad: "mg/dL", media: 70.0, ds: 2.5 }
        ]
      }
    ]
  },
  {
    id_material: 3,
    area_id: 2,
    area_nombre: "Química Clínica",
    nombre_material: "Pathozyme Clin",
    fabricante: "Randox Laboratories",
    fecha_vencimiento: "2026-04-10", // Vencido
    activo: true,
    niveles: [
      {
        nivel: 2,
        lote: "P-443",
        analitosConfigurados: [
          { analito_id: 202, analito_nombre: "Colesterol Total", unidad: "mg/dL", media: 180.0, ds: 5.0 }
        ]
      }
    ]
  },
  {
    id_material: 4,
    area_id: 3,
    area_nombre: "Inmunología",
    nombre_material: "ImmunoTrol",
    fabricante: "Siemens Healthineers",
    fecha_vencimiento: "2026-11-30", // Vigente
    activo: true,
    niveles: [
      {
        nivel: 1,
        lote: "I-101",
        analitosConfigurados: [
          { analito_id: 301, analito_nombre: "TSH", unidad: "µUI/mL", media: 1.5, ds: 0.1 }
        ]
      }
    ]
  }
];

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

export const MOCK_CORRIDAS: Corrida[] = [
  // Hemoglobina Nivel 1 (Lote H-902, Media 11.2, DS 0.3)
  { id_corrida: 101, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-05-10T08:00:00Z", valor_obtenido: 11.2, z_score: 0.0, aceptada: true },
  { id_corrida: 102, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-05-11T08:00:00Z", valor_obtenido: 11.3, z_score: 0.33, aceptada: true },
  { id_corrida: 103, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-05-12T08:00:00Z", valor_obtenido: 11.0, z_score: -0.67, aceptada: true },
  { id_corrida: 104, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-05-13T08:00:00Z", valor_obtenido: 11.4, z_score: 0.67, aceptada: true },
  { id_corrida: 105, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-05-14T08:00:00Z", valor_obtenido: 11.5, z_score: 1.0, aceptada: true },
  { id_corrida: 106, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-05-15T08:00:00Z", valor_obtenido: 10.9, z_score: -1.0, aceptada: true },
  { id_corrida: 107, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-05-16T08:00:00Z", valor_obtenido: 11.2, z_score: 0.0, aceptada: true },
  { id_corrida: 108, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-05-17T08:00:00Z", valor_obtenido: 11.3, z_score: 0.33, aceptada: true },
  { id_corrida: 109, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-05-18T08:00:00Z", valor_obtenido: 11.1, z_score: -0.33, aceptada: true },
  { id_corrida: 110, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-05-19T08:00:00Z", valor_obtenido: 11.6, z_score: 1.33, aceptada: true },
  { id_corrida: 111, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-05-20T08:00:00Z", valor_obtenido: 11.2, z_score: 0.0, aceptada: true },
  { id_corrida: 112, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-05-21T08:00:00Z", valor_obtenido: 11.3, z_score: 0.33, aceptada: true },
  { id_corrida: 113, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-05-22T08:00:00Z", valor_obtenido: 10.8, z_score: -1.33, aceptada: true },
  { id_corrida: 114, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-05-23T08:00:00Z", valor_obtenido: 11.1, z_score: -0.33, aceptada: true },
  { id_corrida: 115, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-05-24T08:00:00Z", valor_obtenido: 11.4, z_score: 0.67, aceptada: true },
  { id_corrida: 116, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-05-25T08:00:00Z", valor_obtenido: 11.5, z_score: 1.0, aceptada: true },
  { id_corrida: 117, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-05-26T08:00:00Z", valor_obtenido: 11.3, z_score: 0.33, aceptada: true },
  { id_corrida: 118, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-05-27T08:00:00Z", valor_obtenido: 11.1, z_score: -0.33, aceptada: true },
  { id_corrida: 119, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-05-28T08:00:00Z", valor_obtenido: 11.0, z_score: -0.67, aceptada: true },
  { id_corrida: 120, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-05-29T08:00:00Z", valor_obtenido: 11.2, z_score: 0.0, aceptada: true },
  { id_corrida: 121, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-05-30T08:00:00Z", valor_obtenido: 11.3, z_score: 0.33, aceptada: true },
  { id_corrida: 122, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-05-31T08:00:00Z", valor_obtenido: 11.4, z_score: 0.67, aceptada: true },
  { id_corrida: 123, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-06-01T08:00:00Z", valor_obtenido: 11.2, z_score: 0.0, aceptada: true },
  { id_corrida: 124, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-06-02T08:00:00Z", valor_obtenido: 11.0, z_score: -0.67, aceptada: true },
  { id_corrida: 125, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-06-03T08:00:00Z", valor_obtenido: 11.3, z_score: 0.33, aceptada: true },
  { id_corrida: 126, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-06-04T08:00:00Z", valor_obtenido: 11.4, z_score: 0.67, aceptada: true },
  { id_corrida: 127, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-06-05T08:00:00Z", valor_obtenido: 11.3, z_score: 0.33, aceptada: true },
  { id_corrida: 128, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 1, lote: "H-902", fecha_corrida: "2026-06-06T08:15:00Z", valor_obtenido: 11.1, z_score: -0.33, aceptada: true },

  // Hemoglobina Nivel 2 (Lote H-903, Media 13.5, DS 0.4)
  { id_corrida: 201, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-05-10T08:05:00Z", valor_obtenido: 13.5, z_score: 0.0, aceptada: true },
  { id_corrida: 202, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-05-11T08:05:00Z", valor_obtenido: 13.8, z_score: 0.75, aceptada: true },
  { id_corrida: 203, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-05-12T08:05:00Z", valor_obtenido: 13.2, z_score: -0.75, aceptada: true },
  { id_corrida: 204, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-05-13T08:05:00Z", valor_obtenido: 13.6, z_score: 0.25, aceptada: true },
  { id_corrida: 205, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-05-14T08:05:00Z", valor_obtenido: 13.9, z_score: 1.0, aceptada: true },
  { id_corrida: 206, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-05-15T08:05:00Z", valor_obtenido: 13.1, z_score: -1.0, aceptada: true },
  { id_corrida: 207, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-05-16T08:05:00Z", valor_obtenido: 13.4, z_score: -0.25, aceptada: true },
  { id_corrida: 208, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-05-17T08:05:00Z", valor_obtenido: 13.7, z_score: 0.5, aceptada: true },
  { id_corrida: 209, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-05-18T08:05:00Z", valor_obtenido: 13.5, z_score: 0.0, aceptada: true },
  { id_corrida: 210, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-05-19T08:05:00Z", valor_obtenido: 14.2, z_score: 1.75, aceptada: true },
  { id_corrida: 211, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-05-20T08:05:00Z", valor_obtenido: 13.4, z_score: -0.25, aceptada: true },
  { id_corrida: 212, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-05-21T08:05:00Z", valor_obtenido: 13.6, z_score: 0.25, aceptada: true },
  { id_corrida: 213, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-05-22T08:05:00Z", valor_obtenido: 13.0, z_score: -1.25, aceptada: true },
  { id_corrida: 214, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-05-23T08:05:00Z", valor_obtenido: 13.5, z_score: 0.0, aceptada: true },
  { id_corrida: 215, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-05-24T08:05:00Z", valor_obtenido: 13.9, z_score: 1.0, aceptada: true },
  { id_corrida: 216, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-05-25T08:05:00Z", valor_obtenido: 14.1, z_score: 1.5, aceptada: true },
  { id_corrida: 217, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-05-26T08:05:00Z", valor_obtenido: 13.4, z_score: -0.25, aceptada: true },
  { id_corrida: 218, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-05-27T08:05:00Z", valor_obtenido: 13.3, z_score: -0.5, aceptada: true },
  { id_corrida: 219, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-05-28T08:05:00Z", valor_obtenido: 13.2, z_score: -0.75, aceptada: true },
  { id_corrida: 220, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-05-29T08:05:00Z", valor_obtenido: 13.5, z_score: 0.0, aceptada: true },
  { id_corrida: 221, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-05-30T08:05:00Z", valor_obtenido: 13.8, z_score: 0.75, aceptada: true },
  { id_corrida: 222, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-05-31T08:05:00Z", valor_obtenido: 14.0, z_score: 1.25, aceptada: true },
  { id_corrida: 223, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-06-01T08:05:00Z", valor_obtenido: 13.5, z_score: 0.0, aceptada: true },
  { id_corrida: 224, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-06-02T08:05:00Z", valor_obtenido: 13.1, z_score: -1.0, aceptada: true },
  { id_corrida: 225, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-06-03T08:05:00Z", valor_obtenido: 13.6, z_score: 0.25, aceptada: true },
  { id_corrida: 226, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-06-04T08:05:00Z", valor_obtenido: 13.9, z_score: 1.0, aceptada: true },
  { id_corrida: 227, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-06-05T08:05:00Z", valor_obtenido: 13.6, z_score: 0.25, aceptada: true },
  { id_corrida: 228, material_id: 1, material_nombre: "LiquidCheck Hemo", area_id: 1, area_nombre: "Hematología", analito_id: 101, analito_nombre: "Hemoglobina (Hb)", nivel: 2, lote: "H-903", fecha_corrida: "2026-06-06T08:20:00Z", valor_obtenido: 14.8, z_score: 3.25, aceptada: false, observaciones: "Regla 1_3s rota (+3.25 SD)", notas_usuario: "Se repite mantenimiento" },

  // Glucosa Nivel 1 (Lote Q-702, Media 70.0, DS 2.5)
  { id_corrida: 301, material_id: 2, material_nombre: "MultiChem Clin", area_id: 2, area_nombre: "Química Clínica", analito_id: 201, analito_nombre: "Glucosa", nivel: 1, lote: "Q-702", fecha_corrida: "2026-05-10T09:00:00Z", valor_obtenido: 70.0, z_score: 0.0, aceptada: true },
  { id_corrida: 302, material_id: 2, material_nombre: "MultiChem Clin", area_id: 2, area_nombre: "Química Clínica", analito_id: 201, analito_nombre: "Glucosa", nivel: 1, lote: "Q-702", fecha_corrida: "2026-05-12T09:00:00Z", valor_obtenido: 71.5, z_score: 0.6, aceptada: true },
  { id_corrida: 303, material_id: 2, material_nombre: "MultiChem Clin", area_id: 2, area_nombre: "Química Clínica", analito_id: 201, analito_nombre: "Glucosa", nivel: 1, lote: "Q-702", fecha_corrida: "2026-05-14T09:00:00Z", valor_obtenido: 68.0, z_score: -0.8, aceptada: true },
  { id_corrida: 304, material_id: 2, material_nombre: "MultiChem Clin", area_id: 2, area_nombre: "Química Clínica", analito_id: 201, analito_nombre: "Glucosa", nivel: 1, lote: "Q-702", fecha_corrida: "2026-05-16T09:00:00Z", valor_obtenido: 73.0, z_score: 1.2, aceptada: true },
  { id_corrida: 305, material_id: 2, material_nombre: "MultiChem Clin", area_id: 2, area_nombre: "Química Clínica", analito_id: 201, analito_nombre: "Glucosa", nivel: 1, lote: "Q-702", fecha_corrida: "2026-05-18T09:00:00Z", valor_obtenido: 69.5, z_score: -0.2, aceptada: true },
  { id_corrida: 306, material_id: 2, material_nombre: "MultiChem Clin", area_id: 2, area_nombre: "Química Clínica", analito_id: 201, analito_nombre: "Glucosa", nivel: 1, lote: "Q-702", fecha_corrida: "2026-05-20T09:00:00Z", valor_obtenido: 70.8, z_score: 0.32, aceptada: true },
  { id_corrida: 307, material_id: 2, material_nombre: "MultiChem Clin", area_id: 2, area_nombre: "Química Clínica", analito_id: 201, analito_nombre: "Glucosa", nivel: 1, lote: "Q-702", fecha_corrida: "2026-05-22T09:00:00Z", valor_obtenido: 67.2, z_score: -1.12, aceptada: true },
  { id_corrida: 308, material_id: 2, material_nombre: "MultiChem Clin", area_id: 2, area_nombre: "Química Clínica", analito_id: 201, analito_nombre: "Glucosa", nivel: 1, lote: "Q-702", fecha_corrida: "2026-05-24T09:00:00Z", valor_obtenido: 74.1, z_score: 1.64, aceptada: true },
  { id_corrida: 309, material_id: 2, material_nombre: "MultiChem Clin", area_id: 2, area_nombre: "Química Clínica", analito_id: 201, analito_nombre: "Glucosa", nivel: 1, lote: "Q-702", fecha_corrida: "2026-05-26T09:00:00Z", valor_obtenido: 70.5, z_score: 0.2, aceptada: true },
  { id_corrida: 310, material_id: 2, material_nombre: "MultiChem Clin", area_id: 2, area_nombre: "Química Clínica", analito_id: 201, analito_nombre: "Glucosa", nivel: 1, lote: "Q-702", fecha_corrida: "2026-05-28T09:00:00Z", valor_obtenido: 69.2, z_score: -0.32, aceptada: true },
  { id_corrida: 311, material_id: 2, material_nombre: "MultiChem Clin", area_id: 2, area_nombre: "Química Clínica", analito_id: 201, analito_nombre: "Glucosa", nivel: 1, lote: "Q-702", fecha_corrida: "2026-05-30T09:00:00Z", valor_obtenido: 70.0, z_score: 0.0, aceptada: true },
  { id_corrida: 312, material_id: 2, material_nombre: "MultiChem Clin", area_id: 2, area_nombre: "Química Clínica", analito_id: 201, analito_nombre: "Glucosa", nivel: 1, lote: "Q-702", fecha_corrida: "2026-06-01T09:00:00Z", valor_obtenido: 66.8, z_score: -1.28, aceptada: true },
  { id_corrida: 313, material_id: 2, material_nombre: "MultiChem Clin", area_id: 2, area_nombre: "Química Clínica", analito_id: 201, analito_nombre: "Glucosa", nivel: 1, lote: "Q-702", fecha_corrida: "2026-06-03T09:00:00Z", valor_obtenido: 71.2, z_score: 0.48, aceptada: true },
  { id_corrida: 314, material_id: 2, material_nombre: "MultiChem Clin", area_id: 2, area_nombre: "Química Clínica", analito_id: 201, analito_nombre: "Glucosa", nivel: 1, lote: "Q-702", fecha_corrida: "2026-06-05T09:00:00Z", valor_obtenido: 72.8, z_score: 1.12, aceptada: true },
  { id_corrida: 315, material_id: 2, material_nombre: "MultiChem Clin", area_id: 2, area_nombre: "Química Clínica", analito_id: 201, analito_nombre: "Glucosa", nivel: 1, lote: "Q-702", fecha_corrida: "2026-06-09T09:12:00Z", valor_obtenido: 64.0, z_score: -2.4, aceptada: true }
];


