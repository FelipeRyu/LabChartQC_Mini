# Archivo: app/api/materiales.py
"""
MÓDULO DE RUTAS PARA MATERIALES DE CONTROL (API Endpoints)
==========================================================
Este archivo contiene las "puertas de entrada" a las que el Frontend (React) 
hará peticiones HTTP (GET, POST, PUT, DELETE).

Aquí unimos todo el ecosistema: recibimos el JSON (validado por el Schema),
hacemos la operación en la Base de Datos (usando el Modelo y SQLAlchemy) 
y devolvemos la respuesta final.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# 1. Importamos nuestra función para conectarnos a la base de datos
from app.core.database import get_db

# 2. Importamos el Modelo (¡Ruta corregida! Carpeta models -> Archivo models.py)
from app.models.models import MaterialControl

# 3. Importamos los Esquemas (la validación de datos de Pydantic)
from app.schemas.materiales import MaterialControlCreate, MaterialControlResponse

# 4. Creamos el "Enrutador"
# prefix: Todas las URLs de este archivo empezarán con "/api/materiales"
# tags: Sirve para organizar visualmente la documentación automática (Swagger)
router = APIRouter(
    prefix="/api/materiales",
    tags=["Materiales de Control"]
)

# -------------------------------------------------------------------
# RUTA 1: CREAR UN NUEVO MATERIAL (Método POST)
# -------------------------------------------------------------------
@router.post("/", response_model=MaterialControlResponse, status_code=status.HTTP_201_CREATED)
def crear_material(
    material: MaterialControlCreate, # FastAPI lee el JSON entrante y lo valida con este esquema
    db: Session = Depends(get_db)    # Pedimos una conexión abierta a la base de datos
):
    """
    Recibe los datos del Frontend, crea un nuevo material de control y lo guarda en la BD.
    """
    # A. Transformamos los datos del esquema Pydantic a un modelo SQLAlchemy
    nuevo_material_db = MaterialControl(
        nombre_material=material.nombre_material,
        fabricante=material.fabricante,
        fecha_vencimiento=material.fecha_vencimiento,
        laboratorio_id=material.laboratorio_id,
        area_id=material.area_id
    )

    # B. Añadimos el nuevo registro a la "sala de espera" de la base de datos
    db.add(nuevo_material_db)

    # C. Guardamos (hacemos commit) los cambios permanentemente en PostgreSQL
    db.commit()

    # D. Refrescamos el objeto para obtener el ID real que le asignó PostgreSQL
    db.refresh(nuevo_material_db)

    # E. FastAPI convierte este modelo automáticamente al esquema 'MaterialControlResponse'
    return nuevo_material_db

# -------------------------------------------------------------------
# RUTA 2: OBTENER TODOS LOS MATERIALES (Método GET)
# -------------------------------------------------------------------
@router.get("/", response_model=List[MaterialControlResponse])
def obtener_materiales(db: Session = Depends(get_db)):
    """
    Devuelve una lista con todos los materiales de control.
    """
    # Hacemos una consulta (query) a la tabla MaterialControl.
    # Usamos el filtro 'eliminado == False' para no traer los que han sido borrados de forma lógica.
    materiales = db.query(MaterialControl).filter(MaterialControl.eliminado == False).all()

    return materiales