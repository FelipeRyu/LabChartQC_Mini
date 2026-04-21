# Archivo: app/api/corridas.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Corrida
from app.schemas.corridas import CorridaCreate, CorridaResponse # <-- ¡LA LÍNEA QUE FALTABA!

router = APIRouter(prefix="/api/corridas", tags=["Ingreso de Resultados (Corridas)"])

@router.post("/", response_model=CorridaResponse, status_code=status.HTTP_201_CREATED)
def registrar_corrida(corrida: CorridaCreate, db: Session = Depends(get_db)):
    """Registra un nuevo valor de control de calidad ingresado por un operario."""
    nueva_corrida = Corrida(**corrida.model_dump())
    db.add(nueva_corrida)
    db.commit()
    db.refresh(nueva_corrida)
    return nueva_corrida

@router.get("/inserto/{inserto_id}", response_model=List[CorridaResponse])
def obtener_corridas_por_inserto(inserto_id: int, db: Session = Depends(get_db)):
    """Trae todo el historial de resultados para una meta de control específica."""
    return db.query(Corrida).filter(Corrida.inserto_id == inserto_id).all()