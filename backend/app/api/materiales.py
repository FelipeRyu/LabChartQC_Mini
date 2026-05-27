# Archivo: app/api/materiales.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date

from app.core.database import get_db
from app.models.models import Laboratorio, MaterialControl
from app.core.security import obtener_usuario_actual

router = APIRouter(tags=["Materiales de Control"])

# 1. Molde de datos (Swagger pedirá esto). 
# ¡Ojo! Ya no pedimos el laboratorio_id porque lo sacamos del carnet.
class MaterialCreate(BaseModel):
    nombre_material: str
    fabricante: str
    fecha_vencimiento: date
    # area_id lo dejamos opcional por si aún no has creado áreas en tu base de datos
    area_id: Optional[int] = None 

# -------------------------------------------------------------------
# RUTA 1: CREAR UN NUEVO MATERIAL (Método POST)
# -------------------------------------------------------------------
@router.post("/api/materiales", status_code=status.HTTP_201_CREATED)
def crear_material(
    datos: MaterialCreate, 
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual) # ¡El Guardia!
):
    # 1. Buscar al dueño del carnet
    lab_actual = db.query(Laboratorio).filter(Laboratorio.email == email_usuario).first()
    if not lab_actual:
        raise HTTPException(status_code=404, detail="Laboratorio no encontrado")

    try:
        # 2. Crear material asignando el laboratorio automáticamente
        nuevo_material = MaterialControl(
            nombre_material=datos.nombre_material,
            fabricante=datos.fabricante,
            fecha_vencimiento=datos.fecha_vencimiento,
            area_id=datos.area_id,
            laboratorio_id=lab_actual.id  # Magia de seguridad
        )
        
        db.add(nuevo_material)
        db.commit()
        db.refresh(nuevo_material)
        
        return {
            "mensaje": "Material de control creado con éxito",
            "material": {
                "id_material": nuevo_material.id_material,
                "nombre": nuevo_material.nombre_material,
                "fabricante": nuevo_material.fabricante
            }
        }

    except Exception as e:
        # Hacemos rollback para "deshacer" el intento y no bloquear la base de datos
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en BD: {str(e)}")

# -------------------------------------------------------------------
# RUTA 2: OBTENER MIS MATERIALES (Método GET)
# -------------------------------------------------------------------
@router.get("/api/materiales")
def obtener_mis_materiales(
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual)
):
    # 1. Buscar quién es el dueño del carnet
    lab_actual = db.query(Laboratorio).filter(Laboratorio.email == email_usuario).first()
    
    # 2. Traer SOLO los materiales que pertenecen a esta clínica
    materiales = db.query(MaterialControl).filter(
        MaterialControl.laboratorio_id == lab_actual.id,
        MaterialControl.eliminado == False
    ).all()
    
    return materiales