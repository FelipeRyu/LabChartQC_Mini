"""
ARCHIVO: app/qc_logic.py
MISION: Motor estadístico y validación bioclínica.
RESPONSABILIDAD: 
1. Implementar las Reglas de Westgard (1_3s, R4s, etc.).
2. Calcular Z-Score, Media, Desviación Estándar y Coeficiente de Variación.
3. Retornar estados de 'Aceptado' o 'Rechazado' con su justificación técnica.
"""

from pydantic import BaseModel
from typing import Optional

def validar_regla_1_3s(valor_control: float, media: float, desviacion_estandar: float) -> dict:
    """
    Evalúa si un resultado viola la regla de Westgard 1_3s.
    Retorna un diccionario con el estado y el Z-score.
    """
    # Cálculo del Z-Score (Índice de Desviación Estándar)
    z_score = (valor_control - media) / desviacion_estandar
    
    # Evaluación de la regla (Límite crítico de ±3 SD)
    es_rechazado = abs(z_score) > 3
    
    return {
        "z_score": round(z_score, 2),
        "viola_regla": es_rechazado,
        "mensaje": "RECHAZO: Fuera de 3SD" if es_rechazado else "Aceptado"
    }

"""Las otras reglas de Westgard deben analizar varias corridas"""