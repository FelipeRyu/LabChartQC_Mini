# Archivo: app/core/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# --- CAMBIO PARA PRODUCCIÓN (RENDER) ---
# Leemos la URL desde las variables de entorno de Render. Si no existe, usamos la local.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:admin@localhost:5432/labchart_mini_db")

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
        