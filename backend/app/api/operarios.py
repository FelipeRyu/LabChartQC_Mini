# Archivo: app/api/operarios.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Operario
from app.schemas.operarios import OperarioCreate, OperarioResponse

router = APIRouter(prefix="/api/operarios", tags=["Gestión de Operarios"])

@router.post("/", response_model=OperarioResponse, status_code=status.HTTP_201_CREATED)
def registrar_operario(operario: OperarioCreate, db: Session = Depends(get_db)):
    """Registra un nuevo bacteriólogo o técnico en el sistema."""
    # Verificamos si ya existe alguien con esa identificación
    existente = db.query(Operario).filter(Operario.identificacion == operario.identificacion).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un operario con esta identificación")
    
    nuevo_operario = Operario(**operario.model_dump())
    db.add(nuevo_operario)
    db.commit()
    db.refresh(nuevo_operario)
    return nuevo_operario

@router.get("/{lab_id}", response_model=List[OperarioResponse])
def listar_operarios_por_laboratorio(lab_id: int, db: Session = Depends(get_db)):
    """Obtiene la lista de operarios vinculados a un laboratorio específico."""
    return db.query(Operario).filter(Operario.laboratorio_id == lab_id, Operario.activo == True).all()