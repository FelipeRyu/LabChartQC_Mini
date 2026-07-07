# Archivo: app/api/materiales.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List
from datetime import date

from app.core.database import get_db
from app.models.models import Laboratorio, MaterialControl, LoteMaterial, InsertoValor, NivelControl
from app.core.security import obtener_usuario_actual

router = APIRouter(tags=["Materiales de Control"])

# ==========================================
# MOLDES EXACTOS PARA RECIBIR DEL FRONTEND
# ==========================================
class AnalitoConfig(BaseModel):
    analito_id: int
    unidad: str
    media: float
    ds: float

class NivelConfig(BaseModel):
    nivel: int
    lote: str
    analitosConfigurados: List[AnalitoConfig]

class MaterialCreateCompleto(BaseModel):
    nombre_material: str
    fabricante: str
    fecha_vencimiento: date
    area_id: int
    niveles: List[NivelConfig]

# ==========================================
# RUTAS DE LA API
# ==========================================
@router.post("/api/materiales", status_code=status.HTTP_201_CREATED)
def crear_material_completo(
    datos: MaterialCreateCompleto, 
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual)
):
    lab_actual = db.query(Laboratorio).filter(Laboratorio.email == email_usuario).first()
    if not lab_actual:
        raise HTTPException(status_code=404, detail="Laboratorio no encontrado")

    try:
        # 1. ANTIDUPLICADOS: Buscar si ya existe el material (ignorando mayúsculas/minúsculas)
        nombre_norm = datos.nombre_material.strip().upper()
        fab_norm = datos.fabricante.strip().upper()

        material_existente = db.query(MaterialControl).filter(
            func.upper(MaterialControl.nombre_material) == nombre_norm,
            func.upper(MaterialControl.fabricante) == fab_norm,
            MaterialControl.laboratorio_id == lab_actual.id
        ).first()

        if material_existente:
            nuevo_material = material_existente
            nuevo_material.fecha_vencimiento = datos.fecha_vencimiento
        else:
            nuevo_material = MaterialControl(
                nombre_material=datos.nombre_material.strip(),
                fabricante=datos.fabricante.strip(),
                fecha_vencimiento=datos.fecha_vencimiento,
                area_id=datos.area_id,
                laboratorio_id=lab_actual.id
            )
            db.add(nuevo_material)
            db.flush()

        # 2. GUARDAR LOTES Y NIVELES
        for nivel_data in datos.niveles:
            nivel_bd = db.query(NivelControl).filter(NivelControl.id == nivel_data.nivel).first()
            nivel_id_real = nivel_bd.id if nivel_bd else nivel_data.nivel

            nuevo_lote = LoteMaterial(
                material_id=nuevo_material.id_material,
                numero_lote=nivel_data.lote.strip().upper(),
                nivel_control_id=nivel_id_real
            )
            db.add(nuevo_lote)
            db.flush()

            # 3. GUARDAR INSERTOS (Media y DS)
            for analito_data in nivel_data.analitosConfigurados:
                nuevo_inserto = InsertoValor(
                    lote_id=nuevo_lote.id_lote,
                    analito_id=analito_data.analito_id,
                    media_objetivo=analito_data.media,
                    ds_objetivo=analito_data.ds
                )
                db.add(nuevo_inserto)

        db.commit()
        return {"mensaje": "Material guardado con éxito"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en BD: {str(e)}")

@router.get("/api/materiales")
def obtener_mis_materiales(
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual)
):
    lab_actual = db.query(Laboratorio).filter(Laboratorio.email == email_usuario).first()
    return db.query(MaterialControl).filter(
        MaterialControl.laboratorio_id == lab_actual.id,
        MaterialControl.eliminado == False
    ).all()