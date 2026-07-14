# Archivo: app/api/eventos.py
"""
Gestión de Eventos y Alertas de Calidad (Reglas de Westgard violadas).
Permite consultar corridas rechazadas y marcarlas como resueltas con una acción correctiva.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.models.models import Corrida, Laboratorio
from app.core.security import obtener_usuario_actual

router = APIRouter(tags=["Eventos de Calidad (Alarmas)"])


class AccionResolucion(BaseModel):
    accion_correctiva: Optional[str] = ""


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


@router.patch("/api/eventos/{corrida_id}/resolver", status_code=status.HTTP_200_OK)
def resolver_alerta(
    corrida_id: int,
    datos: AccionResolucion,
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual)
):
    """
    Marca una corrida rechazada como resuelta, registrando la acción correctiva tomada.
    En el modelo actual, esto significa actualizar las notas de la corrida.
    """
    corrida = db.query(Corrida).filter(Corrida.id_corrida == corrida_id).first()

    if not corrida:
        raise HTTPException(status_code=404, detail="Corrida no encontrada")

    if corrida.aceptada:
        raise HTTPException(status_code=400, detail="Esta corrida ya fue aceptada y no tiene alerta activa")

    # Registrar la acción correctiva en notas y marcar como aceptada (resuelta manualmente)
    corrida.notas_usuario = (corrida.notas_usuario or "") + f" | RESUELTO: {datos.accion_correctiva}"
    corrida.aceptada = True  # Marcamos como resuelta
    db.commit()
    db.refresh(corrida)

    return {"mensaje": "Alerta resuelta y acción correctiva registrada", "id_corrida": corrida_id}