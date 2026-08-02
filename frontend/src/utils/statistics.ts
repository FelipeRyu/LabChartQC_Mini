/**
 * Utilidades estadísticas y evaluación de reglas de control de calidad (Westgard).
 */

/**
 * Calcula el Z-Score para un valor obtenido dado su media y desviación estándar (DS).
 * Fórmula: Z = (X - Media) / DS
 */
export const calcularZScore = (valor: number, media: number, ds: number): number => {
  if (ds === 0) return 0;
  return Number(((valor - media) / ds).toFixed(2));
};

/**
 * Evalúa la regla básica de Westgard 1_3s: Un único punto excede ±3 DS.
 * Indica un error aleatorio inaceptable o el inicio de un gran error sistemático.
 */
export const evaluarRegla1_3s = (zScore: number): boolean => {
  return Math.abs(zScore) > 3;
};

/**
 * Evalúa la regla de Westgard 1_2s (Regla de Advertencia): Un único punto excede ±2 DS.
 * Sirve como advertencia para revisar los datos cuidadosamente.
 */
export const evaluarRegla1_2s = (zScore: number): boolean => {
  return Math.abs(zScore) > 2;
};

/**
 * Retorna la clase CSS de color según la severidad del Z-Score.
 * Verde: < 2 DS (Normal)
 * Ámbar: >= 2 DS y <= 3 DS (Advertencia 1_2s)
 * Rojo pulso: > 3 DS (Rechazo 1_3s)
 */
export const obtenerColorZScore = (zScore: number): string => {
  const absZ = Math.abs(zScore);
  if (absZ > 3) return 'text-red-400 animate-pulse';
  if (absZ > 2) return 'text-amber-400';
  return 'text-emerald-400';
};
