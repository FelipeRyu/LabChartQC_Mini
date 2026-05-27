# Archivo: app/api/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import Laboratorio

# Importamos la nueva función del guardia
from app.core.security import (
    verificar_password, 
    crear_carnet_digital, 
    obtener_password_triturada,
    obtener_usuario_actual
)

router = APIRouter(tags=["Seguridad y Acceso"])

class LaboratorioRegistro(BaseModel):
    nombre: str
    email: str
    password: str

@router.post("/api/registro", status_code=status.HTTP_201_CREATED)
def registrar_laboratorio(datos: LaboratorioRegistro, db: Session = Depends(get_db)):
    pass_a_procesar = datos.password
    if len(pass_a_procesar) > 72:
        pass_a_procesar = pass_a_procesar[:72]
        
    usuario_existente = db.query(Laboratorio).filter(Laboratorio.email == datos.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="Este correo ya está registrado")
    
    password_segura = obtener_password_triturada(pass_a_procesar)
    
    nuevo_lab = Laboratorio(
        nombre=datos.nombre,
        email=datos.email,
        hash_contrasena=password_segura
    )
    
    db.add(nuevo_lab)
    db.commit()
    db.refresh(nuevo_lab)
    return {"mensaje": f"Laboratorio '{datos.nombre}' registrado con éxito."}

@router.post("/api/login")
def iniciar_sesion(credenciales: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    pass_login = credenciales.password
    if len(pass_login) > 72:
        pass_login = pass_login[:72]
    
    usuario = db.query(Laboratorio).filter(Laboratorio.email == credenciales.username).first()
    if not usuario or not verificar_password(pass_login, usuario.hash_contrasena):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
        
    token = crear_carnet_digital({"sub": usuario.email})
    return {"access_token": token, "token_type": "bearer"}

# --- LA NUEVA PUERTA CON CANDADO ---
@router.get("/api/perfil")
def ver_mi_perfil(email_usuario: str = Depends(obtener_usuario_actual)):
    """
    Ruta protegida. Solo puedes ejecutarla si el candado de Swagger está cerrado con un Token válido.
    """
    return {
        "mensaje": "¡El candado funciona! Entraste a la zona segura.", 
        "usuario_conectado": email_usuario
    }