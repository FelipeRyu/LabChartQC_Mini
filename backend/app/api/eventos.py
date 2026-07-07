# Archivo: app/api/eventos.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db

# Importamos TODAS las piezas del rompecabezas basándonos en tu diagrama ER
from app.models.models import (
    Corrida, 
    InsertoValor, 
    Analito, 
    LoteMaterial, 
    MaterialControl, 
    AreaLaboratorio, 
    NivelControl
)
from app.core.security import obtener_usuario_actual

router = APIRouter(tags=["Eventos de Calidad (Alarmas)"])

@router.get("/api/eventos/alertas")
def obtener_alertas_westgard(
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual)
):
    """
    Escanea el sistema y devuelve únicamente las corridas rechazadas por Westgard.
    Cruza todas las tablas del diagrama ER para devolver texto legible.
    """
    # 1. Trazamos el camino exacto de tu diagrama con JOINs
    alertas_crudas = db.query(
        Corrida, InsertoValor, Analito, LoteMaterial, MaterialControl, AreaLaboratorio, NivelControl
    ).join(
        InsertoValor, Corrida.inserto_id == InsertoValor.id_inserto
    ).join(
        Analito, InsertoValor.analito_id == Analito.id_analito
    ).join(
        LoteMaterial, InsertoValor.lote_id == LoteMaterial.id_lote
    ).join(
        MaterialControl, LoteMaterial.material_id == MaterialControl.id_material
    ).join(
        AreaLaboratorio, MaterialControl.area_id == AreaLaboratorio.id
    ).join(
        NivelControl, LoteMaterial.nivel_control_id == NivelControl.id
    ).filter(
        Corrida.aceptada == False
    ).order_by(
        Corrida.fecha_corrida.desc()
    ).limit(50).all()
    
    # 2. Empaquetamos los datos en el "molde" que exige el Frontend
    eventos_formateados = []
    
    for corrida, inserto, analito, lote, material, area, nivel in alertas_crudas:
        
        # Extraemos la regla violada de las notas de la corrida (Si existe)
        notas = corrida.notas_usuario or ""
        regla_detectada = notas.split("|")[-1].strip() if "Validación" in notas else "Regla Westgard"
        
        # Calculamos el Z-Score matemático real
        z_score = 0
        if inserto.ds_objetivo > 0:
            z_score = (corrida.valor_obtenido - inserto.media_objetivo) / inserto.ds_objetivo
            
        eventos_formateados.append({
            "id": corrida.id_corrida,
            "analito": analito.nombre,             # Desde la tabla analitos
            "area": area.nombre,                   # Desde la tabla areas_laboratorio
            "material": material.nombre_material,  # Desde la tabla materiales_control
            "lote": lote.numero_lote,              # Desde la tabla lotes_material
            "nivel": nivel.nombre,                 # Desde la tabla niveles_control
            "regla": regla_detectada,
            "valor": corrida.valor_obtenido,
            "media": inserto.media_objetivo,
            "ds": inserto.ds_objetivo,
            "z_score": round(z_score, 2),
            "fecha": corrida.fecha_corrida
        })
    
    return {
        "total_alertas": len(eventos_formateados),
        "eventos": eventos_formateados
    }