# Archivo: app/api/niveles.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import NivelControl
from app.schemas.niveles import NivelControlResponse

router = APIRouter(prefix="/api/niveles", tags=["Niveles de Control"])

@router.get("/", response_model=List[NivelControlResponse])
def obtener_niveles(db: Session = Depends(get_db)):
    """
    Obtiene la lista de niveles de control estáticos (Ej: Nivel 1, Nivel 2, Nivel 3).
    Esto alimenta los menús desplegables del Frontend.
    """
    return db.query(NivelControl).all()