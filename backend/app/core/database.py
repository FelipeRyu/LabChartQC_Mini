# Archivo: app/core/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# 1. Cargar los secretos de tu archivo .env
load_dotenv()

# 2. Obtener la URL de conexión que guardaste
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# 3. Crear el "Motor". Añadimos connect_args para forzar la traducción a UTF-8
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"client_encoding": "utf8"}
)

# 4. Crear la fábrica de Sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 5. La Clase Base
Base = declarative_base()

# 6. DEPENDENCIA DE LA BASE DE DATOS
# Su misión es abrir la puerta de la BD cuando la API lo pide, y cerrarla cuando termina.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        