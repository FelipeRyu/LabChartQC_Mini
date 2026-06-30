from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import ReglaWestgard
from app.schemas.reglas import ReglaWestgardCreate, ReglaWestgardResponse
from typing import List

router = APIRouter(prefix="/api/reglas", tags=["Configuración de Reglas"])

@router.post("/", response_model=ReglaWestgardResponse, status_code=status.HTTP_201_CREATED)
def crear_regla(regla: ReglaWestgardCreate, db: Session = Depends(get_db)):
    nueva_regla = ReglaWestgard(**regla.model_dump())
    db.add(nueva_regla)
    db.commit()
    db.refresh(nueva_regla)
    return nueva_regla

@router.get("/", response_model=List[ReglaWestgardResponse])
def obtener_reglas(db: Session = Depends(get_db)):
    return db.query(ReglaWestgard).all()