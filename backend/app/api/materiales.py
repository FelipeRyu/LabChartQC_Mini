# Archivo: app/api/materiales.py
"""
MÓDULO DE RUTAS PARA MATERIALES DE CONTROL (API Endpoints)
==========================================================
Este archivo contiene las "puertas de entrada" a las que el Frontend (React) 
hará peticiones HTTP (GET, POST, PUT, DELETE).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# 1. Importamos nuestra función para conectarnos a la base de datos
from app.core.database import get_db

# 2. Importamos el Modelo (la tabla física en PostgreSQL)
from app.models.models import MaterialControl

# 3. Importamos los Esquemas (la validación de datos de Pydantic)
from app.schemas.materiales import MaterialControlCreate, MaterialControlResponse

# 4. Creamos el "Enrutador"
router = APIRouter(
    prefix="/api/materiales",
    tags=["Materiales de Control"]
)

# -------------------------------------------------------------------
# RUTA 1: CREAR UN NUEVO MATERIAL (Método POST) - ¡CON CAZADOR DE ERRORES!
# -------------------------------------------------------------------
@router.post("/", response_model=MaterialControlResponse, status_code=status.HTTP_201_CREATED)
def crear_material(
    material: MaterialControlCreate, 
    db: Session = Depends(get_db)    
):
    """
    Recibe los datos del Frontend, crea un nuevo material de control y lo guarda en la BD.
    Incluye manejo de excepciones para atrapar errores de base de datos.
    """
    try:
        # Intentamos hacer el guardado normal
        nuevo_material_db = MaterialControl(
            nombre_material=material.nombre_material,
            fabricante=material.fabricante,
            fecha_vencimiento=material.fecha_vencimiento,
            laboratorio_id=material.laboratorio_id,
            area_id=material.area_id
        )
        db.add(nuevo_material_db)
        db.commit()
        db.refresh(nuevo_material_db)
        return nuevo_material_db

    except Exception as e:
        # ¡Si algo sale mal, SQLAlchemy se asusta! 
        # Hacemos rollback para "deshacer" el intento y no bloquear la base de datos
        db.rollback()
        
        # ¡Y aquí está la magia! Le lanzamos el error exacto a la pantalla de Swagger
        raise HTTPException(
            status_code=500, 
            detail=f"¡Te atrapé fantasma! El error de la BD es: {str(e)}"
        )

# -------------------------------------------------------------------
# RUTA 2: OBTENER TODOS LOS MATERIALES (Método GET)
# -------------------------------------------------------------------
@router.get("/", response_model=List[MaterialControlResponse])
def obtener_materiales(db: Session = Depends(get_db)):
    """
    Devuelve una lista con todos los materiales de control.
    """
    materiales = db.query(MaterialControl).filter(MaterialControl.eliminado == False).all()
    return materiales