# Archivo: app/api/operarios.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.models.models import Laboratorio, Operario
from app.core.security import obtener_usuario_actual

router = APIRouter(tags=["Gestión de Operarios"])

# Molde de datos que el usuario debe enviar desde Swagger
class OperarioCreate(BaseModel):
    nombre_completo: str
    identificacion: str

@router.post("/api/operarios", status_code=status.HTTP_201_CREATED)
def crear_operario(
    datos: OperarioCreate, 
    db: Session = Depends(get_db), 
    email_usuario: str = Depends(obtener_usuario_actual) # ¡El Guardia!
):
    # 1. Buscar quién es el dueño del carnet
    lab_actual = db.query(Laboratorio).filter(Laboratorio.email == email_usuario).first()
    if not lab_actual:
        raise HTTPException(status_code=404, detail="Laboratorio no encontrado")

    # 2. Crear el operario asignándole el ID del laboratorio automáticamente
    nuevo_operario = Operario(
        nombre_completo=datos.nombre_completo,
        identificacion=datos.identificacion,
        laboratorio_id=lab_actual.id  # Magia: se asigna solo
    )

    db.add(nuevo_operario)
    db.commit()
    db.refresh(nuevo_operario)

    # 3. Respuesta con el nombre correcto de la columna (id_operario)
    return {
        "mensaje": "Operario creado con éxito", 
        "operario": {
            "id_operario": nuevo_operario.id_operario, 
            "nombre": nuevo_operario.nombre_completo
        }
    }

@router.get("/api/operarios")
def listar_mis_operarios(
    db: Session = Depends(get_db), 
    email_usuario: str = Depends(obtener_usuario_actual)
):
    # 1. Buscar quién es el dueño del carnet
    lab_actual = db.query(Laboratorio).filter(Laboratorio.email == email_usuario).first()
    
    # 2. Traer SOLO los operarios de este laboratorio
    mis_operarios = db.query(Operario).filter(Operario.laboratorio_id == lab_actual.id).all()
    
    return mis_operarios