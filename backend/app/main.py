# Archivo: app/main.py
"""
ARCHIVO PRINCIPAL: main.py
MISION: Punto de entrada y orquestador del servidor FastAPI.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importamos los enrutadores
from app.api import materiales
from app.api import lotes
from app.api import niveles
from app.api import analitos
from app.api import insertos # <-- Nuevo Módulo

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

# 3. CONECTAR LAS RUTAS
app.include_router(materiales.router)
app.include_router(lotes.router)
app.include_router(niveles.router)
app.include_router(analitos.router)
app.include_router(insertos.router) # <-- Conexión

# Ruta de prueba
@app.get("/")
def ruta_raiz():
    return {
        "estado": "Online",
        "mensaje": "¡El motor del backend de LabChart QC está encendido!"
    }