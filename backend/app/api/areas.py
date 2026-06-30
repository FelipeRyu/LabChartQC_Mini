from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import AreaLaboratorio
from app.schemas.areas import AreaCreate, AreaResponse
from typing import List

router = APIRouter(prefix="/api/areas", tags=["Áreas del Laboratorio"])

@router.post("/", response_model=AreaResponse, status_code=status.HTTP_201_CREATED)
def crear_area(area: AreaCreate, db: Session = Depends(get_db)):
    nueva_area = AreaLaboratorio(**area.model_dump())
    db.add(nueva_area)
    db.commit()
    db.refresh(nueva_area)
    return nueva_area

@router.get("/", response_model=List[AreaResponse])
def obtener_areas(db: Session = Depends(get_db)):
    return db.query(AreaLaboratorio).all()