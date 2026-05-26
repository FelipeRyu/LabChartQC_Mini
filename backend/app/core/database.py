# Archivo: app/core/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# --- CAMBIO CRÍTICO PARA DIAGNÓSTICO ---
# Vamos a usar la URL directamente. Si esto funciona, el problema era tu archivo .env
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:admin@localhost:5432/labchart_mini_db"

# Crear el "Motor"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"client_encoding": "utf8"}
)

# Crear la fábrica de Sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# La Clase Base
Base = declarative_base()

# Dependencia de la Base de Datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        