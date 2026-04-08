"""
ARCHIVO: main.py
MISION: Punto de entrada y orquestador del servidor FastAPI.
RESPONSABILIDAD: 
1. Configurar la instancia de FastAPI y los middlewares (como CORS para React).
2. Conectar las rutas (routers) de la carpeta /api.
3. Gestionar el encendido y apagado de la base de datos.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. Instancia principal de la aplicación
app = FastAPI(title="LabChart QC API", version="1.0.0")

# 2. Configuración de CORS (Crucial para que React pueda hablar con Python)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite peticiones de cualquier origen (por ahora)
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, PUT, DELETE)
    allow_headers=["*"],
)

# Ruta de prueba para verificar que el servidor funciona
@app.get("/")
def ruta_raiz():
    return {
        "estado": "Online",
        "mensaje": "¡El motor del backend de LabChart QC está encendido y funcionando!"
    }