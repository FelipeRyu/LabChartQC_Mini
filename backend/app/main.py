# Archivo: app/main.py
"""
ARCHIVO PRINCIPAL: main.py
MISION: Punto de entrada y orquestador del servidor FastAPI.
RESPONSABILIDAD:
1. Configurar la instancia de FastAPI y los middlewares (como CORS para React).
2. Conectar las rutas (routers) de la carpeta /api.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importamos los enrutadores
from app.api import materiales
from app.api import lotes
from app.api import niveles

# 1. Instancia principal de la aplicación
app = FastAPI(title="LabChart QC API", version="1.0.0")

# 2. Configuración de CORS (Crucial para que React pueda hablar con Python sin bloqueos)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite peticiones de cualquier origen (por ahora, luego lo limitaremos)
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, PUT, DELETE)
    allow_headers=["*"],
)

# 3. CONECTAR LAS RUTAS (Aquí agregamos los archivos al servidor)
app.include_router(materiales.router)
app.include_router(lotes.router)
app.include_router(niveles.router)

# Ruta de prueba para verificar que el servidor base funciona
@app.get("/")
def ruta_raiz():
    return {
        "estado": "Online",
        "mensaje": "¡El motor del backend de LabChart QC está encendido y funcionando!"
    }