from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import LoteMaterial
from app.schemas.lotes import LoteCreate, LoteResponse
from typing import List

router = APIRouter(prefix="/api/lotes", tags=["Lotes de Material"])

@router.post("/", response_model=LoteResponse, status_code=status.HTTP_201_CREATED)
def crear_lote(lote: LoteCreate, db: Session = Depends(get_db)):
    """Crea un nuevo lote asociándolo a un material existente"""
    try:
        nuevo_lote = LoteMaterial(
            numero_lote=lote.numero_lote,
            material_id=lote.material_id,
            nivel_control_id=lote.nivel_control_id
        )
        db.add(nuevo_lote)
        db.commit()
        db.refresh(nuevo_lote)
        return nuevo_lote
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en BD: {str(e)}")

@router.get("/{material_id}", response_model=List[LoteResponse])
def obtener_lotes_por_material(material_id: int, db: Session = Depends(get_db)):
    """Trae todos los lotes que le pertenecen a un ID de material específico"""
    return db.query(LoteMaterial).filter(
        LoteMaterial.material_id == material_id, 
        LoteMaterial.eliminado == False
    ).all()