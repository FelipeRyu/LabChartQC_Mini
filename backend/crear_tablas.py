from app.core.database import engine, Base
# Importamos models para que SQLAlchemy lea todas las clases de la BD
from app.models import models 

print("Iniciando la construcción de tablas...")

# Esta es la líneaque traduce tus Clases de Python a tablas SQL en Postgres
Base.metadata.create_all(bind=engine)

print("¡Magia completada! Ya puedes ir a revisar DBeaver.")