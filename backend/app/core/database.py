import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# --- PRODUCCIÓN / RENDER ---
# Leemos directamente del sistema. Si no existe, usamos fallback para entorno local.
SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL")

# Si estamos en local (sin variable), usamos el fallback
if not SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = "postgresql://postgres:admin@localhost:5432/labchart_mini_db"
    print("[BD] MODO LOCAL detectado. Conectando a localhost.")
else:
    host_info = SQLALCHEMY_DATABASE_URL.split("@")[1] if "@" in SQLALCHEMY_DATABASE_URL else "remota"
    print(f"[BD] MODO RENDER detectado. Conectando a DB: {host_info}")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"client_encoding": "utf8"}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()