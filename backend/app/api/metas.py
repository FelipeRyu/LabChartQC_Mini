from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import MetaCalidad
from app.schemas.metas import MetaCalidadCreate, MetaCalidadResponse
from typing import List

router = APIRouter(prefix="/api/metas", tags=["Metas de Calidad"])

@router.post("/", response_model=MetaCalidadResponse, status_code=status.HTTP_201_CREATED)
def crear_meta(meta: MetaCalidadCreate, db: Session = Depends(get_db)):
    nueva_meta = MetaCalidad(**meta.model_dump())
    db.add(nueva_meta)
    db.commit()
    db.refresh(nueva_meta)
    return nueva_meta

@router.get("/{analito_id}", response_model=List[MetaCalidadResponse])
def obtener_metas_por_analito(analito_id: int, db: Session = Depends(get_db)):
    return db.query(MetaCalidad).filter(MetaCalidad.analito_id == analito_id).all()