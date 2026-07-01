# Archivo: app/api/eventos.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Corrida
from app.core.security import obtener_usuario_actual

router = APIRouter(tags=["Eventos de Calidad (Alarmas)"])

@router.get("/api/eventos/alertas")
def obtener_alertas_westgard(
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual)
):
    """
    Escanea el sistema y devuelve únicamente las corridas que fueron rechazadas 
    debido a la violación de una Regla de Westgard. Ideal para el Dashboard principal.
    """
    # Filtramos donde 'aceptada' sea False (es decir, violó una regla de Westgard)
    alertas = db.query(Corrida).filter(
        Corrida.aceptada == False
    ).order_by(Corrida.fecha_corrida.desc()).all()
    
    return {
        "total_alertas": len(alertas),
        "eventos": alertas
    }