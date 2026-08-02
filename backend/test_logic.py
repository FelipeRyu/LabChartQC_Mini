# Archivo: backend/test_logic.py
"""
Sscript de prueba para validar el motor estadístico de LabChart QC
antes de la integración definitiva.
"""

from app.qc_logic import calcular_estadisticas_historicas, validar_regla_1_3s

def ejecutar_pruebas():
    print("--- INICIANDO PRUEBAS DEL CEREBRO MATEMÁTICO ---")
    
    # 1. Simulamos 5 días de resultados de Glucosa (mg/dL)
    datos_glucosa = [100.0, 102.0, 98.0, 101.5, 99.0]
    print(f"\nDatos de entrada: {datos_glucosa}")
    
    stats = calcular_estadisticas_historicas(datos_glucosa)
    
    print("\nResultados Estadísticos:")
    print(f"- Media calculada: {stats['media']}")
    print(f"- Desviación Estándar (SD): {stats['sd']}")
    print(f"- Coeficiente de Variación (CV%): {stats['cv_porcentaje']}%")
    
    # 2. Prueba de validación de regla (Z-Score)
    # Supongamos que hoy la máquina arrojó un valor muy alto
    valor_hoy = 110.0
    media_objetivo = 100.0
    sd_objetivo = 2.5
    
    print(f"\nEvaluando resultado de hoy: {valor_hoy}")
    print(f"Meta: Media {media_objetivo} | SD {sd_objetivo}")
    
    validacion = validar_regla_1_3s(valor_hoy, media_objetivo, sd_objetivo)
    
    print("\nResultado de la Regla 1_3s:")
    print(f"- Z-Score (Índice de Desviación): {validacion['z_score']}")
    print(f"- ¿Viola la regla?: {validacion['viola_regla']}")
    print(f"- Mensaje del sistema: {validacion['mensaje']}")

if __name__ == "__main__":
    ejecutar_pruebas()