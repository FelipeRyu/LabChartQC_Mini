# Archivo: app/core/security.py

from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# --- NUEVO: El Lector de Carnets ---
# Esto hace aparecer el botón "Authorize" en Swagger y le dice dónde buscar la llave.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
SECRET_KEY = "firma_super_secreta_de_labchart_qc_no_compartir" 
ALGORITHM = "HS256"
MINUTOS_EXPIRACION_CARNET = 480 

def obtener_password_triturada(password: str) -> str:
    return pwd_context.hash(password)

def verificar_password(password_normal: str, password_guardada: str) -> bool:
    return pwd_context.verify(password_normal, password_guardada)

def crear_carnet_digital(datos_usuario: dict, tiempo_extra: Optional[timedelta] = None):
    datos_a_guardar = datos_usuario.copy()
    if tiempo_extra:
        fecha_vencimiento = datetime.utcnow() + tiempo_extra
    else:
        fecha_vencimiento = datetime.utcnow() + timedelta(minutes=MINUTOS_EXPIRACION_CARNET)
    
    datos_a_guardar.update({"exp": fecha_vencimiento})
    return jwt.encode(datos_a_guardar, SECRET_KEY, algorithm=ALGORITHM)

# --- NUEVO: El Guardia de los Pasillos ---
def obtener_usuario_actual(token: str = Depends(oauth2_scheme)):
    """Esta función se pone en las puertas cerradas para leer el Token del usuario."""
    try:
        # Intentamos leer el carnet con nuestra firma secreta
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Carnet inválido")
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="El carnet ya se venció")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Carnet falso o corrupto")