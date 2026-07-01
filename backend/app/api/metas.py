# Archivo: app/api/metas.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import InsertoValor
from app.core.security import obtener_usuario_actual

router = APIRouter(tags=["Metas de Calidad"])

@router.get("/api/metas/activas/{lote_id}/{analito_id}")
def obtener_meta_activa(
    lote_id: int,
    analito_id: int,
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual)
):
    """
    Herencia Automática: Dado un Lote y un Analito, el sistema busca
    y devuelve automáticamente la Media y Desviación Estándar configurada en el inserto.
    Esto alimenta el Frontend para que el operario no digite nada manualmente.
    """
    # Buscamos el inserto que cruza exactamente este lote con este analito
    meta = db.query(InsertoValor).filter(
        InsertoValor.lote_id == lote_id,
        InsertoValor.analito_id == analito_id
    ).first()

    if not meta:
        raise HTTPException(
            status_code=404, 
            detail="No hay metas configuradas para este Lote y Analito. Por favor, registre el Inserto primero."
        )

    return {
        "inserto_id": meta.id_inserto,
        "media_objetivo": meta.media_objetivo,
        "ds_objetivo": meta.ds_objetivo,
        "mensaje": "Metas heredadas exitosamente para la operación"
    }