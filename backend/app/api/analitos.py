# Archivo: app/api/analitos.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.models import Analito
from app.schemas.analitos import AnalitoCreate, AnalitoResponse
from app.core.security import obtener_usuario_actual

router = APIRouter(tags=["Catálogo de Analitos"])

# -------------------------------------------------------------------
# RUTA 1: CREAR UN SOLO ANALITO (Método POST)
# -------------------------------------------------------------------
@router.post("/api/analitos", response_model=AnalitoResponse, status_code=status.HTTP_201_CREATED)
def crear_analito(
    analito: AnalitoCreate, 
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual) # El Guardia protege el catálogo
):
    """
    Registra un solo analito de forma individual en el diccionario maestro.
    """
    analito_existente = db.query(Analito).filter(Analito.nombre == analito.nombre).first()
    if analito_existente:
        raise HTTPException(status_code=400, detail="Ya existe un analito con ese nombre")
    
    nuevo_analito = Analito(**analito.model_dump())
    db.add(nuevo_analito)
    db.commit()
    db.refresh(nuevo_analito)
    return nuevo_analito

# -------------------------------------------------------------------
# RUTA 2: CARGA MASIVA DE ANALITOS (Método POST - Ruta Bulk)
# -------------------------------------------------------------------
@router.post("/api/analitos/bulk", status_code=status.HTTP_201_CREATED)
def crear_analitos_lote(
    analitos: List[AnalitoCreate], 
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual) # Optimización para el Excel
):
    """
    RUTA MAESTRA: Recibe una lista de analitos en una sola petición HTTP y los guarda 
    en bloque. Ideal para cargar de golpe los exámenes de tu base de datos inicial.
    """
    creados = 0
    ignorados = 0
    
    for item in analitos:
        # Quitamos espacios adicionales al principio o al final por seguridad
        nombre_limpio = item.nombre.strip()
        
        # Filtramos para evitar meter filas vacías accidentales del Excel
        if not nombre_limpio:
            ignorados += 1
            continue
            
        # Verificamos si ya existe para no duplicar en el catálogo
        existe = db.query(Analito).filter(Analito.nombre == nombre_limpio).first()
        if not existe:
            # Creamos el objeto mapeando los campos limpios
            datos_analito = item.model_dump()
            datos_analito["nombre"] = nombre_limpio
            
            nuevo = Analito(**datos_analito)
            db.add(nuevo)
            creados += 1
        else:
            ignorados += 1
            
    db.commit()
    return {
        "mensaje": "Proceso de carga masiva finalizado con éxito",
        "creados": creados,
        "ignorados_por_duplicados_o_vacios": ignorados
    }

# -------------------------------------------------------------------
# RUTA 3: OBTENER TODOS LOS ANALITOS (Método GET)
# -------------------------------------------------------------------
@router.get("/api/analitos", response_model=List[AnalitoResponse])
def obtener_analitos(
    db: Session = Depends(get_db),
    email_usuario: str = Depends(obtener_usuario_actual) # Protección contra accesos anónimos
):
    """
    Obtiene la lista completa de todos los analitos activos en el catálogo maestro.
    """
    return db.query(Analito).filter(Analito.activo == True).all()