# Archivo: app/core/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# 1. Cargar los secretos de tu archivo .env
load_dotenv()

# 2. Obtener la URL de conexión que guardaste
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# 3. Crear el "Motor". Es el encargado de establecer la conexión real con PostgreSQL
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 4. Crear la fábrica de Sesiones. Cada vez que hagamos una consulta, abriremos una "sesión"
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 5. La Clase Base. De aquí heredarán todas tus tablas (modelos)
Base = declarative_base()

# --- PRUEBA TEMPORAL ---
if __name__ == "__main__":
    try:
        # Intentamos conectarnos a la base de datos
        conexion = engine.connect()
        print("¡ÉXITO TOTAL! Conexión a la base de datos labchart_mini_db establecida. Eres una crack.")
        conexion.close()
    except Exception as e:
        print(f"Error al conectar: {e}")