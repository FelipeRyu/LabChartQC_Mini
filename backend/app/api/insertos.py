# Archivo: app/api/insertos.py
"""
Gestión de Insertos (valores objetivos: Media y DS por lote/analito).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.core.database import get_db
from app.models.models import InsertoValor, LoteMaterial, MaterialControl, Laboratorio
from app.core.security import obtener_usuario_actual

router = APIRouter(tags=["Gestión de Insertos"])


class InsertoCreate(BaseModel):
    lote_id: int
    analito_id: int
    media_objetivo: float
    ds_objetivo: float


# Función auxiliar para no repetir código de buscar laboratorio
def obtener_lab_id(db: Session, email: str) -> Optional[int]:
    lab = db.query(Laboratorio).filter(Laboratorio.email == email).first()
    return lab.id if lab else None


# -------------------------------------------------------------------
# RUTA 1: CREAR UN INSERTO (POST)
# -------------------------------------------------------------------
@router.post("/api/insertos", status_code=status.HTTP_201_CREATED)
def crear_inserto(
    datos: InsertoCreate,
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual)
):
    lab_id = obtener_lab_id(db, email_usuario)
    if not lab_id:
        raise HTTPException(status_code=404, detail="Laboratorio no encontrado")

    # Seguridad: Verificar que el lote pertenezca a un material de este laboratorio
    lote_db = db.query(LoteMaterial).join(MaterialControl).filter(
        LoteMaterial.id_lote == datos.lote_id,
        MaterialControl.laboratorio_id == lab_id
    ).first()

    if not lote_db:
        raise HTTPException(status_code=403, detail="Lote no encontrado o sin acceso")

    # Guardar valores
    nuevo_inserto = InsertoValor(
        lote_id=datos.lote_id,
        analito_id=datos.analito_id,
        media_objetivo=datos.media_objetivo,
        ds_objetivo=datos.ds_objetivo
    )
    db.add(nuevo_inserto)
    db.commit()
    db.refresh(nuevo_inserto)
    return {"mensaje": "Valores de inserto registrados correctamente", "id_inserto": nuevo_inserto.id_inserto}


# -------------------------------------------------------------------
# RUTA 2: OBTENER INSERTOS DE UN LOTE ESPECÍFICO (GET)
# -------------------------------------------------------------------
@router.get("/api/insertos/lote/{lote_id}")
def obtener_insertos_por_lote(
    lote_id: int,
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual)
):
    """Devuelve todos los insertos (media/DS de analitos) configurados para un lote."""
    lab_id = obtener_lab_id(db, email_usuario)
    if not lab_id:
        raise HTTPException(status_code=404, detail="Laboratorio no encontrado")

    # Verificar acceso: el lote debe pertenecer al laboratorio del usuario
    lote_db = db.query(LoteMaterial).join(MaterialControl).filter(
        LoteMaterial.id_lote == lote_id,
        MaterialControl.laboratorio_id == lab_id
    ).first()

    if not lote_db:
        raise HTTPException(status_code=403, detail="Lote no encontrado o sin acceso")

    insertos = db.query(InsertoValor).filter(
        InsertoValor.lote_id == lote_id,
        InsertoValor.activo == True
    ).all()

    return insertos


# -------------------------------------------------------------------
# RUTA 3: BUSCAR INSERTO POR ANALITO Y NOMBRE DE LOTE (GET)
# Usado por el frontend al guardar corridas para encontrar el inserto_id correcto
# -------------------------------------------------------------------
@router.get("/api/insertos/por-analito-nivel")
def buscar_inserto_por_analito_nivel(
    analito_id: int,
    lote_nombre: str,
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual)
):
    """
    Busca el inserto_id correspondiente a un analito y número de lote.
    El frontend necesita este endpoint para enviar corridas al backend.
    """
    lab_id = obtener_lab_id(db, email_usuario)
    if not lab_id:
        raise HTTPException(status_code=404, detail="Laboratorio no encontrado")

    inserto = db.query(InsertoValor).join(LoteMaterial).join(MaterialControl).filter(
        InsertoValor.analito_id == analito_id,
        LoteMaterial.numero_lote == lote_nombre,
        MaterialControl.laboratorio_id == lab_id,
        InsertoValor.activo == True
    ).first()

    if not inserto:
        raise HTTPException(
            status_code=404,
            detail=f"No se encontró inserto para analito {analito_id} en lote '{lote_nombre}'"
        )

    return [inserto]  # Devolvemos lista para compatibilidad con el frontend