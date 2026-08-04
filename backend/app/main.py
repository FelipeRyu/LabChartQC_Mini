# Archivo: app/main.py
"""
ARCHIVO PRINCIPAL: main.py
MISION: Punto de entrada y orquestador del servidor FastAPI.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importamos todos los enrutadores de forma limpia
from app.api import (
    auth,
    operarios,
    materiales, 
    lotes, 
    niveles, 
    analitos, 
    insertos, 
    corridas, 
    areas, 
    metas, 
    reglas,
    reportes,
    eventos
)

from app.core.database import engine
from app.models import models

# Esto crea las tablas automáticamente si no existen al iniciar
models.Base.metadata.create_all(bind=engine)

# Crear usuario inicial por defecto si la base de datos está vacía
from app.core.database import SessionLocal
from app.models.models import Laboratorio
from app.core.security import obtener_password_triturada

db = SessionLocal()
try:
    if not db.query(Laboratorio).first():
        usuario_demo = Laboratorio(
            nombre="Laboratorio San José",
            email="admin@laboratorio.com",
            hash_contrasena=obtener_password_triturada("admin123")
        )
        db.add(usuario_demo)
        db.commit()
        print("👤 Usuario demo 'admin@laboratorio.com' creado automáticamente.")
finally:
    db.close()

# 1. Instancia principal de la aplicación
app = FastAPI(title="LabChart QC API", version="1.0.0")

# 2. Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. CONECTAR LAS RUTAS (Sin duplicados)
app.include_router(auth.router)
app.include_router(operarios.router)
app.include_router(materiales.router)
app.include_router(lotes.router)
app.include_router(niveles.router)
app.include_router(analitos.router)
app.include_router(insertos.router)
app.include_router(corridas.router)
app.include_router(areas.router)
app.include_router(metas.router)
app.include_router(reglas.router)
app.include_router(reportes.router)
app.include_router(eventos.router)

# Ruta de prueba
@app.get("/")
def ruta_raiz():
    return {
        "estado": "Online",
        "mensaje": "¡El motor del backend de LabChart QC está encendido y funcionando con todas las tablas conectadas!"
    }