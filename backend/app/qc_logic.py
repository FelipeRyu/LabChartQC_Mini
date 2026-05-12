# Archivo: app/qc_logic.py
"""
ARCHIVO: app/qc_logic.py
MISION: Motor estadístico y validación bioclínica.
RESPONSABILIDAD: 
1. Calcular Media, Desviación Estándar y Coeficiente de Variación.
2. Implementar las Reglas de Westgard (1_3s, 2_2s, etc.).
3. Retornar estados de 'Aceptado' o 'Rechazado' con su justificación técnica.
"""

import math
from typing import List, Dict, Union

def calcular_estadisticas_historicas(valores: List[float]) -> Dict[str, Union[float, str]]:
    """
    Recibe una lista de resultados históricos y calcula la estadística descriptiva básica.
    """
    n = len(valores)
    
    if n == 0:
        return {"error": "No hay datos suficientes para calcular estadística."}
    
    # 1. Calcular Media
    media = sum(valores) / n
    
    if n == 1:
        # No se puede calcular SD con un solo valor (división por n-1)
        return {
            "n": n,
            "media": round(media, 2),
            "sd": 0.0,
            "cv_porcentaje": 0.0
        }
        
    # 2. Calcular Desviación Estándar (Muestral: n - 1)
    suma_varianzas = sum((x - media) ** 2 for x in valores)
    sd = math.sqrt(suma_varianzas / (n - 1))
    
    # 3. Calcular Coeficiente de Variación (CV%)
    cv = (sd / media) * 100 if media != 0 else 0.0
    
    return {
        "n": n,
        "media": round(media, 2),
        "sd": round(sd, 2),
        "cv_porcentaje": round(cv, 2)
    }

def validar_regla_1_3s(valor_control: float, media_objetivo: float, sd_objetivo: float) -> dict:
    """
    Evalúa si un resultado viola la regla de Westgard 1_3s.
    """
    if sd_objetivo == 0:
        return {"error": "La Desviación Estándar objetivo no puede ser cero."}

    # Cálculo del Z-Score
    z_score = (valor_control - media_objetivo) / sd_objetivo
    
    # Evaluación de la regla (Límite crítico de ±3 SD)
    es_rechazado = abs(z_score) > 3
    
    return {
        "valor_evaluado": valor_control,
        "z_score": round(z_score, 2),
        "viola_regla": es_rechazado,
        "regla": "1_3s",
        "mensaje": "RECHAZO: El valor excede las ±3 Desviaciones Estándar" if es_rechazado else "Aceptado"
    }