# Archivo: app/qc_logic.py
"""
ARCHIVO: app/qc_logic.py
MISION: Motor estadístico multiregla (Westgard).
RESPONSABILIDAD: 
Evaluar un resultado en contexto histórico para aplicar 
las reglas 1_3s, 2_2s, R_4s y 1_2s.
"""

from typing import List

def evaluar_westgard(valores_recientes: List[float], media_objetivo: float, sd_objetivo: float) -> dict:
    """
    Evalúa una serie de valores recientes (ordenados del más antiguo al más nuevo)
    contra las reglas principales de Westgard. El último valor de la lista es la corrida actual.
    """
    if not valores_recientes or sd_objetivo == 0:
        return {
            "viola_regla": False, 
            "mensaje": "No hay datos suficientes o SD es 0.", 
            "regla_rota": None
        }

    # Convertimos todos los valores a Z-Scores
    z_scores = [(v - media_objetivo) / sd_objetivo for v in valores_recientes]
    z_actual = z_scores[-1] # El último dato (el de hoy)

    # 1. Evaluar Regla 1_3s (Rechazo Sistemático/Aleatorio Fuerte)
    if abs(z_actual) >= 3:
        return {
            "viola_regla": True, 
            "mensaje": "RECHAZO: Viola regla 1_3s (Valor excede ±3 SD)", 
            "regla_rota": "1_3s"
        }

    # Evaluar reglas que requieren al menos 2 datos históricos
    if len(z_scores) >= 2:
        z_previo = z_scores[-2]

        # 2. Evaluar Regla 2_2s (Rechazo Sistemático)
        # Ambos valores > +2 o ambos < -2
        if (z_actual >= 2 and z_previo >= 2) or (z_actual <= -2 and z_previo <= -2):
            return {
                "viola_regla": True, 
                "mensaje": "RECHAZO: Viola regla 2_2s (Dos consecutivos exceden 2 SD del mismo lado)", 
                "regla_rota": "2_2s"
            }

        # 3. Evaluar Regla R_4s (Rechazo Aleatorio)
        # La diferencia entre el actual y el anterior es mayor o igual a 4 SD
        diferencia = abs(z_actual - z_previo)
        if diferencia >= 4:
            return {
                "viola_regla": True, 
                "mensaje": "RECHAZO: Viola regla R_4s (Diferencia de 4 SD entre consecutivos)", 
                "regla_rota": "R_4s"
            }

    # 4. Evaluar Regla 1_2s (Alarma/Advertencia, NO rechaza la corrida)
    if abs(z_actual) >= 2:
        return {
            "viola_regla": False, # Es false porque se acepta, pero lanza una nota
            "mensaje": "ADVERTENCIA: Rompe regla 1_2s. Posible tendencia.", 
            "regla_rota": "1_2s"
        }

    # Si sobrevive a todas las evaluaciones:
    return {
        "viola_regla": False, 
        "mensaje": "Aceptado: Condición normal.", 
        "regla_rota": None
    }