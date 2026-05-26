# Archivo: app/core/security.py

from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext

# CAMBIO: Usamos "argon2" en lugar de "bcrypt". 
# Argon2 es más moderno y no tiene el límite de 72 caracteres.
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def obtener_password_triturada(password: str) -> str:
    """Toma la contraseña y la tritura con Argon2."""
    return pwd_context.hash(password)

def verificar_password(password_normal: str, password_guardada: str) -> bool:
    """Verifica la contraseña usando Argon2."""
    return pwd_context.verify(password_normal, password_guardada)

SECRET_KEY = "firma_super_secreta_de_labchart_qc_no_compartir" 
ALGORITHM = "HS256"
MINUTOS_EXPIRACION_CARNET = 480 

def crear_carnet_digital(datos_usuario: dict, tiempo_extra: Optional[timedelta] = None):
    datos_a_guardar = datos_usuario.copy()
    if tiempo_extra:
        fecha_vencimiento = datetime.utcnow() + tiempo_extra
    else:
        fecha_vencimiento = datetime.utcnow() + timedelta(minutes=MINUTOS_EXPIRACION_CARNET)
    
    datos_a_guardar.update({"exp": fecha_vencimiento})
    return jwt.encode(datos_a_guardar, SECRET_KEY, algorithm=ALGORITHM)