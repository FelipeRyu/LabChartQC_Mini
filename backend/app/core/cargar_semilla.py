# Archivo: app/core/cargar_semilla.py
import os
import glob
from sqlalchemy import text
from sqlalchemy.orm import Session

# Tablas del sistema en orden estricto de dependencias (se omite alembic_version)
ARCHIVOS_ORDENADOS = [
    "laboratorios",
    "operarios",
    "areas_laboratorio",
    "analitos",
    "materiales_control",
    "lotes_material",
    "niveles_control",
    "inserto_valores",
    "reglas_westgard",
    "corridas"
]

# Mapa exacto de tabla a su columna Primary Key
TABLAS_PK = {
    "laboratorios": "id",
    "operarios": "id_operario",
    "areas_laboratorio": "id",
    "analitos": "id_analito",
    "materiales_control": "id_material",
    "lotes_material": "id_lote",
    "niveles_control": "id",
    "inserto_valores": "id_inserto",
    "reglas_westgard": "id_regla",
    "corridas": "id_corrida"
}

def cargar_datos_semilla_si_esta_vacio(db: Session):
    try:
        from app.models.models import Analito
        if db.query(Analito).count() > 0:
            print("🌱 La base de datos ya contiene analitos. Omitiendo carga de semilla.")
            return
    except Exception as e:
        print(f"⚠️ Error al verificar datos existentes: {e}")

    dir_semilla = os.path.join(os.path.dirname(__file__), "..", "..", "datos_semilla")
    if not os.path.exists(dir_semilla):
        print(f"⚠️ Directorio de datos semilla no encontrado en: {dir_semilla}")
        return

    print("🚀 Iniciando la carga de datos semilla desde los archivos SQL...")

    for prefijo in ARCHIVOS_ORDENADOS:
        archivos = glob.glob(os.path.join(dir_semilla, f"{prefijo}_*.sql"))
        if not archivos:
            continue
        
        archivo_sql = archivos[0]
        try:
            with open(archivo_sql, "r", encoding="utf-8") as f:
                sql_content = f.read().strip()
                if sql_content:
                    db.execute(text(sql_content))
                    db.commit()
                    print(f"✅ Carga exitosa: {os.path.basename(archivo_sql)}")
        except Exception as err:
            db.rollback()
            print(f"⚠️ Nota en {os.path.basename(archivo_sql)}: {err}")

    # Ajustar las secuencias autoincrementales respetando el nombre exacto de la PK de cada tabla
    for tabla, pk_col in TABLAS_PK.items():
        try:
            sql_seq = f"SELECT setval(pg_get_serial_sequence('{tabla}', '{pk_col}'), COALESCE((SELECT MAX({pk_col}) FROM {tabla}), 1));"
            db.execute(text(sql_seq))
            db.commit()
        except Exception:
            db.rollback()

    print("🎉 ¡Carga de datos semilla finalizada!")
