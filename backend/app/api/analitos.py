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
    """Crea un solo analito (el que ya teníamos)."""
    analito_existente = db.query(Analito).filter(Analito.nombre == analito.nombre).first()
    if analito_existente:
        raise HTTPException(status_code=400, detail="Ya existe un analito con ese nombre")
    
    nuevo_analito = Analito(**analito.model_dump())
    db.add(nuevo_analito)
    db.commit()
    db.refresh(nuevo_analito)
    return nuevo_analito

@router.post("/bulk", status_code=status.HTTP_201_CREATED)
def crear_analitos_lote(analitos: List[AnalitoCreate], db: Session = Depends(get_db)):
    """
    RUTA MAESTRA: Recibe una lista de analitos y los guarda todos de una vez.
    Ideal para cargar los 90 elementos del Excel.
    """
    creados = 0
    ignorados = 0
    
    for item in analitos:
        # Verificamos si ya existe para no duplicar
        existe = db.query(Analito).filter(Analito.nombre == item.nombre).first()
        if not existe:
            nuevo = Analito(**item.model_dump())
            db.add(nuevo)
            creados += 1
        else:
            ignorados += 1
            
    db.commit()
    return {
        "mensaje": "Proceso de carga masiva finalizado",
        "creados": creados,
        "ignorados_por_duplicados": ignorados
    }

@router.get("/", response_model=List[AnalitoResponse])
def obtener_analitos(db: Session = Depends(get_db)):
    """Obtiene toda la lista de analitos activos."""
    return db.query(Analito).filter(Analito.activo == True).all()