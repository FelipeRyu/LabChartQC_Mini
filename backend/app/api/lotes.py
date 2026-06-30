# Archivo: app/api/lotes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.models.models import Laboratorio, MaterialControl, LoteMaterial
from app.core.security import obtener_usuario_actual

router = APIRouter(tags=["Lotes de Material"])

# 1. Molde de datos que Swagger pedirá
class LoteCreate(BaseModel):
    numero_lote: str
    material_id: int
    # Lo dejamos opcional por si aún no has configurado los niveles
    nivel_control_id: Optional[int] = None 

# -------------------------------------------------------------------
# RUTA 1: CREAR UN NUEVO LOTE (Método POST)
# -------------------------------------------------------------------
@router.post("/api/lotes", status_code=status.HTTP_201_CREATED)
def crear_lote(
    datos: LoteCreate, 
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual) # ¡El Guardia!
):
    # 1. Buscar al dueño del carnet
    lab_actual = db.query(Laboratorio).filter(Laboratorio.email == email_usuario).first()
    if not lab_actual:
        raise HTTPException(status_code=404, detail="Laboratorio no encontrado")

    # 2. VALIDACIÓN DE SEGURIDAD (Candado doble): 
    # Comprobar que el material SÍ pertenece a este laboratorio
    material_existente = db.query(MaterialControl).filter(
        MaterialControl.id_material == datos.material_id,
        MaterialControl.laboratorio_id == lab_actual.id
    ).first()

    if not material_existente:
        raise HTTPException(
            status_code=403, 
            detail="Error de seguridad: El material no existe o pertenece a otro laboratorio"
        )

    try:
        # 3. Si pasó la seguridad, creamos el lote
        nuevo_lote = LoteMaterial(
            numero_lote=datos.numero_lote,
            material_id=datos.material_id,
            nivel_control_id=datos.nivel_control_id
        )
        
        db.add(nuevo_lote)
        db.commit()
        db.refresh(nuevo_lote)
        
        return {
            "mensaje": "Lote creado y asociado con éxito",
            "lote": {
                # OJO: Asumo que la columna se llama id_lote (como id_operario). 
                # Si te da error, cámbialo a nuevo_lote.id
                "id_lote": getattr(nuevo_lote, 'id_lote', getattr(nuevo_lote, 'id', None)), 
                "numero_lote": nuevo_lote.numero_lote
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en BD: {str(e)}")

# -------------------------------------------------------------------
# RUTA 2: OBTENER LOTES DE UN MATERIAL (Método GET)
# -------------------------------------------------------------------
@router.get("/api/lotes/{material_id}")
def obtener_lotes_por_material(
    material_id: int, 
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual)
):
    # 1. Buscar quién es el dueño del carnet
    lab_actual = db.query(Laboratorio).filter(Laboratorio.email == email_usuario).first()
    
    # 2. Candado doble: Verificar que tenga permiso de ver los lotes de este material
    material_existente = db.query(MaterialControl).filter(
        MaterialControl.id_material == material_id,
        MaterialControl.laboratorio_id == lab_actual.id
    ).first()

    if not material_existente:
        raise HTTPException(status_code=403, detail="No tienes acceso a este material")

    # 3. Traer solo los lotes de ese material
    lotes = db.query(LoteMaterial).filter(
        LoteMaterial.material_id == material_id, 
        LoteMaterial.eliminado == False
    ).all()
    
    return lotes