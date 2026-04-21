# Archivo: app/main.py
"""
ARCHIVO PRINCIPAL: main.py
MISION: Punto de entrada y orquestador del servidor FastAPI.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importamos los enrutadores
from app.api import materiales, lotes, niveles, analitos, insertos, operarios, corridas # <-- Nueva conexión

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
app.include_router(insertos.router)
app.include_router(operarios.router)
app.include_router(corridas.router) # <-- Conexión de Corridas

# Ruta de prueba
@app.get("/")
def ruta_raiz():
    return {
        "estado": "Online",
        "mensaje": "¡El motor del backend de LabChart QC está encendido y funcionando!"
    }