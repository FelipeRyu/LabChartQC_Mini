import {
  MOCK_MATERIALES_CONTROL,
  MOCK_CORRIDAS,
  MOCK_ALERTAS_WESTGARD,
  type MaterialControl,
  type Corrida,
  type AlertaWestgard
} from '../constants/mockData';

// Función auxiliar para simular latencia de red
// Función auxiliar para simular latencia de red
const retrasar = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// MATERIALES DE CONTROL
// ==========================================

export const obtenerMateriales = async (): Promise<MaterialControl[]> => {
  await retrasar(600); // Simulamos 600ms de red
  // Simulamos leer de un LocalStorage o retornamos MOCK_MATERIALES_CONTROL
  const almacenados = localStorage.getItem('materialesQC');
  if (almacenados) {
    return JSON.parse(almacenados);
  }
  return MOCK_MATERIALES_CONTROL;
};

export const guardarMaterial = async (material: MaterialControl): Promise<MaterialControl> => {
  await retrasar(800);
  // Aquí la lógica de guardado en "Base de datos"
  const actuales = await obtenerMateriales();
  let nuevos;
  
  // Es edición (tiene un ID real > 0 para simplificar, en un entorno real checamos existencia)
  const existe = actuales.find(m => m.id_material === material.id_material);
  if (existe) {
    nuevos = actuales.map(m => m.id_material === material.id_material ? material : m);
  } else {
    // Es creación
    material.id_material = Date.now(); // Generamos un ID falso
    nuevos = [material, ...actuales];
  }
  
  localStorage.setItem('materialesQC', JSON.stringify(nuevos));
  return material;
};

export const eliminarMaterial = async (id_material: number): Promise<void> => {
  await retrasar(500);
  const actuales = await obtenerMateriales();
  const nuevos = actuales.filter(m => m.id_material !== id_material);
  localStorage.setItem('materialesQC', JSON.stringify(nuevos));
};

// ==========================================
// CORRIDAS DIARIAS
// ==========================================

export const obtenerCorridas = async (): Promise<Corrida[]> => {
  await retrasar(500);
  const almacenados = localStorage.getItem('corridasQC');
  if (almacenados) {
    return JSON.parse(almacenados);
  }
  return MOCK_CORRIDAS;
};

export const guardarCorridas = async (corridas: Corrida[]): Promise<Corrida[]> => {
  await retrasar(700);
  const actuales = await obtenerCorridas();
  const nuevasCorridas = corridas.map(c => ({ ...c, id: Date.now() + Math.random() }));
  const todas = [...nuevasCorridas, ...actuales];
  localStorage.setItem('corridasQC', JSON.stringify(todas));
  return nuevasCorridas;
};

// ==========================================
// ALERTAS WESTGARD
// ==========================================

export const obtenerAlertas = async (): Promise<AlertaWestgard[]> => {
  await retrasar(400);
  const almacenadas = localStorage.getItem('alertasQC');
  if (almacenadas) {
    return JSON.parse(almacenadas);
  }
  return MOCK_ALERTAS_WESTGARD;
};

export const resolverAlerta = async (id_alerta: number): Promise<void> => {
  await retrasar(500);
  const actuales = await obtenerAlertas();
  const nuevas = actuales.filter(a => a.id !== id_alerta);
  localStorage.setItem('alertasQC', JSON.stringify(nuevas));
};
