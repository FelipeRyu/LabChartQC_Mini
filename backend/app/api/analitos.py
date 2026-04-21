# Archivo: app/api/analitos.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Analito
from app.schemas.analitos import AnalitoCreate, AnalitoResponse

router = APIRouter(prefix="/api/analitos", tags=["Catálogo de Analitos"])

@router.post("/", response_model=AnalitoResponse, status_code=status.HTTP_201_CREATED)
def crear_analito(analito: AnalitoCreate, db: Session = Depends(get_db)):
    """Crea un nuevo analito en el catálogo del laboratorio."""
    # Verificamos que no exista ya uno con ese nombre
    analito_existente = db.query(Analito).filter(Analito.nombre == analito.nombre).first()
    if analito_existente:
        raise HTTPException(status_code=400, detail="Ya existe un analito con ese nombre")
    
    nuevo_analito = Analito(**analito.model_dump())
    db.add(nuevo_analito)
    db.commit()
    db.refresh(nuevo_analito)
    return nuevo_analito

@router.get("/", response_model=List[AnalitoResponse])
def obtener_analitos(db: Session = Depends(get_db)):
    """Obtiene toda la lista de analitos activos."""
    return db.query(Analito).filter(Analito.activo == True).all()