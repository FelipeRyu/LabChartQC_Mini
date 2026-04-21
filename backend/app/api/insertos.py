# Archivo: app/api/insertos.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import InsertoValor
from app.schemas.insertos import InsertoCreate, InsertoResponse # <-- ¡LA LÍNEA QUE FALTABA!

router = APIRouter(prefix="/api/insertos", tags=["Valores de Inserto (Metas Teóricas)"])

@router.post("/", response_model=InsertoResponse, status_code=status.HTTP_201_CREATED)
def crear_inserto(inserto: InsertoCreate, db: Session = Depends(get_db)):
    """Crea los valores teóricos (Media y DS) para un analito dentro de un lote específico."""
    nuevo_inserto = InsertoValor(**inserto.model_dump())
    db.add(nuevo_inserto)
    db.commit()
    db.refresh(nuevo_inserto)
    return nuevo_inserto

@router.get("/lote/{lote_id}", response_model=List[InsertoResponse])
def obtener_insertos_por_lote(lote_id: int, db: Session = Depends(get_db)):
    """Trae todos los analitos y sus metas configuradas para un lote específico."""
    return db.query(InsertoValor).filter(InsertoValor.lote_id == lote_id, InsertoValor.activo == True).all()