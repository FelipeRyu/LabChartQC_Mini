# Archivo: app/api/insertos.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.core.database import get_db
from app.models.models import InsertoValor, LoteMaterial, MaterialControl
from app.core.security import obtener_usuario_actual

router = APIRouter(tags=["Gestión de Insertos"])

class InsertoCreate(BaseModel):
    lote_id: int
    analito_id: int
    media_objetivo: float
    ds_objetivo: float

@router.post("/api/insertos", status_code=status.HTTP_201_CREATED)
def crear_inserto(
    datos: InsertoCreate,
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual)
):
    # 1. Seguridad: Verificar que el lote pertenezca a un material de este laboratorio
    lote_db = db.query(LoteMaterial).join(MaterialControl).filter(
        LoteMaterial.id_lote == datos.lote_id,
        MaterialControl.laboratorio_id == obtener_lab_id(db, email_usuario)
    ).first()

    if not lote_db:
        raise HTTPException(status_code=403, detail="Lote no encontrado o sin acceso")

    # 2. Guardar valores
    nuevo_inserto = InsertoValor(**datos.model_dump())
    db.add(nuevo_inserto)
    db.commit()
    return {"mensaje": "Valores de inserto registrados correctamente"}

# Función auxiliar para no repetir código de buscar laboratorio
def obtener_lab_id(db, email):
    from app.models.models import Laboratorio
    lab = db.query(Laboratorio).filter(Laboratorio.email == email).first()
    return lab.id if lab else None