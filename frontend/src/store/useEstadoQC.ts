import { create } from 'zustand';
import { type MaterialControl } from '../constants/mockData';

export type TipoPestana = 'resumen' | 'ingreso' | 'corridas' | 'bitacora' | 'graficas';

interface EstadoQC {
  // Estado local UI
  pestanaActiva: TipoPestana;
  setPestanaActiva: (pestana: TipoPestana) => void;
  
  filtroAreaSeleccionada: number;
  setFiltroAreaSeleccionada: (idArea: number) => void;

  materialEnEdicion: MaterialControl | null;
  setMaterialEnEdicion: (material: MaterialControl | null) => void;
}

export const useEstadoQC = create<EstadoQC>((set) => ({
  pestanaActiva: 'resumen',
  setPestanaActiva: (pestana) => set({ pestanaActiva: pestana }),
  
  filtroAreaSeleccionada: 1, // Hematología por defecto
  setFiltroAreaSeleccionada: (idArea) => set({ filtroAreaSeleccionada: idArea }),
  
  materialEnEdicion: null,
  setMaterialEnEdicion: (material) => set({ materialEnEdicion: material })
}));
